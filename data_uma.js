import fs from "fs";
import zlib from "zlib";
import crypto from "crypto";
import { Agent } from "undici";
import "dotenv/config";

const YT_ORIGIN = "https://www.youtube.com";
const ACCOUNT_INDEX = process.env.ACCOUNT_INDEX ?? "0";

/** Cookie ヘッダから特定の Cookie 値を取り出す */
function getCookieValue(name) {
    const cookie = process.env.COOKIE ?? "";
    const esc = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const m = cookie.match(new RegExp(`(?:^|;\\s*)${esc}=([^;]+)`));
    return m?.[1];
}

/** SAPISID / __Secure-1PAPISID / __Secure-3PAPISID から現在時刻の SAPISIDHASH ヘッダを作る */
function buildAuthorizationHeader() {
    const sapisid = getCookieValue("SAPISID");
    const sapisid1p = getCookieValue("__Secure-1PAPISID") ?? sapisid;
    const sapisid3p = getCookieValue("__Secure-3PAPISID") ?? sapisid;
    if (!sapisid) {
        throw new Error(".env の COOKIE に SAPISID が含まれていません。Cookie を取り直してください。");
    }
    const ts = Math.floor(Date.now() / 1000);
    const h = (s) =>
        crypto.createHash("sha1").update(`${ts} ${s} ${YT_ORIGIN}`).digest("hex");
    return `SAPISIDHASH ${ts}_${h(sapisid)}_u SAPISID1PHASH ${ts}_${h(sapisid1p)}_u SAPISID3PHASH ${ts}_${h(sapisid3p)}_u`;
}

/** YouTube への TLS 接続が遅い環境向け（既定の connect 10s だと足りないことがある） */
const youtubeAgent = new Agent({
    connectTimeout: 120_000,
    headersTimeout: 180_000,
    bodyTimeout: 180_000,
});

function isRetryableFetchError(err) {
    const c = err?.cause;
    const code = c?.code ?? err?.code;
    if (
        code === "UND_ERR_CONNECT_TIMEOUT" ||
        code === "UND_ERR_HEADERS_TIMEOUT" ||
        code === "UND_ERR_BODY_TIMEOUT" ||
        code === "UND_ERR_SOCKET" ||
        code === "ECONNRESET" ||
        code === "ETIMEDOUT" ||
        code === "EAI_AGAIN" ||
        code === "ENETUNREACH"
    ) {
        return true;
    }
    return err?.name === "TypeError" && err?.message === "fetch failed";
}

async function sleep(ms) {
    await new Promise((r) => setTimeout(r, ms));
}

/** 接続タイムアウト等は指数バックオフで再試行し、成功するまで繰り返す */
async function fetchYouTubeUntilOk(url, init) {
    let attempt = 0;
    let delayMs = 3000;
    const maxDelayMs = 120_000;
    for (;;) {
        try {
            return await fetch(url, { ...init, dispatcher: youtubeAgent });
        } catch (e) {
            if (!isRetryableFetchError(e)) throw e;
            attempt++;
            const detail = e.cause?.code ?? e.cause?.message ?? e.message;
            console.warn(`⚠️ 接続失敗 (${attempt} 回目) ${detail} — ${delayMs}ms 待って再試行`);
            await sleep(delayMs);
            delayMs = Math.min(Math.floor(delayMs * 1.5), maxDelayMs);
        }
    }
}

