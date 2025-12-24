import fs from "fs";

// DevToolsでコピーした fetch() の内容をベースに
const TEMPLATE = async (videoId) => ({
    method: "POST",
    "headers": {
        "accept": "*/*",
        "accept-language": "ja,en-US;q=0.9,en;q=0.8",
        "authorization": "SAPISIDHASH 1762887784_d70227ec13e9957488859f9782a876b49e671712_u SAPISID1PHASH 1762887784_d70227ec13e9957488859f9782a876b49e671712_u SAPISID3PHASH 1762887784_d70227ec13e9957488859f9782a876b49e671712_u",
        "content-type": "application/json",
        "priority": "u=1, i",
        "sec-ch-dpr": "1",
        "sec-ch-ua": "\"Google Chrome\";v=\"140\", \"Chromium\";v=\"140\", \"Vivaldi\";v=\"7.6\", \"Not=A?Brand\";v=\"24\"",
        "sec-ch-ua-arch": "\"x86\"",
        "sec-ch-ua-bitness": "\"64\"",
        "sec-ch-ua-form-factors": "\"Desktop\"",
        "sec-ch-ua-full-version": "\"140.0.7339.242\"",
        "sec-ch-ua-full-version-list": "\"Google Chrome\";v=\"140.0.7339.242\", \"Chromium\";v=\"140.0.7339.242\", \"Vivaldi\";v=\"7.6\", \"Not=A?Brand\";v=\"24.0.0.0\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-model": "\"\"",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-ch-ua-platform-version": "\"19.0.0\"",
        "sec-ch-ua-wow64": "?0",
        "sec-ch-viewport-width": "2578",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "same-origin",
        "sec-fetch-site": "same-origin",
        "x-goog-authuser": "1",
        "x-goog-visitor-id": "CgtuRTNiN1dHeHZkcyjQkM7IBjIKCgJKUBIEGgAgHw%3D%3D",
        "x-origin": "https://www.youtube.com",
        "x-youtube-bootstrap-logged-in": "true",
        "x-youtube-client-name": "1",
        "x-youtube-client-version": "2.20251110.06.00",
        "cookie": "VISITOR_INFO1_LIVE=nE3b7WGxvds; VISITOR_PRIVACY_METADATA=CgJKUBIEGgAgHw%3D%3D; YSC=K_BzdI2qZeA; NID=525=BVGEhAij0dG2CvMSwwv8o9ty71ZB6DoxDPSu4NFoRrPm5t4dcxjqjs1G4ooGUpUmtHeyoaSBCbaa4XGxozPxSyhVim5QEBROQ1cJ9j9iYJa3A3LTNiZ2YzI6Mpt21mase0GP7XXixwC8ucPbp2svtrlgmdYgDNn9OuHuWkzIHHxCE2bKfhpFQFlUQ2e2rDQrIia2-LQe419wNR8EN930lKNzLpOn5x7A9nllrkWpxSNVYoe2xA71YCRDviGrdvlBxQCEYoBiaiiFeFXPNsSViqwdLf30lvO9dqN8WEsN8xTYQAkjUiFW1QqA_A; LOGIN_INFO=AFmmF2swRgIhANhAnb4hsv_Rg-VeNacptviPkkHUrijIXtj1joB5FfCnAiEA24Nzs-ENAl7IlM7-GVW3CNhlItJykMpsaKq_Te1kBVc:QUQ3MjNmenN1UkN6NG1rTDQ3MWxmQVlhSU5GcDExVERUUU5Ubl9pRGhBYl9JSlp0WnlaOTdueVdfZ3NrVHdQVVN0aWltWXRhM0RIeDRDdWNCTFI1QVhZZW9aMGZXcGVCR1VCalQxUjI3S2ZLOHpnV2NhRkJPUzdQU2tpY0o1WXFZNkp4M1BmclZGZldYc2p5QkZHVG5KeFBqcmFPMng1Mnd3; PREF=tz=Asia.Tokyo&f7=140&f5=30000&f6=40000000&repeat=NONE&f4=10000; __Secure-1PSIDTS=sidts-CjQBwQ9iIyBBfeqYePkqzaMEY4PcqPWAczrAvwL4PGhIqnGeUVYeLYBB-I_HrOnsG-gT8saVEAA; __Secure-3PSIDTS=sidts-CjQBwQ9iIyBBfeqYePkqzaMEY4PcqPWAczrAvwL4PGhIqnGeUVYeLYBB-I_HrOnsG-gT8saVEAA; HSID=Af4KSSTnQzcKrwgzC; SSID=AhKvhTOquPIjxeOiW; APISID=DZw7drnVxMiu4DF_/AO5aJ_Zo-ECfELt6i; SAPISID=eHBhTsaq7uZa9GAR/A5AINqQQpBUBuaxk2; __Secure-1PAPISID=eHBhTsaq7uZa9GAR/A5AINqQQpBUBuaxk2; __Secure-3PAPISID=eHBhTsaq7uZa9GAR/A5AINqQQpBUBuaxk2; SID=g.a0002wgsen2qjupeJgVkBkoQuhgbWzgr_nYrBwZx3kgv6uBSHK0zieBW10BRY3MhAeVWMO7Q8gACgYKATQSARASFQHGX2MiYSXVaATA8H0vbPTer5Un9RoVAUF8yKqMNyXhkyVFpaOJpvy2Isbf0076; __Secure-1PSID=g.a0002wgsen2qjupeJgVkBkoQuhgbWzgr_nYrBwZx3kgv6uBSHK0zXlxkKvhBe3vMMrO7_BpFggACgYKAc8SARASFQHGX2Midjry9U1HUy47nX5nky46-RoVAUF8yKrwNRsPvS94WS77ElFSES3d0076; __Secure-3PSID=g.a0002wgsen2qjupeJgVkBkoQuhgbWzgr_nYrBwZx3kgv6uBSHK0zmmOWPlNC6o8OYCsD0eWM3wACgYKAUQSARASFQHGX2MiYWqd-cna4hVoGUMF3-difBoVAUF8yKoT4R0q8X8r4CqmqJYbeqlm0076; __Secure-ROLLOUT_TOKEN=CNbE8On3jpaU7QEQn-OhtZPiiQMYpp7wkrLqkAM%3D; wide=0; SIDCC=AKEyXzWKeT1dD3vfjVYtKw1myq4x1NsB_Uooxo1pbDrAsCdRe9hAtDfl6dLcWYHfb8Ejz42HB6I; __Secure-1PSIDCC=AKEyXzVD_F-cf4Hj5NgUzGKnS4CQhhSETHZSYF7EfDN57_iKmw2L7T7iQqF91D9voemwyBIA9YY; __Secure-3PSIDCC=AKEyXzUHYzhw0XGqEI_NWsyN1g5fs0DAYsbNHw23NcIJMtKTCgzh9CJm1NdssPU2nRuzlQHcNlU; CONSISTENCY=AKreu9s4rFyykzyijmXQq_jCilSM4WTkI4Ulqq4h18OTC0Eim7ESoyG0UxARNJki4WigcmSiTeEG-aB08PvTcp1d4HeLVzAKjxFpGD-2tTbqGf_i1PVIdWdldCUoeJL_svEw__rzcHtKgbfnjsOzSdXcUKaDbDKz9TB7v03hIZ4he3gGhJ5DHf-DWI0hjVyIYJ8prZgj3AUQ5StirN-PJDuJDcyX9A; ST-1kmn9b=session_logininfo=AFmmF2swRgIhANhAnb4hsv_Rg-VeNacptviPkkHUrijIXtj1joB5FfCnAiEA24Nzs-ENAl7IlM7-GVW3CNhlItJykMpsaKq_Te1kBVc%3AQUQ3MjNmenN1UkN6NG1rTDQ3MWxmQVlhSU5GcDExVERUUU5Ubl9pRGhBYl9JSlp0WnlaOTdueVdfZ3NrVHdQVVN0aWltWXRhM0RIeDRDdWNCTFI1QVhZZW9aMGZXcGVCR1VCalQxUjI3S2ZLOHpnV2NhRkJPUzdQU2tpY0o1WXFZNkp4M1BmclZGZldYc2p5QkZHVG5KeFBqcmFPMng1Mnd3; ST-1x29qd6=session_logininfo=AFmmF2swRgIhANhAnb4hsv_Rg-VeNacptviPkkHUrijIXtj1joB5FfCnAiEA24Nzs-ENAl7IlM7-GVW3CNhlItJykMpsaKq_Te1kBVc%3AQUQ3MjNmenN1UkN6NG1rTDQ3MWxmQVlhSU5GcDExVERUUU5Ubl9pRGhBYl9JSlp0WnlaOTdueVdfZ3NrVHdQVVN0aWltWXRhM0RIeDRDdWNCTFI1QVhZZW9aMGZXcGVCR1VCalQxUjI3S2ZLOHpnV2NhRkJPUzdQU2tpY0o1WXFZNkp4M1BmclZGZldYc2p5QkZHVG5KeFBqcmFPMng1Mnd3",
        "Referer": "https://www.youtube.com/watch?v=" + videoId,
    },
    "body": `{\"context\":{\"client\":{\"hl\":\"ja\",\"gl\":\"JP\",\"remoteHost\":\"2405:6587:3c0:be00:577:c396:ab46:35b9\",\"deviceMake\":\"\",\"deviceModel\":\"\",\"visitorData\":\"CgtuRTNiN1dHeHZkcyjQkM7IBjIKCgJKUBIEGgAgHw%3D%3D\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36,gzip(gfe)\",\"clientName\":\"WEB\",\"clientVersion\":\"2.20251110.06.00\",\"osName\":\"Windows\",\"osVersion\":\"10.0\",\"originalUrl\":\"https://www.youtube.com/watch?v=${videoId}\",\"platform\":\"DESKTOP\",\"clientFormFactor\":\"UNKNOWN_FORM_FACTOR\",\"windowWidthPoints\":3108,\"configInfo\":{\"appInstallData\":\"CNCQzsgGEODNsQUQ5aTQHBCClNAcELfJzxwQzOvPHBCrptAcEMGP0BwQrbWAExCnpdAcEJT-sAUQ-dDPHBDhjNAcEN7pzxwQw5HQHBDL0bEFEMzfrgUQgo_PHBCHrM4cEIiT0BwQ8p3QHBCZjbEFEJb7rwUQs5DPHBCM6c8cEOWygBMQudnOHBCU8s8cEPDMzxwQltvPHBC-poATEJ3QsAUQkYz_EhCTmYATEN68zhwQ9quwBRDI988cEIOe0BwQk4PQHBCrnc8cEPXVzhwQppqwBRCL988cEPWX0BwQpZ_QHBDT4a8FEMn3rwUQ2vfOHBC7lNAcEIiHsAUQgc3OHBD7_88cELjkzhwQ47jPHBCV988cEL2ZsAUQm_bPHBDi1K4FENHgzxwQ87OAExCr-M4cEKCn0BwQjcywBRCc188cELvZzhwQh4PQHBCJsM4cEMT0zxwQzdGxBRCu1s8cEInorgUQvoqwBRC1l9AcEL22rgUQ15bQHBC36v4SEPyyzhwQ85DQHBDjldAcEJW0zxwQ7IzQHCpYQ0FNU1BCVV8tWnEtRExpVUV2Y0J4TmZtQzhQc0ZMWE1Cb2RNTXFDc0JBUEc2UVdQRGZtQ0JxQUdvaTZrWXIwVjFpU01adllQaFJUaUk4M3A0aDRkQnc9PTAA\",\"coldConfigData\":\"CNCQzsgGEOm6rQUQvbauBRDi1K4FEJb7rwUQvoqwBRCd0LAFEM_SsAUQ4_iwBRCvp84cEPyyzhwQ9dXOHBDK4s4cEKudzxwQnqvPHBDtts8cEOO4zxwQ-MbPHBD50M8cENvTzxwQnNfPHBDH2s8cELDgzxwQz-DPHBDR4M8cELrmzxwQm_bPHBCvgtAcEJOD0BwQ1YPQHBCIhtAcEOyM0BwQ85DQHBDjldAcENeW0BwQsZfQHBCDntAcEP2g0BwQgaLQHBCYotAcEKel0BwQq6bQHBCgp9AcGjJBT2pGb3gwbTZXa1NaOGFsY2Fic3ZCVmZkb01aeV9IZDVzQngzNDlSOVhHeHplam5aQSIyQU9qRm94MWxha01TSHJ4WlAtdG5SRUxXQkNjdXQ1SWxFU0hqbktNTnJRcXRrcmEybGcqkAFDQU1TYUEwdHVOMjNBcVFabHgtZlQ3dU9taERtRFBrTy1nQ05OdjRqcHczdEFwY0thalNkRm9nUHdRR2FDNTBHRlQyWnNiY2ZoYVFGa1p3RjRkc0IwTElCOTRnR3lGcV9SZjNVQmpMUGdBWFpwQVlEb3JJRnVqek5lc1lKOHdPcWlBYkRpQWFiUTc2dUJwSUs%3D\",\"coldHashData\":\"CNCQzsgGEhM3NDk0MjMyMzQ4MDI5MjkxMDczGNCQzsgGMjJBT2pGb3gwbTZXa1NaOGFsY2Fic3ZCVmZkb01aeV9IZDVzQngzNDlSOVhHeHplam5aQToyQU9qRm94MWxha01TSHJ4WlAtdG5SRUxXQkNjdXQ1SWxFU0hqbktNTnJRcXRrcmEybGdCkAFDQU1TYUEwdHVOMjNBcVFabHgtZlQ3dU9taERtRFBrTy1nQ05OdjRqcHczdEFwY0thalNkRm9nUHdRR2FDNTBHRlQyWnNiY2ZoYVFGa1p3RjRkc0IwTElCOTRnR3lGcV9SZjNVQmpMUGdBWFpwQVlEb3JJRnVqek5lc1lKOHdPcWlBYkRpQWFiUTc2dUJwSUs%3D\",\"hotHashData\":\"CNCQzsgGEhMyNTgxMDE0ODI3NjM0NDMzMTkzGNCQzsgGKJTk_BIopdD9EijZmf4SKMjK_hIot-r-EiiRjP8SKPeQgBMoy5GAEyjllIATKJOZgBMotZuAEyi-poATKNiwgBMo5bKAEyjOtIATKLC3gBMon7iAEyiluIATKKu6gBMyMkFPakZveDBtNldrU1o4YWxjYWJzdkJWZmRvTVp5X0hkNXNCeDM0OVI5WEd4emVqblpBOjJBT2pGb3gxbGFrTVNIcnhaUC10blJFTFdCQ2N1dDVJbEVTSGpuS01OclFxdGtyYTJsZ0I0Q0FNU0lnMEtvdGY2RmE3QkJwTk5zeGJNUnhVVzNjX0NETlBvRC11MzVndll6UW56a0FRPQ%3D%3D\"},\"screenDensityFloat\":1,\"userInterfaceTheme\":\"USER_INTERFACE_THEME_DARK\",\"timeZone\":\"Asia/Tokyo\",\"browserName\":\"Chrome\",\"browserVersion\":\"140.0.0.0\",\"acceptHeader\":\"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7\",\"deviceExperimentId\":\"ChxOelUzTVRVME5USTNOekV6T0RFM05qWTNOZz09ENCQzsgGGNCQzsgG\",\"rolloutToken\":\"CNbE8On3jpaU7QEQn-OhtZPiiQMYpp7wkrLqkAM%3D\",\"screenWidthPoints\":2578,\"screenHeightPoints\":1282,\"screenPixelDensity\":1,\"utcOffsetMinutes\":540,\"connectionType\":\"CONN_CELLULAR_4G\",\"memoryTotalKbytes\":\"8000000\",\"mainAppWebInfo\":{\"graftUrl\":\"https://www.youtube.com/watch?v=${videoId}\",\"pwaInstallabilityStatus\":\"PWA_INSTALLABILITY_STATUS_CAN_BE_INSTALLED\",\"webDisplayMode\":\"WEB_DISPLAY_MODE_BROWSER\",\"isWebNativeShareAvailable\":true},\"clientScreen\":\"CHANNEL\"},\"user\":{\"lockedSafetyMode\":false},\"request\":{\"useSsl\":true,\"consistencyTokenJars\":[{\"encryptedTokenJarContents\":\"AKreu9s4rFyykzyijmXQq_jCilSM4WTkI4Ulqq4h18OTC0Eim7ESoyG0UxARNJki4WigcmSiTeEG-aB08PvTcp1d4HeLVzAKjxFpGD-2tTbqGf_i1PVIdWdldCUoeJL_svEw__rzcHtKgbfnjsOzSdXcUKaDbDKz9TB7v03hIZ4he3gGhJ5DHf-DWI0hjVyIYJ8prZgj3AUQ5StirN-PJDuJDcyX9A\",\"expirationSeconds\":\"600\"}],\"internalExperimentFlags\":[]},\"clickTracking\":{\"clickTrackingParams\":\"CAUQo9wPGAIiEwikpqPf5OqQAxVBtrkFHdOPNl3KAQTz8kGK\"},\"adSignalsInfo\":{\"params\":[{\"key\":\"dt\",\"value\":\"1762887762331\"},{\"key\":\"flash\",\"value\":\"0\"},{\"key\":\"frm\",\"value\":\"0\"},{\"key\":\"u_tz\",\"value\":\"540\"},{\"key\":\"u_his\",\"value\":\"2\"},{\"key\":\"u_h\",\"value\":\"1440\"},{\"key\":\"u_w\",\"value\":\"3440\"},{\"key\":\"u_ah\",\"value\":\"1392\"},{\"key\":\"u_aw\",\"value\":\"3440\"},{\"key\":\"u_cd\",\"value\":\"24\"},{\"key\":\"bc\",\"value\":\"31\"},{\"key\":\"bih\",\"value\":\"1282\"},{\"key\":\"biw\",\"value\":\"2563\"},{\"key\":\"brdim\",\"value\":\"0,0,0,0,3440,0,3440,1392,2578,1282\"},{\"key\":\"vis\",\"value\":\"1\"},{\"key\":\"wgl\",\"value\":\"true\"},{\"key\":\"ca_type\",\"value\":\"image\"}]}},\"actions\":[{\"addedVideoId\":\"${videoId}\",\"action\":\"ACTION_ADD_VIDEO\"}],\"params\":\"IAE%3D\",\"playlistId\":\"PLXQE_C7He7f9MKGP11OpI8jw187fOgg_3\"}`,
    "method": "POST"
});

const API_URL =
    "https://www.youtube.com/youtubei/v1/browse/edit_playlist?prettyPrint=false"; // ← DevToolsからコピー

// TSV読み込み
const lines = fs.readFileSync("./data/data_umaost.tsv", "utf8").trim().split("\n");

for (const line of lines) {
    const parts = line.split("\t");
    if (parts.length < 3) continue;
    const [_, title, videoId] = parts;
    console.log(`🎵 追加中: ${title} (${videoId})`);

    const res = await fetch(API_URL, await TEMPLATE(videoId));
    console.log("➡️ 結果:", res.status, await res.text().catch(() => ""));

    // 負荷対策（0.5秒待機）
    await new Promise((r) => setTimeout(r, 500));
}

console.log("✅ 全動画送信完了");
