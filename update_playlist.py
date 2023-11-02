# update youtube playlist with using api
# use post request to update playlist

import requests

# リクエストを送信する
response = requests.post(
    "https://www.youtube.com/youtubei/v1/browse/edit_playlist?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8&prettyPrint=false",
    data={
        "playlistId": "PLXQE_C7He7f9MKGP11OpI8jw187fOgg_3",
        "key": "AIzaSyB7442K65l38X02_13w92184m_kU7o3w8s",
    },
)

# リクエストの結果を表示
print(response.json())