// DevToolsでコピーした fetch() の内容をベースに
const REMOVE_TEMPLATE = async (videoId) => ({
    "headers": {
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.9",
        "authorization": buildAuthorizationHeader(),
        "content-encoding": "gzip",
        "content-type": "application/json",
        "device-memory": "32",
        "priority": "u=1, i",
        "sec-ch-dpr": "1.125",
        "sec-ch-ua": "\"Google Chrome\";v=\"147\", \"Not.A/Brand\";v=\"8\", \"Chromium\";v=\"147\"",
        "sec-ch-ua-arch": "\"x86\"",
        "sec-ch-ua-bitness": "\"64\"",
        "sec-ch-ua-form-factors": "\"Desktop\"",
        "sec-ch-ua-full-version": "\"147.0.7727.56\"",
        "sec-ch-ua-full-version-list": "\"Google Chrome\";v=\"147.0.7727.56\", \"Not.A/Brand\";v=\"8.0.0.0\", \"Chromium\";v=\"147.0.7727.56\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-model": "\"\"",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-ch-ua-platform-version": "\"19.0.0\"",
        "sec-ch-ua-wow64": "?0",
        "sec-ch-viewport-width": "951",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "same-origin",
        "sec-fetch-site": "same-origin",
        "x-browser-channel": "stable",
        "x-browser-copyright": "Copyright 2026 Google LLC. All Rights reserved.",
        "x-browser-validation": "EsmT91Yc2imP58B+tvFt/g1KK/I=",
        "x-browser-year": "2026",
        "x-goog-authuser": ACCOUNT_INDEX,
        "x-goog-visitor-id": "CgtabWZqMWpZai1HVSiLoITPBjIKCgJKUBIEGgAgHg%3D%3D",
        "x-origin": "https://www.youtube.com",
        "x-youtube-bootstrap-logged-in": "true",
        "x-youtube-client-name": "1",
        "x-youtube-client-version": "2.20260415.01.00",
        "cookie": process.env.COOKIE,
        "Referer": "https://www.youtube.com/playlist?list=PLXQE_C7He7f9MKGP11OpI8jw187fOgg_3"
    },
    "body": `{\"context\":{\"client\":{\"hl\":\"ja\",\"gl\":\"JP\",\"remoteHost\":\"2405:6587:3c0:be00:25e3:2706:e4db:ee2\",\"deviceMake\":\"\",\"deviceModel\":\"\",\"visitorData\":\"CgtabWZqMWpZai1HVSiLoITPBjIKCgJKUBIEGgAgHg%3D%3D\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36,gzip(gfe)\",\"clientName\":\"WEB\",\"clientVersion\":\"2.20260415.01.00\",\"osName\":\"Windows\",\"osVersion\":\"10.0\",\"originalUrl\":\"https://www.youtube.com/?themeRefresh=1\",\"screenPixelDensity\":1,\"platform\":\"DESKTOP\",\"clientFormFactor\":\"UNKNOWN_FORM_FACTOR\",\"windowWidthPoints\":1537,\"configInfo\":{\"appInstallData\":\"CIughM8GEL2ZsAUQmNWAExDevM4cEJT-sAUQgo_PHBDBj9AcEPCZ0RwQrKzQHBD79tAcENeu0BwQvYTRHBD8ss4cEMKJ0RwQ4tSuBRCUg9AcELTB0BwQ9IrRHBDM364FEIHNzhwQprbQHBC-irAFEKaasAUQ0r3QHBCbwtAcEJ_PgBMQ8bTQHBCZjbEFEKaI0RwQofjQHBC9tq4FEJ3QsAUQw5HQHBCw_tAcEInorgUQrPXQHBCHrM4cEPXVzhwQvKTQHBCW-68FELGR0RwQzPnQHBC45M4cEIv3zxwQt4bPHBDD3oATEImwzhwQyPfPHBD724ATEJS20BwQwJTRHBCzkM8cEJOZgBMQlofRHBD2q7AFEODNsQUQ_o3RHBDa984cEK7WzxwQzdGxBRDGxs8cENeL0RwQ8cTQHBDL0bEFEJGM_xIQ_v_QHBDjldAcKnBDQU1TVGhWTi1acS1ETGlVRXBRQ25BNzVGYjBHeFFPQXQtWUw4TEVTaDB3eW9Ld0VBODNfQmN1M0J2c210dVFHaFJUSXVBWGpGcEVwdHlfcEU1NUxnaWlPeEFMcS1RYlVGSmdBcTBIZW5nVWRCdz09MAA%3D\",\"coldConfigData\":\"CIughM8GEL22rgUQ4tSuBRDT4a8FEMn3rwUQlvuvBRCIh7AFEL6KsAUQndCwBRDP0rAFEOP4sAUQr6fOHBD8ss4cEPXVzhwQs5DPHBDjldAcEM6s0BwQ-bjQHBCw_tAcENeC0RwQgYbRHBDRjtEcEPqO0RwQy4_RHBCxkdEcEMKT0RwQwJTRHBDjl9EcEPCZ0RwQuZzRHBCgntEcGjJBS0lHSWtKUXNwbE53c3diNkN2OEpDUUNGZVpiczJYbjBKWkt1NkV1WDNKV0NIUE43ZyIyQUtJR0lrSmtxektTeGRfU3YzUV9vNTNwazVkeVEwU3BUVE0yYmxfbVlhd29JOGhJcFEquAFDQU1TaFFFTk5MamR0d0trR1pjZm4wLVprcG9RLXhhTk52NGpteHBxTlBZWXFBTFpGN0FOclEzT0Fwb0ZESndsbXdyRUM0a01sZzY3QVJWSm1iRzNINFdrQlpHY0JlSGJBY19DQUktbkJ2M1VCakxQZ0FYWnBBWURxZWtFeGduekE0amtCY3RLQkpLLUJ2dDBsVEVHNFVpblQ1Z2Jzd2Itc3dTSHV3Ynd5UWFOQXV2REJxekVCZ1VG\",\"coldHashData\":\"CIughM8GEhQxNTczMDU2MzIzMjUxNDM2NjM3NRiLoITPBjIyQUtJR0lrSlFzcGxOd3N3YjZDdjhKQ1FDRmVaYnMyWG4wSlpLdTZFdVgzSldDSFBON2c6MkFLSUdJa0prcXpLU3hkX1N2M1FfbzUzcGs1ZHlRMFNwVFRNMmJsX21ZYXdvSThoSXBRQrgBQ0FNU2hRRU5OTGpkdHdLa0daY2ZuMC1aa3BvUS14YU5OdjRqbXhwcU5QWVlxQUxaRjdBTnJRM09BcG9GREp3bG13ckVDNGtNbGc2N0FSVkptYkczSDRXa0JaR2NCZUhiQWNfQ0FJLW5CdjNVQmpMUGdBWFpwQVlEcWVrRXhnbnpBNGprQmN0S0JKSy1CdnQwbFRFRzRVaW5UNWdic3diLXN3U0h1d2J3eVFhTkF1dkRCcXpFQmdVRg%3D%3D\",\"hotHashData\":\"CIughM8GEhM0NTE5MDg5NTU5NTU3NjUwMzYxGIughM8GKJTk_BIopdD9EijIyv4SKLfq_hIokYz_EijllIATKJOZgBMokJuAEyjYsIATKLvRgBMomNWAEyjB1oATKMfWgBMoy9aAEyin2YATKPvbgBMosd6AEzIyQUtJR0lrSlFzcGxOd3N3YjZDdjhKQ1FDRmVaYnMyWG4wSlpLdTZFdVgzSldDSFBON2c6MkFLSUdJa0prcXpLU3hkX1N2M1FfbzUzcGs1ZHlRMFNwVFRNMmJsX21ZYXdvSThoSXBRQlBDQU1TTmcwUm90ZjZGYTdCQm9XZkJxQWFvd1NtQUFRR0JnYU9CaFViM2NfQ0RKV05EcW1SNWd2N2h4M1NKSS1mQ2JUSkJBWUdCZ2F3TEE9PQ%3D%3D\"},\"screenDensityFloat\":1.125,\"userInterfaceTheme\":\"USER_INTERFACE_THEME_DARK\",\"timeZone\":\"Asia/Tokyo\",\"browserName\":\"Chrome\",\"browserVersion\":\"147.0.0.0\",\"memoryTotalKbytes\":\"32000000\",\"acceptHeader\":\"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7\",\"deviceExperimentId\":\"ChxOell5T1RNNU5qZzNPVEk0TmpNeE5ETTNNUT09EIughM8GGIqghM8G\",\"rolloutToken\":\"CNHH7PLTvKGkzwEQxKaN8-bykwMYyZbQ8-bykwM%3D\",\"screenWidthPoints\":951,\"screenHeightPoints\":1132,\"utcOffsetMinutes\":540,\"connectionType\":\"CONN_CELLULAR_4G\",\"mainAppWebInfo\":{\"graftUrl\":\"https://www.youtube.com/playlist?list=PLXQE_C7He7f9MKGP11OpI8jw187fOgg_3\",\"pwaInstallabilityStatus\":\"PWA_INSTALLABILITY_STATUS_UNKNOWN\",\"webDisplayMode\":\"WEB_DISPLAY_MODE_BROWSER\",\"isWebNativeShareAvailable\":true}},\"user\":{\"lockedSafetyMode\":false},\"request\":{\"useSsl\":true,\"internalExperimentFlags\":[],\"consistencyTokenJars\":[]},\"clickTracking\":{\"clickTrackingParams\":\"CL8EEMY0GAAiEwiBv-OD5_KTAxXJ5EwCHT8-GvvKAQQRJRMw\"},\"adSignalsInfo\":{\"params\":[{\"key\":\"dt\",\"value\":\"1776357388225\"},{\"key\":\"flash\",\"value\":\"0\"},{\"key\":\"frm\",\"value\":\"0\"},{\"key\":\"u_tz\",\"value\":\"540\"},{\"key\":\"u_his\",\"value\":\"6\"},{\"key\":\"u_h\",\"value\":\"1152\"},{\"key\":\"u_w\",\"value\":\"2752\"},{\"key\":\"u_ah\",\"value\":\"1104\"},{\"key\":\"u_aw\",\"value\":\"2752\"},{\"key\":\"u_cd\",\"value\":\"32\"},{\"key\":\"bc\",\"value\":\"31\"},{\"key\":\"bih\",\"value\":\"1132\"},{\"key\":\"biw\",\"value\":\"934\"},{\"key\":\"brdim\",\"value\":\"10,10,10,10,2752,0,1398,1114,951,1132\"},{\"key\":\"vis\",\"value\":\"1\"},{\"key\":\"wgl\",\"value\":\"true\"},{\"key\":\"ca_type\",\"value\":\"image\"}]}},\"actions\":[{\"setVideoId\":{videoId},\"action\":\"ACTION_REMOVE_VIDEO\"}],\"params\":\"CAFAAQ%3D%3D\",\"playlistId\":\"PLXQE_C7He7f9MKGP11OpI8jw187fOgg_3\"}`,
    "method": "POST"
});

