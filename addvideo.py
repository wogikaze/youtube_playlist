import time
import csv
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

# ログイン状態を引っ張ってくる
options = Options()
options.add_argument("--no-sandbox")
options.add_argument(
    "--user-data-dir=C:\\Users\\Wogikaze\\AppData\\Local\\Google\\Chrome\\User Data"
)
options.add_argument("--profile-directory=Default")
# ChromeDriver のパスを指定する場合は以下のように設定してください
# driver = webdriver.Chrome(executable_path='/path/to/chromedriver')
driver = webdriver.Chrome(options=options)  # ChromeDriver がパス通りにある前提
wait = WebDriverWait(driver, 20)  # 最大20秒待機

# TSV ファイルから動画データを読み込み（ヘッダなし）
with open("data_uma.tsv", newline="", encoding="utf-8") as file:
    reader = csv.reader(file, delimiter="\t")
    for row in reader:
        no, title, video_id = row
        url = f"https://www.youtube.com/watch?v={video_id}"
        print(f"【{no}】 {title} を処理中: {url}")
        driver.get(url)

        # ページが読み込まれるまで待機
        wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))

        # 4. 3秒待機
        time.sleep(7)

driver.quit()
