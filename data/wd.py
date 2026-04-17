import time
from selenium import webdriver
from selenium.webdriver.common.by import By

JS = r"""
(async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  try {
    const directBtn = document.querySelector('[aria-label="再生リストに保存"]');
    if (directBtn) {
      // ✅ 再生リストに保存ボタンがある場合（新UIやミニプレイヤーなど）
      directBtn.click();
      await sleep(500);
      const listBtn = document.querySelector('[aria-label*="ウマ娘 キャラソン 全曲 | Uma Musume Pretty Derby ALL SONGS"]');
      if (listBtn) listBtn.click();
      await sleep(500);
    } else {
      // ✅ 「その他の操作」メニュー経由
      const menuBtn = document.querySelector('[aria-label="その他の操作"]');
      if (menuBtn) { menuBtn.click(); await sleep(500); }

      const popupItem = document.querySelector('.ytd-menu-service-item-renderer');
      if (popupItem) { popupItem.click(); await sleep(500); }

      const listBtn = document.querySelector('[aria-label*="ウマ娘 キャラソン 全曲 | Uma Musume Pretty Derby ALL SONGS"]');
      if (listBtn) listBtn.click();
      await sleep(500);
    }
  } catch (e) {
    console.error(e);
  }
})();
"""

options = webdriver.ChromeOptions()
options.add_argument(
    r"--user-data-dir=C:\Users\Wogikaze\AppData\Local\Google\Chrome\SeleniumProfile"
)
options.add_argument("--profile-directory=Default")  # 念のため明示
driver = webdriver.Chrome(options=options)


def process_video(video_id, run_seconds=2.5):
    driver.get(f"https://www.youtube.com/watch?v={video_id}")
    time.sleep(3.0)  # ざっくり読み込み待ち
    driver.execute_script(JS)
    time.sleep(3.0)  # ざっくり安定待ち


# TSVループ（必要なら）
with open("data_uma.tsv", encoding="utf-8") as f:
    for line in f:
        _, _, vid = line.strip().split("\t")
        process_video(vid, run_seconds=2.5)

# 終了時
driver.quit()