const ADD_BODY_CAPTURED_VIDEO_ID = "8lwcCzzxm40";

// DevTools でキャプチャした gzip 本文（latin1）。再キャプチャしたら ADD_BODY_GZIP_LATIN1 を差し替え。
const ADD_BODY_GZIP_LATIN1 = "\u001f\u0008\u0000\u0000\u0000\u0000\u0000\u0000\u0003ÍXyoë¸\u0011ÿ*A\u0005vÛäEÏ,\u0016n[¶hë¶U\u0014$ÒºH²ekñ¾{I'~/Y\u0014EÿlNz\u000erô3úó1¬Ê\u000e]ºÇ×?\u001fÃ<Aåm\u0015ç¯©ÿøô\u0018ºÅ«\u0006\u0015U\u0016U%\u001e\u00115~gÓW6¤^\u0003DQ¯Ì\u0018±¯Ì¼¢\u0011\u000c^\u0011b°\u0012Dç$D!¬ôós\u0005QþN8'mÒUèw>&\u0008Qw2,\u0000\u001a.ÐÂËÂkÒÖ#kË§Ë\u0010©+_JJÄE\u000bf}ä¢&äR]ç¹½µ!í\u0014\u0010Pñ\u001aN\u001dÆ\u001e²j¹ßÁÖq÷]]ddÁBæ/i\u0017/i/³\u0019[y½4\u0001ãQ>s\u0019i%¯;®wô¬6\u0015ûb°ª\u0009\u0018£ÔØCE¼´¬i¬±õì1o+ D¢§xÊr°,lÌïA\u001av¶Ý1lP]¿\u0001Ö÷Ô­Ýýe?8\u0017Ë2$\u001a~êL \u0005­PÊ\u00068h¬%Ã½Ùõc ÐÏ¨W,G0_üÍX9¤½+}¶®ôÆdä\u000e\u0015!«[ Ú3NºTÅ`(6tôÎPe;yõvÊ3;\u001a¾YrÈ\u0002f9xÊ%5\u000b¹\u0005i.oäÜ±\u000b}dÑy¥§r\u000clZ2(Ã\rù1`Á\u001b jÁ º2°»\u0012ìá8\u0003Ì:oG]D\u00070wÞ1Tª1,.;ñ~æíÑN=Ù¼Bn§\u001c\u0008¦äIIóÈ12°¨kÏV5¨Ä¹!ÑR@Ï=WRO¡ó\u001cÓö\u000eêºþ\u000b+â\u001f\u001c\u0018§\u00165\\tÇG­\u001a<÷_Æß¨_Ý¤Uß>\u0000ë¦¾Q¿?`ÂdôûÃe2úí«ë\u001c¹(X%ÝË~c'\u000f¿®\u0016¶~zÈ\u000c=((Ìªß\u001e¸©\nôB&ß(òý`úG¿I>T¢!©\u007fè7lÇ{R\u0000¿ \u0011ìJü\u000f6©J\u000cß\u0018P#\u001aÛG\u007f£(,Rµwwko¤\u001aÄpBj()ýÜnH6Ä]W·¯//}ß\u007f»V§î\u0014 oaU¼Ô¹\u007fÍ¶û\u0007ùóÇv½Ó¥0] éq®­-Moêå,íéÙô¸¢\u00037nÃ\u0006¡r\\P.¢\u0012gØõñ~zÄ;uÇª)ða¢d®¬ÍöÇÓÈ,û!NEÌ´Á\nl\\p7v9ÁÚ\u0018X°¿=À.ÞVIÙµxÏ\u00193\u007f\"%äDËòXÚá×õ²l;?ÏïI½º±6S$íl´º­\u000fÛR_ðâ\u0019q´ÞèÃ¥×£ê°Å4>s¡\u0004Ð2zýù\u0010\u00109di;=P|¯³gNº\u0008ý¡ÃrË3KtéÉ\u0014Ë\u0009ó\u0018HÚ!îõYh\u0011\u001aÕC²_Ã\u0012Ú¡b\rL³=>W[©äëöÏ\u0015èjBö+öÌ7¢h8|®ß´­G!»ÁrFºÒú\u0011[. ºvGlY3\u001eÃ\u001d\u001b2÷\u0003«9\u00057[âgåT\u007fAÎ=Wo=>cÞ½ág[][\"×«\u0016¶O\u00143b3®0\u0004«\u0012\nXN¤\u000eï§\u0006Ó¦·õÓÆÂg\u0009½\"¸\u0008\u001eÙ¯n\u0008V} 6/Ëªl=\u0009D\"\u0017\r$KêY g°Í@ì³#ój \u0009-»\u0018SQd+Ëöz%Xu#òlbc[VÅEÔmÚr$Õµ\u0005Ú\u000fMZ²Ü1v¼¡3c\u001e\u000c²Où\u0005å­¾Ó;×îGäX¾È³È¯!åð\u001b\u0011\u001cõ\u0002Ð\u001a¥2!CSÐ\u0017¾¬ÚæÎá]¥VB\n\u0017Ú\\ÝzFîü-¤e\u0011^c\u000c²`Ó9o² ±\u001ced±±\u001f¨ã~\u0014°Ê¡pÀ¿ÆÛa\u0008\u000e£Î<a\u000c­?%­d\u0009ùùtÆø/ã)Æk=Y\u0011ß}`½¥\u0008íÐÉ`8kÛQ(mw\u000eÁ¦\u001d?°´ÉÍwÏAJð\u007fK\u0004âh\u001f\u0010\u007f\u001a)ñÝöms·ÑÁø\u0011\u001fÚÊ\"´\u000f¿§ùÈ½ûóä\rD.*±®ª¼Iå\u000bÓíVö\u000eô4fC\u0016& \u0003ÌFªEÛ\u0006çÔI8¨û åWnÖÑ shW\u0004+\u0002K[\u001a±ÞuyÕíN5¨¼1¹\nñÉÜ\u0019µ^À8¤UÊ¦áÎ§½Ê¢ \u000bJõ/¨«¯H½)\u001aWÑb3Æ.|;qò-\u0016|Y­l¬ùAAªk\u000cºN½bÔ¯º\u0009¹±ÞÅ1æ3@©qÏÀ_¬÷ÜÌ[r­\u0000JÞ¹4XÜ\u0007'%l\u001d¼\u001a¶Fù\u0014ÝzÃÕ\u001dÕ5\u000b:1\u0006°\u00042lô¼^ì)57\u0015ßÓslCÖ\u0005Êh´#øÙE÷(yï<ïÚÆÅs;\u0019)ð2òqS°gµÕëµ­2Pä[Gr\u0016@ÆMB®Ó\u001e£\u000eYv\u0018OË\\8ì¾cÛ7úÎa\u000cI½ Ì\u0011<ÚQ>âlá·ñ_£,Ö/@Ô®@ÜÓ\u001a$úe3Ú\u00105þGûò\u0013ý\\\u001eBå²Á8³ûÔ\u0013a\u001a¯t\u001cíFáøûR»ºÊ¨7óz\r-ON49\u0014Mß\u0000&h¼6m¨úT~Ä×ï)ÈrÊ·I\u0003L(\u0003lsçúÒ|\u0001\u0007ï\u001a¤`\u0013\u0016q¬I\u0011\u0015\u0016ð\u000c\\#ÇQÁêMÄë\u000cl&6\u000c{¼±:\u000b¸ö)èï\u0019ï¤á\u000c÷Yþlôhù05Þ]ÜöXwü¢Û\u0017ßH!oª¡Qs\u001e{[1¤\r\u0014\r3G\u0004J\u0007\u0002%d°M'«»}\u0016\u000e8v>¥ú\u0006\u0003\u0004Ï\u0013ÝÅÕÕµ;\u0016`\n\u001c½¨5[¼+×½îäRè:±Ë ¬y\u001cA\r®\u001cI©+óJ\u000b°Ôû@ÆÍÕ`8¾;¶\u000b\u0013\rë\u001d`m*¦!£²ÈqôÉ4Ì\u000c!ÜÕ2rÇ~T¸êþ£#5\nXÒX\u0013£1î È/\u000bR»×ýEùY©VvàU\rÅ¹`¯Gæj}|;ÄË*Û\u000f\u0007LËó%g­Ô\u0017ñZ©'Nº¦ûÐÖgÐnåöò4.·+íè\u0012ÚuîcZR2øjZmÏ\u0001¡µpÂIÃÿQàäü-õ­\"ìíbNy©§ì-(èÅ|çeêEwå3¤A§Û²aPxo{.ø²h\u000cq¶KÑ\u0018;6±Ã\u0018ÀÄ#\u0006+Ó¤\u000bÁ×@¦âÔÇÈ¬%Ióí½\u000fü~ïe>Ú\u00189¯|Ü\u0011Òßñ{¸ÄÓKsôCdÅèÖpÙ¦d\u001cØ\u0006n\\¤µ4é rÆ\n;¾K\näU%\u0011ãÚÄ\u007f±ªìZazÐà\u0016\r5\u001f-Û{søü©m»÷Yàq¨¹Z\u0015ntVÁµC¸\u001bzQ·/ÌõÃ\u0010ÕÝ\u0002ù\u0010LX/qWäO¸;ÊÐïð/\u0017Bùûå¯Ô\"ÿýí\u000fêÛü))ü\u0008½øçäø±ìQPß©u\u0019=ýíåo7ÑÙ\rÚ$*\u0011|F0öË\u0008ý~þ#`obÓ\u001f\u0003t©QÁ(»%¼=ñeò|lÑ\u0001)Zò\u0006°1$yb\u0015µlÚv-\u001eØ\u00165>Òà\u000ed*¬ò\u001c÷ª\u0018ID\u0010\u0012@ Í6%Ö¾=Õ%½|ÞÄ·M\u0012]ÛÏ»`\u001eùÍ5ëµ÷<|÷ì×\u0012wÒwÆ\u0002%QÜÝ9óù\u0008{¼\u000b7Çc:-)O7ÌÇ#êÖ($\u000fo]ë\u000b7\u0000\u001c\u0004\u0009ü5g\u001cFÄÐÂOJ<\u001dàÙàÞ¨F\u007fìþ{ëÝ öwí?Zä7a|x;¡æúÇ/\u0012ûË\u000cÿÈ\u001f\u000bNüXðÂ}Á\u007f,æw\u00167¿/¸Ûùc£êÞÿèý Éq|ßH(m]\u000eG±iqë5Ç/×Kk\u007fÀ\u001f,Û<\u0008\u001c8ðÒ)\u0011 q\\ø¦Ás\u0002¬ßç¸4·kn\u007fÐ6¢tà\u0013\u0003Ë&-\u0000àH9#3ö\u001bÄý\u0004cµ®9¡ïßßó\u0000Wa \u001eP÷±ñÑÏ[ô¼\u000bÀP´·W\u0005XØlówå'Z<¥ 2¼ÞBBÅíóãë?ÿ|Äæ{\u0001x'\u000bä½ÃÍ³Üb¼7ûÓñ*F£g±\\ìvæ&ÇÕªuMjC#\n@MÁÓÅVÆßçé³u\u0008c\u0012)td:\u001e7\u0005{O¦êp\u001eÛb9T:\u0002Ü8P\u000eWkq\u001a\u0017 ¥Ø­;ëó\u000cã\u0008T\u0002Þ¬Yµo*;i)RÊÕòµkmÄM¤¦Â=öT;ðp¸°i:Àú4n¦\u0008¾í\u0011GeÃÕY£ÉC¤Ñ}ñÜîü\u001bÆÓ¨_lz\u0006m»¿Ùµ}k\u001f¿ÿ\u000bcN\u0014ó~¦û\u0011\u0001æ_ßo\u0003XY\u001ffI\u0019}¼ùIÀ\u0003_\u0010\u0004NÒ«y¿U8;út=évr^YÜeGkl»Xà£\u0015§ë\u0006¾{R;}hâbvùúc7ì\u000cá¡ð\u0011vä%HØÐÓé\u001dÏXz2\u001fO±þ]èãëò\u001cõÇÉÿÌ9\u001dºá\u0013\u000bgê\u0017f´¸ìWÞg£è1óÙ\u007fb2Ó¿0ý¯ªÔè+÷¿êð³AyAøC\u007fæ$\u000fÄEê\u000b¯ÿbÌì3¦A\u0003ÏÈ=O¨§Û\u001fb\u0017ùGMÇO4þzº\u0015Å¯[¿÷Ù >Ê?qHV~bþ¡#\u0015ò§Àí6ÁAJòÞ¿Ð÷èð!DÐI ªn7Ä,ïCa\u0018.ÅèývëÞ/DN°\u001bpàDñà,Eisö{=.9é½Ðßß`Ü¶ú\u001f^`|ÿ7`;\u0001¨\u0014\u0000\u0000";

