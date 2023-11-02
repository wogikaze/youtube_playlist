function updateYouTubePlaylist() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(""); // スプレッドシートのシート名を適宜変更する

  // スプレッドシートからYouTube Video IDのリストを取得（2行目から）
  var data = sheet.getDataRange().getValues();
  var videoIds = data.slice(102).map(function (row) {
    return row[0]; // スプレッドシートの1列目にVideo IDが入っていると仮定
  });

  var playlist_id = ""; // 更新したい再生リストのID

  // YouTube再生リストを更新
  for (var i = 0; i < videoIds.length; i++) {
    var videosToAdd = videoIds[i];

    // 更新する動画をJSON形式で作成
    var resource = {
      snippet: {
        playlistId: playlist_id,
        resourceId: {
          kind: "youtube#video",
          videoId: videosToAdd,
        },
      },
    };

    // YouTube再生リストに動画を追加
    YouTube.PlaylistItems.insert(resource, "snippet");
  }

  Logger.log("再生リストが更新されました！");
}

function fetchYouTubePlaylist() {
  var next_page_token = "";

  // スプレッドシートに動画情報を書き込む
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet(); //シートを取得する
  var playlist_id = sheet.getRange("B2").getValue(); // 取得したい再生リストのID
  var playlist_name = sheet.getRange("A2").getValue();

  // ヘッダ行を書き込む
  sheet.getRange(1, 1, 1, 2).setValues([["PlayList Name", playlist_name]]);
  sheet.getRange(2, 1, 2, 2).setValues([["PlayList ID", playlist_id]]);
  sheet.getRange(2, 3, 2, 5).setValues([["index", "Video Name", "Video ID"]]);

  var videoData = [];
  var now_y = 2;

  while (next_page_token !== undefined) {
    var playlistItems = YouTube.PlaylistItems.list("snippet", {
      maxResults: 50,
      pageToken: next_page_token,
      playlistId: playlist_id,
    });

    var items = playlistItems.items;
    if (items) {
      // 動画情報を配列に追加
      for (var i = 0; i < items.length; i++) {
        var video = items[i];
        var video_id = video.snippet.resourceId.videoId;
        var video_title = video.snippet.title;
        videoData.push([video_id, video_title]);
      }
    }

    next_page_token = playlistItems.nextPageToken;

    // データを一括で書き込む
    sheet.getRange("A1").setValue("Hello, world!");
    if (videoData.length > 0) {
      sheet.getRange(now_y + 1, 1, videoData.length, 2).setValues(videoData);
    }
    now_y += videoData.length;
    videoData = [];
  }
}
