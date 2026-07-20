/** @typedef {{ file: string, playlistId: string }} PlaylistTarget */

/** @type {Record<string, PlaylistTarget>} */
const PLAYLISTS = {
  uma: {
    file: "./data/data_uma.tsv",
    playlistId: "PLXQE_C7He7f9MKGP11OpI8jw187fOgg_3",
  },
  yume: {
    file: "./data/data_yumesute.tsv",
    playlistId: "PLXQE_C7He7f-8x004izcc7VUoapJqVcii",
  },
  umaost: {
    file: "./data/data_umaost.tsv",
    playlistId: "PLXQE_C7He7f_XHyR-qrqV8maID8emw3Xb",
  },
};

/**
 * @param {string | undefined} arg
 * @returns {PlaylistTarget}
 */
export function resolvePlaylist(arg) {
  if (!arg) {
    throw new Error(
      `playlist name required: ${Object.keys(PLAYLISTS).join(" | ")} | playlist URL`
    );
  }

  if (PLAYLISTS[arg]) {
    return { ...PLAYLISTS[arg] };
  }

  if (arg.includes("youtube.com/playlist?list")) {
    const m = arg.match(/[?&]list=([^&]+)/);
    if (!m) throw new Error(`could not parse playlist id from URL: ${arg}`);
    return { file: "./data/temp.tsv", playlistId: m[1] };
  }

  throw new Error(
    `unknown playlist "${arg}". use: ${Object.keys(PLAYLISTS).join(" | ")} | playlist URL`
  );
}

export function listPlaylistNames() {
  return Object.keys(PLAYLISTS);
}
