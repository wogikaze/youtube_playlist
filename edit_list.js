// editPlaylist.js
import 'dotenv/config';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import { URLSearchParams } from 'node:url';

const {
    CLIENT_ID,
    CLIENT_SECRET,
    PLAYLIST_ID,
    VIDEO_IDS,
} = process.env;
const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const API = 'https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet';
const TOKEN_FILE = 'tokens.json';

/* -- refresh access_token from saved refresh_token -- */
async function getAccessToken() {
    const { refresh_token } = JSON.parse(await fs.readFile(TOKEN_FILE, 'utf8'));
    const params = new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token,
    });
    const resp = await fetch(TOKEN_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params,
    });
    if (!resp.ok) throw new Error(await resp.text());
    const { access_token } = await resp.json();
    return access_token;
}

/* -- get playlist items -- */
async function getPlaylistItems(accessToken, playlistId) {
    const items = [];
    let nextPageToken = '';

    do {
        const url = `https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;
        const resp = await fetch(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!resp.ok) throw new Error(await resp.text());
        const data = await resp.json();

        items.push(...data.items.map(item => ({
            id: item.id,
            videoId: item.snippet.resourceId.videoId,
            position: item.snippet.position
        })));
        nextPageToken = data.nextPageToken;
    } while (nextPageToken);

    return items;
}

/* -- remove one video from playlist -- */
async function removeItem(accessToken, itemId) {
    const url = `https://youtube.googleapis.com/youtube/v3/playlistItems?id=${itemId}`;
    const resp = await fetch(url, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    if (!resp.ok) throw new Error(await resp.text());
}

/* -- sync playlist with TSV order -- */
async function syncPlaylistWithTSV(accessToken, playlistId, targetVideoIds) {
    console.log('Fetching existing playlist items...');
    const existingItems = await getPlaylistItems(accessToken, playlistId);
    console.log(`Found ${existingItems.length} existing items in playlist`);

    // Sort existing items by position to ensure correct order
    existingItems.sort((a, b) => a.position - b.position);

    let currentIndex = 0;

    // For each target video ID, remove items until we find it or reach the end
    for (let i = 0; i < targetVideoIds.length; i++) {
        const targetVideoId = targetVideoIds[i];
        console.log(`\nProcessing target video ${i + 1}/${targetVideoIds.length}: ${targetVideoId}`);

        // Remove items until we find the target video or run out of items
        while (currentIndex < existingItems.length &&
            existingItems[currentIndex].videoId !== targetVideoId) {

            const itemToRemove = existingItems[currentIndex];
            console.log(`✗ Removing misplaced video: ${itemToRemove.videoId} (position ${currentIndex})`);

            try {
                await removeItem(accessToken, itemToRemove.id);
                console.log(`✔ Removed item at position ${currentIndex}`);
            } catch (error) {
                console.error(`✗ Failed to remove item ${itemToRemove.id}:`, error.message);
            }

            currentIndex++;
        }

        // If we found the target video at the correct position, move to next
        if (currentIndex < existingItems.length &&
            existingItems[currentIndex].videoId === targetVideoId) {
            console.log(`✔ Video ${targetVideoId} already in correct position ${i}`);
            currentIndex++;
        } else {
            console.log(`+ Video ${targetVideoId} needs to be added at position ${i}`);
        }
    }

    // Remove any remaining items beyond our target list
    while (currentIndex < existingItems.length) {
        const itemToRemove = existingItems[currentIndex];
        console.log(`✗ Removing extra video: ${itemToRemove.videoId} (position ${currentIndex})`);

        try {
            await removeItem(accessToken, itemToRemove.id);
            console.log(`✔ Removed extra item at position ${currentIndex}`);
        } catch (error) {
            console.error(`✗ Failed to remove item ${itemToRemove.id}:`, error.message);
        }

        currentIndex++;
    }
}

/* -- insert one video -- */
async function insert(accessToken, playlistId, videoId, position) {
    // First validate the video exists
    const videoCheckUrl = `https://youtube.googleapis.com/youtube/v3/videos?part=id&id=${videoId}`;
    const videoCheckResp = await fetch(videoCheckUrl, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!videoCheckResp.ok) {
        throw new Error(`Failed to check video existence: ${await videoCheckResp.text()}`);
    }

    const videoData = await videoCheckResp.json();
    if (!videoData.items || videoData.items.length === 0) {
        throw new Error(`Video ${videoId} does not exist or is not available`);
    }

    const body = {
        snippet: {
            playlistId,
            position,
            resourceId: { kind: 'youtube#video', videoId },
        },
    };
    const resp = await fetch(API, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
    if (!resp.ok) {
        const errorText = await resp.text();
        throw new Error(`HTTP ${resp.status}: ${errorText}`);
    }
    return await resp.json();
}

/* -- get playlist configuration based on type -- */
function getPlaylistConfig(playlistType) {
    const configs = {
        uma: {
            csvFile: "data_uma.tsv",
            playlistId: "PLXQE_C7He7f9MKGP11OpI8jw187fOgg_3"
        },
        yume: {
            csvFile: "data_yumesute.tsv",
            playlistId: "PLXQE_C7He7f-8x004izcc7VUoapJqVcii"
        },
        umaost: {
            csvFile: "data_umaost.tsv",
            playlistId: "PLXQE_C7He7f_XHyR-qrqV8maID8emw3Xb"
        }
    };
    return configs[playlistType];
}

/* -- read video IDs from TSV file -- */
async function readVideoIdsFromTSV(csvFile) {
    try {
        const data = await fs.readFile(csvFile, 'utf-8');
        let lines = data.split('\n');

        // Convert YouTube URLs to video IDs
        lines = lines.map(line => {
            if (line.includes('youtube.com')) {
                return line.replace(/https:\/\/www\.youtube\.com\/watch\?v=(.*?)(&.*|$)/, "0\t0\t$1");
            }
            return line;
        });

        // Extract video IDs (3rd column, index 2)
        const ids = lines.map(line => line?.split('\t')[2]).filter(Boolean);
        return ids;
    } catch (err) {
        console.error(`Error reading ${csvFile}:`, err);
        return [];
    }
}

/* -- main -- */
(async () => {
    try {
        const playlistType = process.argv[2];

        if (!playlistType) {
            console.log('Usage: node edit_list.js <playlist_type>');
            console.log('Available types: uma, yume, umaost');
            console.log('Or use VIDEO_IDS environment variable for manual video list');
            return;
        }

        let videoIds = [];
        let playlistId = PLAYLIST_ID;

        // Check if using predefined playlist types
        if (['uma', 'yume', 'umaost'].includes(playlistType)) {
            const config = getPlaylistConfig(playlistType);
            if (!config) {
                console.error(`Unknown playlist type: ${playlistType}`);
                return;
            }

            console.log(`Processing ${playlistType} playlist...`);
            videoIds = await readVideoIdsFromTSV(config.csvFile);
            playlistId = config.playlistId;
            console.log(`Found ${videoIds.length} video IDs in ${config.csvFile}`);
        } else {
            // Fallback to VIDEO_IDS environment variable
            if (!VIDEO_IDS) {
                console.error('VIDEO_IDS environment variable not set');
                return;
            }
            videoIds = VIDEO_IDS.split(',').map(s => s.trim()).filter(Boolean);
        }

        // Use OAuth method to sync playlist
        const token = await getAccessToken();

        // Sync existing playlist with TSV order (remove misplaced items)
        await syncPlaylistWithTSV(token, playlistId, videoIds);

        // Get current playlist state after cleanup
        console.log('\nFetching updated playlist state...');
        const currentItems = await getPlaylistItems(token, playlistId);
        const currentVideoIds = currentItems.map(item => item.videoId);

        // Add missing videos
        console.log(`\nAdding missing videos to playlist ${playlistId}...`);
        let addedCount = 0;
        let skippedCount = 0;

        for (let i = 0; i < videoIds.length; i++) {
            const targetVideoId = videoIds[i];

            // Check if this video is already in the correct position
            if (i < currentVideoIds.length && currentVideoIds[i] === targetVideoId) {
                console.log(`✔ Video ${targetVideoId} already in position ${i}`);
                continue;
            }

            // Add the missing video
            try {
                const item = await insert(token, playlistId, targetVideoId, i);
                console.log(`✔ Added https://youtu.be/${item.snippet.resourceId.videoId} at position ${i}`);
                addedCount++;

                // Update our tracking of current state
                currentVideoIds.splice(i, 0, targetVideoId);
            } catch (error) {
                skippedCount++;
                if (error.message.includes('does not exist')) {
                    console.error(`⚠ Skipping invalid/deleted video ${targetVideoId} at position ${i}: Video not found`);
                } else if (error.message.includes('HTTP 400')) {
                    console.error(`⚠ Skipping problematic video ${targetVideoId} at position ${i}: Invalid request (possibly private/deleted)`);
                } else {
                    console.error(`✗ Failed to add video ${targetVideoId} at position ${i}: ${error.message}`);
                }

                // Continue processing without this video - don't add it to currentVideoIds
                // This will effectively skip the problematic video
            }
        }

        console.log(`\n✔ Playlist sync completed! Added ${addedCount} new videos, skipped ${skippedCount} invalid videos.`);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
})();