import "dotenv/config";
import { resolvePlaylist } from "./lib/playlists.js";
import { readVideoIds } from "./lib/tsv.js";

const target = resolvePlaylist(process.argv[2]);
const ids = readVideoIds(target.file);
const accountIndex = Number(process.env.ACCOUNT_INDEX ?? 2);

console.log(`[push] account_index=${accountIndex}`);
console.log(`[push] ${target.file} -> ${target.playlistId} (${ids.length} videos)`);

const { createClient, replacePlaylist } = await import("./lib/youtube.js");
const yt = await createClient({ accountIndex });
const result = await replacePlaylist(yt, target.playlistId, ids);
console.log(`[push] removed=${result.removed} added=${result.added}`);
console.log("[push] addVideos result:", result.addResult);
