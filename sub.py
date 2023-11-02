import requests

api_key = 'AIzaSyBrp19RfsUXdTC0ADCE8gt7SO2y5FlCHV0'
playlist_id = 'PLXQE_C7He7f9MKGP11OpI8jw187fOgg_3'  # 対象の再生リストのID
video_ids = ['BzRmdQioIQU']  # 追加したい動画のIDリスト

url = 'https://www.googleapis.com/youtube/v3/playlistItems'

for video_id in video_ids:
    params = {
        'key': api_key,
        'part': 'snippet',
    }

    payload = {
        'snippet': {
            'playlistId': playlist_id,
            'position': 0,
            'resourceId': {
                'kind': 'youtube#video',
                'videoId': video_id
            }
        }
    }

    response = requests.post(url, params=params, json=payload)
    if response.status_code == 200:
        print(f'Video {video_id} was added to the playlist successfully.')
    else:
        print(f'Failed to add video {video_id} to the playlist. Error code: {response.status_code}')