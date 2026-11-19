import { Innertube } from "youtubei.js";

/**
 * @param {{ cookie?: string, accountIndex?: number }} [opts]
 */
export async function createClient(opts = {}) {
  const cookie = opts.cookie ?? process.env.COOKIE;
  const accountIndex = Number(
    opts.accountIndex ?? process.env.ACCOUNT_INDEX ?? 2
  );
  return Innertube.create({
    cookie,
    account_index: accountIndex,
  });
}

/**
 * @param {any} item
 * @returns {string | undefined}
 */
export function getVideoId(item) {
  return item?.id || item?.content_id || item?.entity_id || undefined;
}

/**
 * @param {any} item
 * @returns {{ title: string, id: string }}
 */
export function extractVideo(item) {
  const title =
    item.title || item.metadata?.title || item.overlay_metadata?.primary_text;
  const id = getVideoId(item);
  return {
    title: title ? String(title) : "",
    id: id ? String(id) : "",
  };
}

/**
 * @param {import("youtubei.js").Innertube} yt
 * @param {string} playlistId
 * @returns {Promise<{ title: string, id: string }[]>}
 */
export async function listAllPlaylistItems(yt, playlistId) {
  let playlist = await yt.getPlaylist(playlistId);
  const items = [...(playlist.items || [])];

  while (playlist.has_continuation) {
    playlist = await playlist.getContinuation();
    items.push(...(playlist.items || []));
  }

  return items.map(extractVideo).filter((v) => v.id);
}

function sameVideoOrder(actualIds, expectedIds) {
  return actualIds.length === expectedIds.length &&
    actualIds.every((id, index) => id === expectedIds[index]);
}

function assertPlaylistEditOk(result, action, actualIds, expectedIds) {
  if (sameVideoOrder(actualIds, expectedIds)) {
    return;
  }

  if (JSON.stringify(result ?? {}).includes("Sign in to add this video to a playlist")) {
    throw new Error(
      `${action} failed: not signed in. Refresh COOKIE in .env and retry.`
    );
  }
  const detail = actualIds.length === expectedIds.length
    ? `${actualIds.length} videos, but the IDs or order differ`
    : `expected ${expectedIds.length} videos, found ${actualIds.length}`;
  throw new Error(`${action} could not be verified: ${detail}.`);
}

/**
 * Replace playlist contents with the given video ids.
 * @param {import("youtubei.js").Innertube} yt
 * @param {string} playlistId
 * @param {string[]} ids
 */
export async function replacePlaylist(yt, playlistId, ids) {
  const current = await listAllPlaylistItems(yt, playlistId);
  const currentIds = current.map((v) => v.id);

  if (sameVideoOrder(currentIds, ids)) {
    return { removed: 0, added: 0, addResult: null };
  }

  if (currentIds.length) {
    const removeResult = await yt.playlist.removeVideos(playlistId, currentIds);
    const remaining = await listAllPlaylistItems(yt, playlistId);
    assertPlaylistEditOk(removeResult, "removeVideos", remaining.map((v) => v.id), []);
  }

  if (!ids.length) {
    return { removed: currentIds.length, added: 0, addResult: null };
  }

  const addResult = await yt.playlist.addVideos(playlistId, ids);
  const updated = await listAllPlaylistItems(yt, playlistId);
  assertPlaylistEditOk(addResult, "addVideos", updated.map((v) => v.id), ids);
  return { removed: currentIds.length, added: ids.length, addResult };
}