function buildAddPlaylistBody(videoId) {
    const buf = Buffer.from(ADD_BODY_GZIP_LATIN1, "latin1");
    let json = zlib.gunzipSync(buf).toString("utf8");
    if (!json.includes(ADD_BODY_CAPTURED_VIDEO_ID)) {
        throw new Error(
            `ADD gzip body に ${ADD_BODY_CAPTURED_VIDEO_ID} がありません。キャプチャを貼り直すか ADD_BODY_CAPTURED_VIDEO_ID を更新してください。`,
        );
    }
    json = json.split(ADD_BODY_CAPTURED_VIDEO_ID).join(videoId);
    return zlib.gzipSync(Buffer.from(json, "utf8"));
}

const ADD_TEMPLATE = async (videoId) => ({
    "headers": {
        "accept": "*/*",
        "accept-language": "ja,en-US;q=0.9,en;q=0.8",
        "authorization": buildAuthorizationHeader(),
        "content-encoding": "gzip",
        "content-type": "application/json",
        "device-memory": "8",
        "priority": "u=1, i",
        "sec-ch-dpr": "1.25",
        "sec-ch-ua": "\"Not-A.Brand\";v=\"24\", \"Chromium\";v=\"146\"",
        "sec-ch-ua-arch": "\"x86\"",
        "sec-ch-ua-bitness": "\"64\"",
        "sec-ch-ua-form-factors": "\"Desktop\"",
        "sec-ch-ua-full-version": "\"146.0.7680.189\"",
        "sec-ch-ua-full-version-list": "\"Not-A.Brand\";v=\"24.0.0.0\", \"Chromium\";v=\"146.0.7680.189\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-model": "\"\"",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-ch-ua-platform-version": "\"19.0.0\"",
        "sec-ch-ua-wow64": "?0",
        "sec-ch-viewport-width": "1202",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "same-origin",
        "sec-fetch-site": "same-origin",
        "x-goog-authuser": ACCOUNT_INDEX,
        "x-goog-visitor-id": "CgtuRTNiN1dHeHZkcyisp4TPBjIKCgJKUBIEGgAgH2LfAgrcAjE3LllUPUd1VmtCb0hLdnVpbDRYd3JnYXdsVWYtckxFeTdmME9EaEMxZlF1ZkU2UEhBQnRfb2Z0a2x4MnBQVWZfZTc1SGUxR3JSN2RnMGhZemhXd1JjcGFMM3RPZU5BUGNneDZGZGIzTTllUFBYNjctUUt2RFR0VUpqN3ZhYmEtLWYxYzVxTTREM05najV6dTdTcEkzdzM3TFdYTkUzWkw5NC1Ga2JMZmI4dlI4aHU2Tld1Zy1vTy1OS2Ftemc3QTNoY2VjOEJGR203cVQtRGNTUVlwa2JIUjB2X1dqTFc3N2IzZGxjSmFsNjlFOFlVUmQ4T1loQjFhNU1ER0RWbG9fb3NqN0pCR0tnbUtnNXRKRVVzdktZX0xDMGhNSXZfcGo5dmxXT2ZfakZYeXJuU2FKeWtGNlNCSEZEMS1BeVRkNHppZUJMdGhlRE1Eb19ZWEJucGlBbFh1UXdQQQ%3D%3D",
        "x-origin": "https://www.youtube.com",
        "x-youtube-bootstrap-logged-in": "true",
        "x-youtube-client-name": "1",
        "x-youtube-client-version": "2.20260415.01.00",
        "cookie": process.env.COOKIE,
        "Referer": "https://www.youtube.com/results?search_query=%E3%83%8F%E3%83%AD%E3%83%BC%E3%83%BB%E3%83%9D%E3%83%A9%E3%83%AA%E3%82%B9"
    },
    "body": buildAddPlaylistBody(videoId),
    "method": "POST"
});

