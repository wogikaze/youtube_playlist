const { Innertube, UniversalCache } = require("youtubei.js");

const fs = require("fs");

fs.readFile("data.csv", "utf-8", (err, data) => {
    if (err) throw err;
    const lines = data.split("\n");
    const ids = lines.map(e => e.split("	")[2].replace("\r", ""))
    // console.log(ids)
});

(async () => {
    const yt = await Innertube.create({
        cache: new UniversalCache(false), generate_session_locally: true,
    });

    const playlist = await yt.getPlaylist("PLXQE_C7He7f-8x004izcc7VUoapJqVcii")
    const item_ids = playlist.items.map((i,index) => `${index}  ${i.title}  ${i.id}`)
    console.log(item_ids.join("\n"))
})();

// ユメステ
// https://www.youtube.com/playlist?list=PLXQE_C7He7f-8x004izcc7VUoapJqVcii
// ウマ娘
// PLXQE_C7He7f9MKGP11OpI8jw187fOgg_3