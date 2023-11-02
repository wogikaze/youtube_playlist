const { Innertube, UniversalCache } = require("youtubei.js");
const playlist_type = process.argv[0]
if (playlist_type == "uma") { 
  [csv_file,playlist_id] = ["data_uma.csv", "PLXQE_C7He7f9MKGP11OpI8jw187fOgg_3"]
}else {
  [csv_file,playlist_id] = ["data_yumesute.csv", "PLXQE_C7He7f-8x004izcc7VUoapJqVcii"]
}
const fs = require("fs");
let ids = []   //add ids
fs.readFile(csv_file, "utf-8", (err, data) => {
  if (err) throw err;
  const lines = data.split("\n");
  // console.log(lines)
  ids = lines.map(e => e.split("	")[2].replace("\r", ""))
});

(async () => {
  const yt = await Innertube.create({
    cache: new UniversalCache(false), generate_session_locally: true,
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

  // const playlist = await yt.getPlaylist("PLXQE_C7He7f-8x004izcc7VUoapJqVcii")
  // const item_ids = playlist.items.map(i => i.id)

  await yt.playlist.removeVideos('PLXQE_C7He7f-8x004izcc7VUoapJqVcii', item_ids);




  console.log(ids)
  await yt.playlist.addVideos(playlist_id, ids);
})();

// ユメステ
// PLXQE_C7He7f-8x004izcc7VUoapJqVcii
// ウマ娘
// PLXQE_C7He7f9MKGP11OpI8jw187fOgg_3