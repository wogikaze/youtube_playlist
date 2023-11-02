from google_auth_oauthlib.flow import InstalledAppFlow

# 認証スコープ（アクセス権限）を指定します
SCOPES = ['https://www.googleapis.com/auth/youtube']

# 認証情報を取得する関数
def get_authenticated_service():
    flow = InstalledAppFlow.from_client_secrets_file(
        'client_secrets.json',  # クライアントシークレットのJSONファイル
        SCOPES,
        redirect_uri='http://localhost:8080/'
    )
    credentials = flow.run_local_server()
    return credentials

# 認証を行い、認証情報を取得します


import requests
def add_video_to_playlist(playlist_id, video_id, credentials):
    api_key = 'AIzaSyBrp19RfsUXdTC0ADCE8gt7SO2y5FlCHV0'
    url = 'https://www.googleapis.com/youtube/v3/playlistItems'

    params = {
        'key': api_key,
        'part': 'snippet',
    }

    headers = {
        'Authorization': f'Bearer {credentials.token}'
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

    response = requests.post(url, params=params, headers=headers, json=payload)
    if response.status_code == 200:
        print(f'Video {video_id} was added to the playlist successfully.')
    else:
        print(f'Failed to add video {video_id} to the playlist. Error code: {response.status_code}')


        credentials = get_authenticated_service()

playlist_id = 'PLXQE_C7He7f9MKGP11OpI8jw187fOgg_3'  # 対象の再生リストのID
video_ids = ['BzRmdQioIQU']  # 追加したい動画のIDリスト
credentials = get_authenticated_service()
for video_id in video_ids:
    add_video_to_playlist(playlist_id,video_id, credentials)