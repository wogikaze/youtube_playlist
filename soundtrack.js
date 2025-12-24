import fs from "fs";

// DevToolsでコピーした fetch() の内容をベースに
const TEMPLATE = async (videoId) => ({
  method: "POST",
  headers: {
    accept: "*/*",
    "accept-language": "ja,en-US;q=0.9,en;q=0.8",
    authorization:
      "SAPISIDHASH 1766601497_6acb3e2771513c8b4e4f18bb29a37362a9681708_u SAPISID1PHASH 1766601497_6acb3e2771513c8b4e4f18bb29a37362a9681708_u SAPISID3PHASH 1766601497_6acb3e2771513c8b4e4f18bb29a37362a9681708_u",
    "content-type": "application/json",
    priority: "u=1, i",
    "sec-ch-dpr": "1",
    "sec-ch-ua": '"Not_A Brand";v="99", "Chromium";v="142"',
    "sec-ch-ua-arch": '"x86"',
    "sec-ch-ua-bitness": '"64"',
    "sec-ch-ua-form-factors": '"Desktop"',
    "sec-ch-ua-full-version": '"142.0.7444.245"',
    "sec-ch-ua-full-version-list": '"Not_A Brand";v="99.0.0.0", "Chromium";v="142.0.7444.245"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-model": '""',
    "sec-ch-ua-platform": '"Windows"',
    "sec-ch-ua-platform-version": '"19.0.0"',
    "sec-ch-ua-wow64": "?0",
    "sec-ch-viewport-width": "469",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "same-origin",
    "sec-fetch-site": "same-origin",
    "x-goog-authuser": "1",
    "x-goog-visitor-id":
      "CgtuRTNiN1dHeHZkcyjI5LDKBjIKCgJKUBIEGgAgH2LfAgrcAjE0LllUPWRzTlZianJZb2RBSjVITVVvamx4M05vUDZRRkdYWF8xTk04cUtibWtBMnJ5bGlqYnBhR2VqeTNOTXR5cmZSakdfcWhOZ09WZktWSWRmMFc3cGk5bG82WXVWWjBDd1RVdUpPelNsN2ZHUG9RaHN5SkMzWUVQRUtfUlFMb1pXLVFOc1NDLWZVemZRUnJVT1NOWENJdTFOczkwUFdTM2tuMFNJcFRwT19pQkNFTE8yTjNvOGpsUnFKZXRsMTVZQWluanpNVHRDSndmOGd3eEpXaWhuOTJVa0syeU1rXzE0YTJpdkhhbXI4SDVmbjhNWTc0RWs1anNrdGs1MzJZSTBSa3VWS2ItQ1o2ZVM4NmxkbjRBM29kS0hoTkdPdGF2N1hwc2FQeG85d1RrV09TMUNmVG94ZURwV3J0bV9TcHFUT2JVMVF1OHI2b1VYLXplSkFpaDh4ekZKdw%3D%3D",
    "x-origin": "https://www.youtube.com",
    "x-youtube-bootstrap-logged-in": "true",
    "x-youtube-client-name": "1",
    "x-youtube-client-version": "2.20251222.04.00",
    cookie:
      "VISITOR_INFO1_LIVE=nE3b7WGxvds; VISITOR_PRIVACY_METADATA=CgJKUBIEGgAgHw%3D%3D; YSC=K_BzdI2qZeA; NID=525=BVGEhAij0dG2CvMSwwv8o9ty71ZB6DoxDPSu4NFoRrPm5t4dcxjqjs1G4ooGUpUmtHeyoaSBCbaa4XGxozPxSyhVim5QEBROQ1cJ9j9iYJa3A3LTNiZ2YzI6Mpt21mase0GP7XXixwC8ucPbp2svtrlgmdYgDNn9OuHuWkzIHHxCE2bKfhpFQFlUQ2e2rDQrIia2-LQe419wNR8EN930lKNzLpOn5x7A9nllrkWpxSNVYoe2xA71YCRDviGrdvlBxQCEYoBiaiiFeFXPNsSViqwdLf30lvO9dqN8WEsN8xTYQAkjUiFW1QqA_A; LOGIN_INFO=AFmmF2swRgIhANhAnb4hsv_Rg-VeNacptviPkkHUrijIXtj1joB5FfCnAiEA24Nzs-ENAl7IlM7-GVW3CNhlItJykMpsaKq_Te1kBVc:QUQ3MjNmenN1UkN6NG1rTDQ3MWxmQVlhSU5GcDExVERUUU5Ubl9pRGhBYl9JSlp0WnlaOTdueVdfZ3NrVHdQVVN0aWltWXRhM0RIeDRDdWNCTFI1QVhZZW9aMGZXcGVCR1VCalQxUjI3S2ZLOHpnV2NhRkJPUzdQU2tpY0o1WXFZNkp4M1BmclZGZldYc2p5QkZHVG5KeFBqcmFPMng1Mnd3; PREF=tz=Asia.Tokyo&f7=140&f5=30000&f6=40000000&repeat=NONE; __Secure-1PSIDTS=sidts-CjQBwQ9iI730GCakP6YPCbkdmjhFceOYaMjbY1kUlDAdsGifG7IBt5qifKPGXpsElzbVrbXdEAA; __Secure-3PSIDTS=sidts-CjQBwQ9iI730GCakP6YPCbkdmjhFceOYaMjbY1kUlDAdsGifG7IBt5qifKPGXpsElzbVrbXdEAA; HSID=AtetusEXb_kvQaF8z; SSID=APCDKyDGJTgefCLQG; APISID=DqMbsPAh2tGgEcSY/A7EaZUqvQC9Jg8Y5Q; SAPISID=KrlffKOFAIa-ZQ_M/AHretnxB6rpvHYdvR; __Secure-1PAPISID=KrlffKOFAIa-ZQ_M/AHretnxB6rpvHYdvR; __Secure-3PAPISID=KrlffKOFAIa-ZQ_M/AHretnxB6rpvHYdvR; SID=g.a0004ggsehA35sSty2dlvum3Fjr7i3hi8jlG3rbap5lSOfkkNf-LnOylGNKDugkszhI4BEPGRAACgYKAZgSARASFQHGX2Mid9QOJ8Jao-Jz1a-WFYwxxhoVAUF8yKrweRHt6BYQnK0xjDh4FK6j0076; __Secure-1PSID=g.a0004ggsehA35sSty2dlvum3Fjr7i3hi8jlG3rbap5lSOfkkNf-LI-tRGgnzmVULgBPVhvz2VQACgYKATASARASFQHGX2MivUAy4TO2FwwwUaLGLJM-pRoVAUF8yKpOae63RB5btaVzHUNRrRc20076; __Secure-3PSID=g.a0004ggsehA35sSty2dlvum3Fjr7i3hi8jlG3rbap5lSOfkkNf-LuSBpzWpKnGEQef2TQfODhgACgYKAXsSARASFQHGX2MiXK-mI-KGq33styEgvqbFGhoVAUF8yKruAW9orIru9ktfYZH8aIK90076; wide=1; __Secure-YNID=14.YT=dsNVbjrYodAJ5HMUojlx3NoP6QFGXX_1NM8qKbmkA2rylijbpaGejy3NMtyrfRjG_qhNgOVfKVIdf0W7pi9lo6YuVZ0CwTUuJOzSl7fGPoQhsyJC3YEPEK_RQLoZW-QNsSC-fUzfQRrUOSNXCIu1Ns90PWS3kn0SIpTpO_iBCELO2N3o8jlRqJetl15YAinjzMTtCJwf8gwxJWihn92UkK2yMk_14a2ivHamr8H5fn8MY74Ek5jsktk532YI0RkuVKb-CZ6eS86ldn4A3odKHhNGOtav7XpsaPxo9wTkWOS1CfToxeDpWrtm_SpqTObU1Qu8r6oUX-zeJAih8xzFJw; __Secure-ROLLOUT_TOKEN=CNbE8On3jpaU7QEQn-OhtZPiiQMYk5PcuZbWkQM%3D; CONSISTENCY=APeVyi92mX65JlT5ILa2Q1Jh0Adsa9_ZEHblcTvd_MBc46_tj5tKne2ghmrXn2lCABDrR24v1flJAehv-pBrNVm2QGjcidZ7HD5flnOa2S1vOZ6zKe1JvjipEjpciH-nQ_EP4kKgA1vDp4QtXz7bQVvw0YXjR6aohvPSBrBnACHLHrOI8H_Js7SqlbkhhuibaTjc8vj1er2VR6dX4rojyv8zN_Pi-g; SIDCC=AKEyXzXoSeuLlFz_2RwfPRVE38SU0lbbMGHIKZQS_Jtp4MRDrarByBaIsE_UBh05sXgKriXO-WM; __Secure-1PSIDCC=AKEyXzXj4Wq0gZTuitYaVyr4x3tld9TZ0yZdxOLfoj9WoXLSal4FLmVUqF40jGPPfapXFVFudVI; __Secure-3PSIDCC=AKEyXzXhRRCiGhIA7Irefgffi3GLfS8jZVdqt_Rg6jg75WkCD8uJPIDprdTGFPvg48DQqFd6a9o; ST-1kmn9b=session_logininfo=AFmmF2swRgIhANhAnb4hsv_Rg-VeNacptviPkkHUrijIXtj1joB5FfCnAiEA24Nzs-ENAl7IlM7-GVW3CNhlItJykMpsaKq_Te1kBVc%3AQUQ3MjNmenN1UkN6NG1rTDQ3MWxmQVlhSU5GcDExVERUUU5Ubl9pRGhBYl9JSlp0WnlaOTdueVdfZ3NrVHdQVVN0aWltWXRhM0RIeDRDdWNCTFI1QVhZZW9aMGZXcGVCR1VCalQxUjI3S2ZLOHpnV2NhRkJPUzdQU2tpY0o1WXFZNkp4M1BmclZGZldYc2p5QkZHVG5KeFBqcmFPMng1Mnd3; ST-1x29qd6=session_logininfo=AFmmF2swRgIhANhAnb4hsv_Rg-VeNacptviPkkHUrijIXtj1joB5FfCnAiEA24Nzs-ENAl7IlM7-GVW3CNhlItJykMpsaKq_Te1kBVc%3AQUQ3MjNmenN1UkN6NG1rTDQ3MWxmQVlhSU5GcDExVERUUU5Ubl9pRGhBYl9JSlp0WnlaOTdueVdfZ3NrVHdQVVN0aWltWXRhM0RIeDRDdWNCTFI1QVhZZW9aMGZXcGVCR1VCalQxUjI3S2ZLOHpnV2NhRkJPUzdQU2tpY0o1WXFZNkp4M1BmclZGZldYc2p5QkZHVG5KeFBqcmFPMng1Mnd3",
    Referer: "https://www.youtube.com/watch?v=" + videoId,
  },
  body: `{\"context\":{\"client\":{\"hl\":\"ja\",\"gl\":\"JP\",\"remoteHost\":\"2405:6587:3c0:be00:577:c396:ab46:35b9\",\"deviceMake\":\"\",\"deviceModel\":\"\",\"visitorData\":\"CgtuRTNiN1dHeHZkcyjQkM7IBjIKCgJKUBIEGgAgHw%3D%3D\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36,gzip(gfe)\",\"clientName\":\"WEB\",\"clientVersion\":\"2.20251110.06.00\",\"osName\":\"Windows\",\"osVersion\":\"10.0\",\"originalUrl\":\"https://www.youtube.com/watch?v=${videoId}\",\"platform\":\"DESKTOP\",\"clientFormFactor\":\"UNKNOWN_FORM_FACTOR\",\"windowWidthPoints\":3108,\"configInfo\":{\"appInstallData\":\"CNCQzsgGEODNsQUQ5aTQHBCClNAcELfJzxwQzOvPHBCrptAcEMGP0BwQrbWAExCnpdAcEJT-sAUQ-dDPHBDhjNAcEN7pzxwQw5HQHBDL0bEFEMzfrgUQgo_PHBCHrM4cEIiT0BwQ8p3QHBCZjbEFEJb7rwUQs5DPHBCM6c8cEOWygBMQudnOHBCU8s8cEPDMzxwQltvPHBC-poATEJ3QsAUQkYz_EhCTmYATEN68zhwQ9quwBRDI988cEIOe0BwQk4PQHBCrnc8cEPXVzhwQppqwBRCL988cEPWX0BwQpZ_QHBDT4a8FEMn3rwUQ2vfOHBC7lNAcEIiHsAUQgc3OHBD7_88cELjkzhwQ47jPHBCV988cEL2ZsAUQm_bPHBDi1K4FENHgzxwQ87OAExCr-M4cEKCn0BwQjcywBRCc188cELvZzhwQh4PQHBCJsM4cEMT0zxwQzdGxBRCu1s8cEInorgUQvoqwBRC1l9AcEL22rgUQ15bQHBC36v4SEPyyzhwQ85DQHBDjldAcEJW0zxwQ7IzQHCpYQ0FNU1BCVV8tWnEtRExpVUV2Y0J4TmZtQzhQc0ZMWE1Cb2RNTXFDc0JBUEc2UVdQRGZtQ0JxQUdvaTZrWXIwVjFpU01adllQaFJUaUk4M3A0aDRkQnc9PTAA\",\"coldConfigData\":\"CNCQzsgGEOm6rQUQvbauBRDi1K4FEJb7rwUQvoqwBRCd0LAFEM_SsAUQ4_iwBRCvp84cEPyyzhwQ9dXOHBDK4s4cEKudzxwQnqvPHBDtts8cEOO4zxwQ-MbPHBD50M8cENvTzxwQnNfPHBDH2s8cELDgzxwQz-DPHBDR4M8cELrmzxwQm_bPHBCvgtAcEJOD0BwQ1YPQHBCIhtAcEOyM0BwQ85DQHBDjldAcENeW0BwQsZfQHBCDntAcEP2g0BwQgaLQHBCYotAcEKel0BwQq6bQHBCgp9AcGjJBT2pGb3gwbTZXa1NaOGFsY2Fic3ZCVmZkb01aeV9IZDVzQngzNDlSOVhHeHplam5aQSIyQU9qRm94MWxha01TSHJ4WlAtdG5SRUxXQkNjdXQ1SWxFU0hqbktNTnJRcXRrcmEybGcqkAFDQU1TYUEwdHVOMjNBcVFabHgtZlQ3dU9taERtRFBrTy1nQ05OdjRqcHczdEFwY0thalNkRm9nUHdRR2FDNTBHRlQyWnNiY2ZoYVFGa1p3RjRkc0IwTElCOTRnR3lGcV9SZjNVQmpMUGdBWFpwQVlEb3JJRnVqek5lc1lKOHdPcWlBYkRpQWFiUTc2dUJwSUs%3D\",\"coldHashData\":\"CNCQzsgGEhM3NDk0MjMyMzQ4MDI5MjkxMDczGNCQzsgGMjJBT2pGb3gwbTZXa1NaOGFsY2Fic3ZCVmZkb01aeV9IZDVzQngzNDlSOVhHeHplam5aQToyQU9qRm94MWxha01TSHJ4WlAtdG5SRUxXQkNjdXQ1SWxFU0hqbktNTnJRcXRrcmEybGdCkAFDQU1TYUEwdHVOMjNBcVFabHgtZlQ3dU9taERtRFBrTy1nQ05OdjRqcHczdEFwY0thalNkRm9nUHdRR2FDNTBHRlQyWnNiY2ZoYVFGa1p3RjRkc0IwTElCOTRnR3lGcV9SZjNVQmpMUGdBWFpwQVlEb3JJRnVqek5lc1lKOHdPcWlBYkRpQWFiUTc2dUJwSUs%3D\",\"hotHashData\":\"CNCQzsgGEhMyNTgxMDE0ODI3NjM0NDMzMTkzGNCQzsgGKJTk_BIopdD9EijZmf4SKMjK_hIot-r-EiiRjP8SKPeQgBMoy5GAEyjllIATKJOZgBMotZuAEyi-poATKNiwgBMo5bKAEyjOtIATKLC3gBMon7iAEyiluIATKKu6gBMyMkFPakZveDBtNldrU1o4YWxjYWJzdkJWZmRvTVp5X0hkNXNCeDM0OVI5WEd4emVqblpBOjJBT2pGb3gxbGFrTVNIcnhaUC10blJFTFdCQ2N1dDVJbEVTSGpuS01OclFxdGtyYTJsZ0I0Q0FNU0lnMEtvdGY2RmE3QkJwTk5zeGJNUnhVVzNjX0NETlBvRC11MzVndll6UW56a0FRPQ%3D%3D\"},\"screenDensityFloat\":1,\"userInterfaceTheme\":\"USER_INTERFACE_THEME_DARK\",\"timeZone\":\"Asia/Tokyo\",\"browserName\":\"Chrome\",\"browserVersion\":\"140.0.0.0\",\"acceptHeader\":\"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7\",\"deviceExperimentId\":\"ChxOelUzTVRVME5USTNOekV6T0RFM05qWTNOZz09ENCQzsgGGNCQzsgG\",\"rolloutToken\":\"CNbE8On3jpaU7QEQn-OhtZPiiQMYpp7wkrLqkAM%3D\",\"screenWidthPoints\":2578,\"screenHeightPoints\":1282,\"screenPixelDensity\":1,\"utcOffsetMinutes\":540,\"connectionType\":\"CONN_CELLULAR_4G\",\"memoryTotalKbytes\":\"8000000\",\"mainAppWebInfo\":{\"graftUrl\":\"https://www.youtube.com/watch?v=${videoId}\",\"pwaInstallabilityStatus\":\"PWA_INSTALLABILITY_STATUS_CAN_BE_INSTALLED\",\"webDisplayMode\":\"WEB_DISPLAY_MODE_BROWSER\",\"isWebNativeShareAvailable\":true},\"clientScreen\":\"CHANNEL\"},\"user\":{\"lockedSafetyMode\":false},\"request\":{\"useSsl\":true,\"consistencyTokenJars\":[{\"encryptedTokenJarContents\":\"AKreu9s4rFyykzyijmXQq_jCilSM4WTkI4Ulqq4h18OTC0Eim7ESoyG0UxARNJki4WigcmSiTeEG-aB08PvTcp1d4HeLVzAKjxFpGD-2tTbqGf_i1PVIdWdldCUoeJL_svEw__rzcHtKgbfnjsOzSdXcUKaDbDKz9TB7v03hIZ4he3gGhJ5DHf-DWI0hjVyIYJ8prZgj3AUQ5StirN-PJDuJDcyX9A\",\"expirationSeconds\":\"600\"}],\"internalExperimentFlags\":[]},\"clickTracking\":{\"clickTrackingParams\":\"CAUQo9wPGAIiEwikpqPf5OqQAxVBtrkFHdOPNl3KAQTz8kGK\"},\"adSignalsInfo\":{\"params\":[{\"key\":\"dt\",\"value\":\"1762887762331\"},{\"key\":\"flash\",\"value\":\"0\"},{\"key\":\"frm\",\"value\":\"0\"},{\"key\":\"u_tz\",\"value\":\"540\"},{\"key\":\"u_his\",\"value\":\"2\"},{\"key\":\"u_h\",\"value\":\"1440\"},{\"key\":\"u_w\",\"value\":\"3440\"},{\"key\":\"u_ah\",\"value\":\"1392\"},{\"key\":\"u_aw\",\"value\":\"3440\"},{\"key\":\"u_cd\",\"value\":\"24\"},{\"key\":\"bc\",\"value\":\"31\"},{\"key\":\"bih\",\"value\":\"1282\"},{\"key\":\"biw\",\"value\":\"2563\"},{\"key\":\"brdim\",\"value\":\"0,0,0,0,3440,0,3440,1392,2578,1282\"},{\"key\":\"vis\",\"value\":\"1\"},{\"key\":\"wgl\",\"value\":\"true\"},{\"key\":\"ca_type\",\"value\":\"image\"}]}},\"actions\":[{\"addedVideoId\":\"${videoId}\",\"action\":\"ACTION_ADD_VIDEO\"}],\"params\":\"IAE%3D\",\"playlistId\":\"PLXQE_C7He7f9MKGP11OpI8jw187fOgg_3\"}`,
  method: "POST",
});

const API_URL = "https://www.youtube.com/youtubei/v1/browse/edit_playlist?prettyPrint=false"; // ← DevToolsからコピー

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
