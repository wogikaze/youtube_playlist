# youtube_playlist

## 注意: node_modules を手修正しています

このリポジトリは `node_modules` 内の `youtubei.js` を直接修正しています。
そのため、別デバイスで作業する場合や `npm install` 後は、同じ修正を再適用しないと挙動が変わる可能性があります。

## 現在入っている手修正

### 1) PlaylistManager の修正
対象ファイル:
- `node_modules/youtubei.js/dist/src/core/managers/PlaylistManager.js`

変更点:
- `addVideos`:
  - 例外を握りつぶさず、失敗時にデバッグ情報を `console.error` 出力して再 throw。
- `removeVideos`:
  - `is_editable` が false でも処理継続（YouTube 側のメタが不正確なケース対策）。
  - `id` / `video_id` / `set_video_id` の取り方を頑健化。
  - マッチ 0 件時のフォールバック処理を追加。

### 2) ToggleFormField の修正
対象ファイル:
- `node_modules/youtubei.js/dist/src/parser/classes/ToggleFormField.js`

変更点:
- `Text` の import 漏れを修正。
  - `import Text from './misc/Text.js';`

## 実行時のアカウント選択

`edit_list.js` は以下の方針です:
- `ACCOUNT_INDEX` が未指定なら `2` を使う（`x-goog-authuser: 2` 相当）。
- 必要なら `.env` で `ACCOUNT_INDEX` を明示してください。

例:

```env
ACCOUNT_INDEX=2
COOKIE="..."
```

## 別デバイスで作業する場合の手順

1. このリポジトリを clone する
2. `npm install` する
3. この README の「現在入っている手修正」を `node_modules` に再適用する
4. `.env` を用意し、`COOKIE` と必要なら `ACCOUNT_INDEX=2` を設定する

## 将来的な改善案

- `patch-package` を使って、`node_modules` 修正を自動適用化する
  - 手修正の再作業をなくせるため、別デバイスでも再現しやすくなります。
