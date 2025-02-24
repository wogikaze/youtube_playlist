const { Innertube, UniversalCache } = require("youtubei.js");
const playlist_type = process.argv[2];
if (playlist_type == "uma") {
  [csv_file, playlist_id] = ["data_uma.tsv", "PLXQE_C7He7f9MKGP11OpI8jw187fOgg_3"];
} else if (playlist_type == "yume") {
  [csv_file, playlist_id] = ["data_yumesute.tsv", "PLXQE_C7He7f-8x004izcc7VUoapJqVcii"];
} else if (playlist_type == "umaost") {
  [csv_file, playlist_id] = ["data_umaost.tsv", "PLXQE_C7He7f_XHyR-qrqV8maID8emw3Xb"];
}
const fs = require("fs");
let ids = [];   //add ids
fs.readFile(csv_file, "utf-8", (err, data) => {
  if (err) throw err;
  let lines = data.split("\n");
  console.log(lines);
  lines = lines.map(line => {
    if (line.includes("youtube.com")) {
      return line.replace(/https:\/\/www\.youtube.com\/watch\?v=(.*?)(&.*|$)/, "0\t0\t$1");
    } else { return line; }
  });
  ids = lines.map(e => e?.split("	")[2]);
});

(async () => {
  const yt = await Innertube.create({
    cache: new UniversalCache(false),
    generate_session_locally: true,
  });

  // await yt.session.oauth.cacheCredentials();
  // 'auth-pending' is fired with the info needed to sign in via OAuth.
  yt.session.on('auth-pending', (data) => {
    console.log(`Go to ${data.verification_url} in your browser and enter code ${data.user_code} to authenticate.`);
  });

  yt.session.on('auth', ({ credentials }) => {
    console.log('Sign in successful:', credentials);
  });

  yt.session.on('update-credentials', ({ credentials }) => {
    console.log('Credentials updated:', credentials);
  });

  await yt.session.signIn();

  await yt.session.oauth.cacheCredentials();

  //すでにある要素を削除
  let playlist = await yt.getPlaylist(playlist_id);
  let item_ids = playlist.items.map(i => i.id);
  if (item_ids.length == 100) {
    while (playlist.has_continuation) {
      playlist = await playlist.getContinuation();

      item_ids.push(...playlist.items.map(i => i.id));
    }
  }
  await yt.playlist.removeVideos(playlist_id, item_ids);

  console.log(item_ids);



  console.log(ids);
  await yt.playlist.addVideos(playlist_id, ids);
})();

// ユメステ
// PLXQE_C7He7f-8x004izcc7VUoapJqVcii
// ウマ娘
// PLXQE_C7He7f9MKGP11OpI8jw187fOgg_3
// ウマ娘OST
// PLXQE_C7He7f_XHyR-qrqV8maID8emw3Xb