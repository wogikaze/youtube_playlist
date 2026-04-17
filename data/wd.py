import time
from selenium import webdriver

JS = r"""
const callback = arguments[arguments.length - 1];

(async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  try {
    const playlistName = "ウマ娘 キャラソン 全曲 | Uma Musume Pretty Derby ALL SONGS";

    const directBtn = document.querySelector('[aria-label="再生リストに保存"]');
    if (directBtn) {
      directBtn.click();
      await sleep(1000);
    } else {
      const menuBtn = document.querySelector('[aria-label="その他の操作"]');
      if (!menuBtn) {
        callback({ ok: false, step: "menu button not found" });
        return;
      }
      menuBtn.click();
      await sleep(1000);

      const items = [...document.querySelectorAll('ytd-menu-service-item-renderer, tp-yt-paper-item')];
      const saveItem = items.find(el => (el.innerText || "").includes("再生リストに保存"));
      if (!saveItem) {
        callback({ ok: false, step: "save menu item not found" });
        return;
      }
      saveItem.click();
      await sleep(1000);
    }

    const listCandidates = [...document.querySelectorAll('[aria-label], yt-formatted-string, span')];
    const target = listCandidates.find(el => {
      const s = (el.getAttribute?.("aria-label") || el.innerText || "").trim();
      return s.includes(playlistName);
    });

    if (!target) {
      callback({ ok: false, step: "playlist entry not found" });
      return;
    }

    target.click();
    await sleep(1000);

    callback({ ok: true, step: "clicked playlist entry" });
  } catch (e) {
    callback({ ok: false, step: "exception", error: String(e) });
  }
})();
"""

options = webdriver.ChromeOptions()
options.add_argument(
    r"--user-data-dir=C:\Users\Wogikaze\AppData\Local\Google\Chrome\SeleniumProfile"
)
options.add_argument("--profile-directory=Default")

driver = webdriver.Chrome(options=options)
driver.set_script_timeout(20)


def process_video(video_id):
    driver.get(f"https://www.youtube.com/watch?v={video_id}")
    time.sleep(3)

    result = driver.execute_async_script(JS)
    print(video_id, result)


with open("data_uma.tsv", encoding="utf-8") as f:
    for lineno, raw_line in enumerate(f, 1):
        line = raw_line.rstrip("\n")
        if not line.strip():
            continue

        cols = line.split("\t")
        if len(cols) < 3:
            print(f"skip line {lineno}: {line!r}")
            continue

        vid = cols[2].strip()
        if not vid:
            continue

        process_video(vid)

driver.quit()
