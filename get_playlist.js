const { Innertube, UniversalCache } = require("youtubei.js");
const playlist_type = process.argv[2]
console.log(playlist_type)
if (playlist_type == "uma") {
    [csv_file, playlist_id] = ["data_uma.tsv", "PLXQE_C7He7f9MKGP11OpI8jw187fOgg_3"]
} else {
    [csv_file, playlist_id] = ["data_yumesute.tsv", "PLXQE_C7He7f-8x004izcc7VUoapJqVcii"]
}
const fs = require("fs");

(async () => {
    const yt = await Innertube.create({
        cache: new UniversalCache(false), generate_session_locally: true,
    });
    let index = 0
    let playlist = await yt.getPlaylist(playlist_id)
    let item_ids = playlist.items.map((i) => { index++; return `${index}	${i.title}	${i.id}`; })
    console.log(item_ids)
    if (item_ids.length == 100) {
        while (playlist.has_continuation) {
            playlist = await playlist.getContinuation()

            item_ids.push(...playlist.items.map((i) => { index++; return `${index}	${i.title}	${i.id}`; }))
        }
    }

    fs.writeFile(csv_file, item_ids.join("\n"), (err) => {
        if (err) {
            console.error('ファイルの書き込み中にエラーが発生しました:', err);
        } else {
            console.log('ファイルが正常に書き込まれました。');
        }
    });
})();

// ユメステ
// PLXQE_C7He7f-8x004izcc7VUoapJqVcii
// ウマ娘
// PLXQE_C7He7f9MKGP11OpI8jw187fOgg_3