const API_URL =
    "https://www.youtube.com/youtubei/v1/browse/edit_playlist?prettyPrint=false"; // ← DevToolsからコピー

// TSV読み込み
const lines = fs.readFileSync("./data/data_uma.tsv", "utf8").trim().split("\n");

for (const line of lines) {
    const parts = line.split("\t");
    if (parts.length < 3) continue;
    const [_, title, videoId] = parts;
    console.log(`🎵 追加中: ${title} (${videoId})`);

    const res = await fetchYouTubeUntilOk(API_URL, await ADD_TEMPLATE(videoId));
    const text = await res.text().catch(() => "");
    let status;
    try {
        status = JSON.parse(text)?.status;
    } catch {
        status = undefined;
    }
    console.log("➡️ 結果:", res.status, status ?? "(no status)");

    if (status && status !== "STATUS_SUCCEEDED") {
        console.error("❌ YouTube が失敗を返しました:", status);
        console.error(text.slice(0, 500));
        console.error(
            "Cookie（SAPISID / SID / __Secure-*PSID 等）が失効している可能性があります。",
            "ブラウザから fetch() を再コピーして .env の COOKIE を更新し、",
            "x-goog-visitor-id / ACCOUNT_INDEX も合わせ直してください。",
        );
        process.exit(1);
    }

    // 負荷対策（0.5秒待機）
    await new Promise((r) => setTimeout(r, 500));
}

console.log("✅ 全動画送信完了");

