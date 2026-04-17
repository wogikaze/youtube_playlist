import { Innertube, UniversalCache } from "youtubei.js";
import fs from "fs";
import 'dotenv/config'

const playlist_type = process.argv[2];
let csv_file, playlist_id;
if (playlist_type == "uma") {
    [csv_file, playlist_id] = ["./data/data_uma.tsv", "PLXQE_C7He7f9MKGP11OpI8jw187fOgg_3"];
} else if (playlist_type == "yume") {
    [csv_file, playlist_id] = ["./data/data_yumesute.tsv", "PLXQE_C7He7f-8x004izcc7VUoapJqVcii"];
} else if (playlist_type == "umaost") {
    [csv_file, playlist_id] = ["./data/data_umaost.tsv", "PLXQE_C7He7f_XHyR-qrqV8maID8emw3Xb"];
}
let ids = [];   //add ids
const data = fs.readFileSync(csv_file, "utf-8");
let lines = data.split("\n");
lines = lines.map(line => {
    if (line.includes("youtube.com")) {
        return line.replace(/https:\/\/www\.youtube\.com\/watch\?v=(.*?)(&.*|$)/, "0\t0\t$1");
    }
    return line;
});
ids = lines.map(e => e?.split("\t")[2]).filter(Boolean);

(async () => {
    const account_index = Number(process.env.ACCOUNT_INDEX ?? 2);
    console.log(`[debug] using account_index=${account_index}`);
    const yt = await Innertube.create({
        // cache: new UniversalCache(false),
        // generate_session_locally: true,
        cookie: process.env.COOKIE,
        account_index
    });
    // console.log(process.env.COOKIE)
    // 'auth-pending' is fired with the info needed to sign in via OAuth.
    // yt.session.on('auth-pending', (data) => {
    //     console.log(`Go to ${data.verification_url} in your browser and enter code ${data.user_code} to authenticate.`);
    // });

    // yt.session.on('auth', ({ credentials }) => {
    //     console.log('Sign in successful:', credentials);
    // });

    // yt.session.on('update-credentials', ({ credentials }) => {
    //     console.log('Credentials updated:', credentials);
    // });

    // await yt.session.signIn();

    // await yt.session.oauth.cacheCredentials();

    //すでにある要素を削除
    let playlist = await yt.getPlaylist(playlist_id);
    let item_ids = playlist.items.map(i => i.id);
    if (item_ids.length == 100) {
        while (playlist.has_continuation) {
            playlist = await playlist.getContinuation();

            item_ids.push(...playlist.items.map(i => i.id));
        }
    }
    // await yt.playlist.removeVideos(playlist_id, item_ids);

    // console.log(item_ids);

    console.log(ids);
    const addResult = await yt.playlist.addVideos(playlist_id, ids);
    console.log('[debug] addVideos result:', addResult);
})();

// ユメステ
// PLXQE_C7He7f-8x004izcc7VUoapJqVcii
// ウマ娘
// PLXQE_C7He7f9MKGP11OpI8jw187fOgg_3
// ウマ娘OST
// PLXQE_C7He7f_XHyR-qrqV8maID8emw3Xb