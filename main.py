import requests

api_key = "AIzaSyCREZ6Z4qtZSncSwSKiH9xskhzIErG2Xag"
playlist_id = "PLXQE_C7He7f9MKGP11OpI8jw187fOgg_3"  # 取得したい再生リストのID

url = "https://www.googleapis.com/youtube/v3/playlistItems"

params = {
    "key": api_key,
    "part": "snippet",
    "playlistId": playlist_id,
    "maxResults": 50,  # 一度に取得する動画の最大数（最大50）
}

all_videos = []  # 全ての動画を格納するリスト
next_page_token = None

while True:
    if next_page_token:
        params["pageToken"] = next_page_token

    response = requests.get(url, params=params)
    data = response.json()

    # 取得した動画をリストに追加
    all_videos.extend(data["items"])

    # 次のページがある場合は次のページトークンを設定
    next_page_token = data.get("nextPageToken")

    if not next_page_token:
        break  # 次のページがない場合はループを終了

# 全ての動画の情報を表示する例
for video in all_videos:
    video_id = video["snippet"]["resourceId"]["videoId"]
    video_title = video["snippet"]["title"]
    print("Video ID:", video_id)
    print("Title:", video_title)
    print("-----")
