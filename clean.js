import { resolvePlaylist } from "./lib/playlists.js";
import { readRows, writeRows } from "./lib/tsv.js";

const arg = process.argv[2];
console.log(`[clean] ${arg}`);
const target = resolvePlaylist(arg);
const rows = readRows(target.file);

// Always refresh titles from YouTube so renamed videos and imported titles stay current.
const needFetch = rows.some((r) => r.id);
if (needFetch) {
  const { Innertube } = await import("youtubei.js");
  const yt = await Innertube.create({});
  await Promise.all(
    rows.map(async (row) => {
      if (!row.id) return;
      try {
        const info = await yt.getInfo(row.id);
        row.title = (info.basic_info.title || "").replace(/\t|\n/g, " ");
      } catch {
        /* keep empty title */
      }
    })
  );
}

writeRows(target.file, rows);
console.log(`[clean] wrote ${target.file}: ${rows.length} videos`);
