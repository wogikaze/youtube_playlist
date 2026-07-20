import "dotenv/config";
import { resolvePlaylist } from "./lib/playlists.js";
import { writeRows } from "./lib/tsv.js";

const arg = process.argv[2];
console.log(`[pull] ${arg}`);
const target = resolvePlaylist(arg);

const { createClient, listAllPlaylistItems } = await import("./lib/youtube.js");
const yt = await createClient();
const items = await listAllPlaylistItems(yt, target.playlistId);
console.log(`[pull] fetched ${items.length} videos`);

writeRows(target.file, items);
console.log(`[pull] wrote ${target.file}`);
