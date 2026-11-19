# youtube_playlist

ローカル TSV と YouTube プレイリストを同期する小さな CLI。

## 構成

```
lib/           # playlists / tsv / youtube（共有ロジック）
push.js        # TSV → プレイリスト反映
pull.js        # プレイリスト → TSV 取得
clean.js       # TSV 正規化（行番号振り直し・URLからタイトル取得）
data/          # *.tsv
scripts/       # 検索など単発ツール
```

## CTF学習用リスト

`data/data_ctf_jp.tsv` に、CTF学習動画を105本、入門から分野別演習・大会Writeupの順でまとめています。日本語を中心に、上級演習には英語のWalkthroughも含めています。Linux・ネットワーク・Pythonの基礎から始まり、Forensics、Web、Crypto、Reverse、Pwn、Misc、OSINT、練習環境、複数年のCTF大会解説へ進む構成です。

このTSVはローカル用で、YouTube上の再生リストは作成していません。2列目は難易度・分野の目印で、同期処理が使う動画IDは3列目です。既存の再生リストへ反映する場合は、先に `lib/playlists.js` に対象の再生リストを登録してください。動画の視聴だけでプロになれるわけではありません。CTFの問題を自分で解く、解けなかった問題をWriteupで復習する、許可された練習環境で繰り返し実践するための教材リストです。動画の公開状態や内容は変更されることがあります。

## 使い方

```bash
# 反映（既存を消して TSV の ID を追加）
npm run push -- yume
# または
node push.js yume
node edit_list.js yume   # 互換ラッパー

# 取得
npm run pull -- yume
node pull.js yume

# TSV 整形
npm run clean -- yume
```

対象名: `uma` | `yume` | `umaost` | プレイリスト URL

## 環境変数

```env
COOKIE="..."
ACCOUNT_INDEX=2
```

`ACCOUNT_INDEX` 未指定時は `2`（`x-goog-authuser: 2` 相当）。

## 注意: node_modules を手修正しています

このリポジトリは `node_modules` 内の `youtubei.js` を直接修正しています。
そのため、別デバイスで作業する場合や `npm install` 後は、同じ修正を再適用しないと挙動が変わる可能性があります。

### 現在入っている手修正

#### 1) PlaylistManager の修正
対象: `node_modules/youtubei.js/dist/src/core/managers/PlaylistManager.js`

- `addVideos`: 失敗時にデバッグ出力して再 throw
- `removeVideos`: `is_editable` が false でも継続、id 取得の頑健化、マッチ 0 件フォールバック

#### 2) ToggleFormField の修正
対象: `node_modules/youtubei.js/dist/src/parser/classes/ToggleFormField.js`

- `import Text from './misc/Text.js';` を追加

#### 3) PlaylistManager.removeVideos の LockupView 対応
対象: 同上 PlaylistManager.js

- raw レスポンスから Playlist 生成（continuation 取得用）
- `LockupView` 等の id 取得対応
- 削除アクションに `removedVideoId` 追加

## 別デバイスでの手順

1. clone
2. `npm install`
3. 上記手修正を `node_modules` に再適用
4. `.env` に `COOKIE`（と必要なら `ACCOUNT_INDEX`）を設定

## 将来案

- `patch-package` で youtubei.js 手修正を自動適用
