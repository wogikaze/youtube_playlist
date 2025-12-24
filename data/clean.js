

// ESM対応: import文に変更
import { Innertube } from "youtubei.js";
import fs from "fs";

const playlist_type = process.argv[2];
console.log(playlist_type);
let csv_file, playlist_id;
if (playlist_type == "uma") {
  [csv_file, playlist_id] = ["data_uma.tsv", "PLXQE_C7He7f9MKGP11OpI8jw187fOgg_3"];
} else if (playlist_type == "yume") {
  [csv_file, playlist_id] = ["data_yumesute.tsv", "PLXQE_C7He7f-8x004izcc7VUoapJqVcii"];
} else if (playlist_type == "umaost") {
  [csv_file, playlist_id] = ["data_umaost.tsv", "PLXQE_C7He7f_XHyR-qrqV8maID8emw3Xb"];
} else if (playlist_type.includes("https://www.youtube.com/playlist?list")) {
  const reg = /playlist\?list=(.*?)($|&)/g;
  playlist_id = [...playlist_type.matchAll(reg)][0][1];
  csv_file = "temp.tsv";
} else {
  csv_file = "";
  playlist_id = "PLNv8UdsukO8AnXbb58ANWhuWPQG3AOO6h";
  console.error("hmm?");
}


(async () => {
  const yt = await Innertube.create({}); // cookieなし
  const lines = fs.readFileSync(csv_file, 'utf8').split(/\r?\n/).filter(l => l.trim() !== '');
  let results = [];
  let fetchPromises = [];

  // 1列（URLのみ）を非同期でfetch

  for (let i = 0; i < lines.length; i++) {
    const cols = lines[i].split('\t');
    if (cols.length === 3) {
      // 3列ならタイトル・idそのまま、行番号のみ振り直し
      results[i] = { title: cols[1], id: cols[2] };
    } else if (cols.length === 1) {
      // 1列ならURLから動画ID抽出
      const url = cols[0];
      const m = url.match(/v=([\w-]{11})/);
      const vid = m ? m[1] : null;
      if (vid) {
        // fetchでタイトル取得
        fetchPromises.push(
          yt.getInfo(vid).then(info => {
            const title = info.basic_info.title.replace(/\t|\n/g, ' ');
            results[i] = { title, id: vid };
          }).catch(() => {
            results[i] = { title: '', id: vid };
          })
        );
      } else {
        results[i] = { title: '', id: '' };
      }
    }
  }

  // fetch完了まで待つ
  await Promise.all(fetchPromises);

  // 行番号振り直し
  const output = results.map((r, idx) => `${idx + 1}\t${r.title}\t${r.id}`);
  fs.writeFileSync(csv_file, output.join("\n"), "utf8");
  console.log(`${csv_file} written:`, output.length, 'videos');
})();
