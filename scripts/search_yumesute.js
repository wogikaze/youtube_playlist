import { Innertube } from "youtubei.js";
import fs from "fs";

const OUT = "./data/data_yumesute.tsv";
const CACHE = "./data/.yumesute_search_cache.json";
const DELAY_MS = 800;

/** @type {{ title: string, query?: string, skipSearch?: boolean }[]} */
const TRACKS = [
  // 1. OP/ED
  { title: "ワナビスタ！" },
  { title: "トゥ・オブ・アス" },
  { title: "ワナビスタ！（Instrumental）", query: "ワナビスタ！ Instrumental ワールドダイスター" },
  { title: "トゥ・オブ・アス（Instrumental）", query: "トゥ・オブ・アス Instrumental ワールドダイスター" },

  // 2. 劇中歌アルバム
  { title: "勿忘唄" },
  { title: "夢見月夜" },
  { title: "New Nostalgic Friend" },
  { title: "ダイヤモンドの誓い" },
  { title: "魔法のラストノート" },
  { title: "名もなき恋人よ" },
  { title: "Etoile" },
  { title: "Masquerade" },
  { title: "Farewell song" },

  // 3. OST Disc 1
  { title: "信じてる", query: "信じてる 高橋諒 ワールドダイスター" },
  { title: "世界は演劇時代", query: "世界は演劇時代 ワールドダイスター OST" },
  { title: "稽古中", query: "稽古中 ワールドダイスター OST" },
  { title: "ちょっと一息しませんか", query: "ちょっと一息しませんか ワールドダイスター" },
  { title: "みんなのぬくもり", query: "みんなのぬくもり ワールドダイスター OST" },
  { title: "シリウスの日常", query: "シリウスの日常 ワールドダイスター OST" },
  { title: "抜き足差し足忍び足", query: "抜き足差し足忍び足 ワールドダイスター" },
  { title: "流石です流石さん", query: "流石です流石さん ワールドダイスター" },
  { title: "謎解きタイム", query: "謎解きタイム ワールドダイスター OST" },
  { title: "説明しよう！", query: "説明しよう！ ワールドダイスター OST" },
  { title: "意見の衝突", query: "意見の衝突 ワールドダイスター OST" },
  { title: "しりうす湯", query: "しりうす湯 ワールドダイスター OST" },
  { title: "事件の予感", query: "事件の予感 ワールドダイスター OST" },
  { title: "コメディアン？", query: "コメディアン？ ワールドダイスター OST" },
  { title: "偉大なるドイツ", query: "偉大なるドイツ ワールドダイスター" },
  { title: "新妻の十八番", query: "新妻の十八番 ワールドダイスター" },
  { title: "思い出のオルゴール", query: "思い出のオルゴール ワールドダイスター" },
  { title: "私の想い", query: "私の想い ワールドダイスター OST" },
  { title: "ミーティング", query: "ミーティング ワールドダイスター OST" },
  { title: "暮夜はひそかに", query: "暮夜はひそかに ワールドダイスター" },
  { title: "今日はオフ日", query: "今日はオフ日 ワールドダイスター OST" },
  { title: "夢に向かって", query: "夢に向かって ワールドダイスター OST" },
  { title: "流しそうめん一緒にいかが？", query: "流しそうめん一緒にいかが？ ワールドダイスター" },
  { title: "幕間", query: "幕間 ワールドダイスター OST" },
  { title: "一体何が起こっているの？", query: "一体何が起こっているの？ ワールドダイスター" },
  { title: "キラキラガールズトーク", query: "キラキラガールズトーク ワールドダイスター" },
  { title: "次回のワールドダイスター", query: "次回のワールドダイスター OST" },
  { title: "仲良しライバル", query: "仲良しライバル ワールドダイスター OST" },
  { title: "一件落着", query: "一件落着 ワールドダイスター OST" },
  { title: "黄昏時", query: "黄昏時 ワールドダイスター OST" },
  { title: "届かない思い", query: "届かない思い ワールドダイスター OST" },
  { title: "大人達の思惑", query: "大人達の思惑 ワールドダイスター" },
  { title: "神様は気まぐれ", query: "神様は気まぐれ ワールドダイスター OST" },
  { title: "浅草散策", query: "浅草散策 ワールドダイスター OST" },
  { title: "いっちょやりますか", query: "いっちょやりますか ワールドダイスター" },
  { title: "カーテンコール／ワールドワイドダイスター", query: "カーテンコール ワールドワイドダイスター" },

  // 3. OST Disc 2
  { title: "ワナビスタ！（TV size）", query: "ワナビスタ！ TV size" },
  { title: "人魚姫 scene1", query: "人魚姫 scene1 ワールドダイスター" },
  { title: "人魚姫 scene2", query: "人魚姫 scene2 ワールドダイスター" },
  { title: "竹取物語 scene1", query: "竹取物語 scene1 ワールドダイスター" },
  { title: "竹取物語 scene2", query: "竹取物語 scene2 ワールドダイスター" },
  { title: "勿忘唄（TV size）", query: "勿忘唄 TV size" },
  { title: "夢見月夜（TV size）", query: "夢見月夜 TV size" },
  { title: "悠久月華（TV size）", query: "悠久月華 TV size" },
  { title: "ハムレット scene1", query: "ハムレット scene1 ワールドダイスター" },
  { title: "アラビアンナイト scene1", query: "アラビアンナイト scene1 ワールドダイスター" },
  { title: "アラビアンナイト scene2", query: "アラビアンナイト scene2 ワールドダイスター" },
  { title: "星の王子様 scene1", query: "星の王子様 scene1 ワールドダイスター" },
  { title: "アラビアンナイト scene3-A", query: "アラビアンナイト scene3-A ワールドダイスター" },
  { title: "アラビアンナイト scene3-B", query: "アラビアンナイト scene3-B ワールドダイスター" },
  { title: "アラビアンナイト scene4", query: "アラビアンナイト scene4 ワールドダイスター" },
  { title: "ダイヤモンドの誓い（TV size）", query: "ダイヤモンドの誓い TV size" },
  { title: "魔法のラストノート（TV size）", query: "魔法のラストノート TV size" },
  { title: "New Nostalgic Friend（TV size）", query: "New Nostalgic Friend TV size" },
  { title: "ロミオとジュリエット scene1", query: "ロミオとジュリエット scene1 ワールドダイスター" },
  { title: "ロミオとジュリエット scene2", query: "ロミオとジュリエット scene2 ワールドダイスター" },
  { title: "ロミオとジュリエット scene3", query: "ロミオとジュリエット scene3 ワールドダイスター" },
  { title: "ロミオとジュリエット scene4", query: "ロミオとジュリエット scene4 ワールドダイスター" },
  { title: "名もなき恋人よ（TV size）", query: "名もなき恋人よ TV size" },
  { title: "オペラ座の怪人 scene1", query: "オペラ座の怪人 scene1 ワールドダイスター" },
  { title: "オペラ座の怪人 scene2", query: "オペラ座の怪人 scene2 ワールドダイスター" },
  { title: "オペラ座の怪人 scene3", query: "オペラ座の怪人 scene3 ワールドダイスター" },
  { title: "オペラ座の怪人 scene4", query: "オペラ座の怪人 scene4 ワールドダイスター" },
  { title: "オペラ座の怪人 scene5", query: "オペラ座の怪人 scene5 ワールドダイスター" },
  { title: "オペラ座の怪人 scene6", query: "オペラ座の怪人 scene6 ワールドダイスター" },
  { title: "オペラ座の怪人 scene7", query: "オペラ座の怪人 scene7 ワールドダイスター" },
  { title: "オペラ座の怪人 scene8", query: "オペラ座の怪人 scene8 ワールドダイスター" },
  { title: "Etoile（TV size）", query: "Etoile TV size ワールドダイスター" },
  { title: "Masquerade（TV size）", query: "Masquerade TV size ワールドダイスター" },
  { title: "Farewell song（TV size）", query: "Farewell song TV size ワールドダイスター" },
  { title: "トゥ・オブアス（アレンジver）", query: "トゥ・オブ・アス アレンジ ワールドダイスター" },
  { title: "トゥ・オブアス（TV size）", query: "トゥ・オブ・アス TV size" },
  { title: "夢見月夜（TV size）", query: "夢見月夜 TV size" }, // Disc2 #37 duplicate listing

  // Vol.1
  { title: "プラネタリウム・レヴュー" },
  { title: "勿忘唄（銀河座 Version）", query: "勿忘唄 銀河座" },
  { title: "悠久月華" },
  { title: "ウタカタメロディ" },
  { title: "巡る暦の花のように" },
  { title: "てぃだんちゅ MEETS てぃんがーら！" },
  { title: "情熱リベレイション" },
  { title: "暁星アストレーション" },
  { title: "夏の夜空に光る雪" },
  { title: "革命ダンス" },
  { title: "So long, Say Goodbye" },
  { title: "小さな奇跡の降る夜に" },
  { title: "夢のステラリウム（銀河座 Version）", query: "夢のステラリウム 銀河座" },

  // Vol.2
  { title: "Faith in Expression" },
  { title: "Black Diary" },
  { title: "Forbidden Fruit Addiction" },
  { title: "Masquerade（Eden Version）", query: "Masquerade Eden" },
  { title: "Eternity" },
  { title: "純粋と奔放" },
  { title: "Blondie Revenge Tragedy" },
  { title: "フレーフレー・ファンファーレ！" },
  { title: "血を着飾る栄華のために" },
  { title: "ちいさないのちのさけるばしょ" },
  { title: "アンプレザント・ライン" },
  { title: "St. Bitter Sweet" },
  { title: "夢のステラリウム（Eden Version）", query: "夢のステラリウム Eden" },

  // Vol.3
  { title: "デアエ・エクス・マキナ！" },
  { title: "Drawing World" },
  { title: "いろはうたBLOOMING" },
  { title: "Get to Act Life♡" },
  { title: "不可逆的運命ディストピア" },
  { title: "プレイ・マイ・フェイバリット!!" },
  { title: "サマーバカンス☆アクトレス！" },
  { title: "ひとりの夜のフィルモグラフィー" },
  { title: "きらり！マジカリュー・スマイル！" },
  { title: "こんなに素晴らしい世界で" },
  { title: "トゥインクル・トゥインクル・スクールデイズ！" },
  { title: "電脳スペクタクル" },
  { title: "夢のステラリウム（劇団電姫 Version）", query: "夢のステラリウム 劇団電姫" },

  // Vol.4
  { title: "シリウスの輝きのように" },
  { title: "幾億の星の空で" },
  { title: "Binary Star" },
  { title: "Decide" },
  { title: "Fernweh" },
  { title: "パーティー・ジョーク・シンデレラ" },
  { title: "Pandastic Stage!" },
  { title: "マイ・ピクチャー・ストーリー" },
  { title: "HAPPY NEW SHOW TIME!" },
  { title: "アイ・ウィル！" },
  { title: "フタリノスタルジア" },
  { title: "Rolling Stone" },
  { title: "夢のステラリウム（シリウス Version）", query: "夢のステラリウム シリウス" },

  // Vol.5
  { title: "I Wanna" },
  { title: "Singin' little blue bird" },
  { title: "To B-eat, or not to B-eat!" },
  { title: "MY FIRST ACT!" },
  { title: "Friends Per Second" },
  { title: "Wish upon a star" },
  { title: "リアルタイム・リプライ！" },
  { title: "踊る魔法に観る魔法" },
  { title: "Neustart" },
  { title: "Sweet Memories" },
  { title: "絶対！ニーデリッヒ宣言♡" },
  { title: "いこうよ！ネバーランドへ" },
  { title: "Worlds Dye Star（シリウス Version）", query: "Worlds Dye Star シリウス" },

  // Vol.6
  { title: "ヱテルナ・ガラクシア" },
  { title: "アクト・レゾナンス" },
  { title: "マン・ハン・チュエンシー!!" },
  { title: "Crystal Bell" },
  { title: "眩しい朝日に照らされて" },
  { title: "雪は春に、そして花束を" },
  { title: "硝子色の欠片" },
  { title: "ハチメンロッピング！" },
  { title: "黎明の残照の果て、新しき光の空へ" },
  { title: "君というメソッドへ" },
  { title: "Act on my feelings." },
  { title: "いつか、薄紅の空の下で" },
  { title: "Worlds Dye Star（銀河座 Version）", query: "Worlds Dye Star 銀河座" },

  // Vol.7
  { title: "グローリー・ワンダーランド" },
  { title: "夕焼け色は始まりの色" },
  { title: "アタシのアシタはアタシがキメル" },
  { title: "ハートフル・レシピ" },
  { title: "ふぁうすと・いんぷれっしょん！！" },
  { title: "ミックス・アップ・インタレスト！" },
  { title: "Like Blooming Flowers" },
  { title: "色即是空卍Trick is Treat！" },
  { title: "史上最幸NEW YEAR!" },
  { title: "想い出はリタルダンド" },
  { title: "マッピング・マイ・ワールド" },
  { title: "Sunny day in June." },
  { title: "Worlds Dye Star（劇団電姫 Version）", query: "Worlds Dye Star 劇団電姫" },

  // Vol.8
  { title: "RAREFIED HEIGHTS" },
  { title: "Thirsty Soul" },
  { title: "ワンダフル・フラワー・ガーデン！" },
  { title: "賭世遊戯" },
  { title: "深度異症候群-Shindoi Syndrome-" },
  { title: "銀月照らす美しき罪" },
  { title: "惑う星達のダンスホール" },
  { title: "水際PARTY、水着でFUNNY" },
  { title: "Original Scene" },
  { title: "トーキョー・ウィンター・ミュージック" },
  { title: "Dear My Eden" },
  { title: "SECRET TRAINING!!!!" },
  { title: "Worlds Dye Star（Eden Version）", query: "Worlds Dye Star Eden" },

  // Vol.9
  { title: "STARRY STORY！" },
  { title: "愛に生きる喜びを" },
  { title: "ティンクル・ティンクル・ティンク！" },
  { title: "Aschenputtel" },
  { title: "蜃気楼の向こう側、君は笑ってくれるかな" },
  { title: "シャボンに浮かぶセカイであおう" },
  { title: "VIVID BIT AT HOME！" },
  { title: "星に出逢えた夜に歌って" },
  { title: "ハロー・マイ・ロケット" },
  { title: "開運御礼初詣！" },
  { title: "バブリック・ビューイング！" },
  { title: "ヴィヴァラヰタ" },
  { title: "Worlds Dye Star（ここな＆静香 Version）", query: "Worlds Dye Star ここな 静香" },

  // Vol.10
  { title: "テアトルム・アストラーレ" },
  { title: "五条大橋の妖しき化生" },
  { title: "誰ガ為ノサダメ" },
  { title: "ハオダー？ハオアー！-好的？好啊！-" },
  { title: "黄昏時、夏の余韻" },
  { title: "陰陽幻燈譚" },
  { title: "Gazing Dialogue Play" },
  { title: "未来への前奏曲-Prelude-" },
  { title: "Astral×Relation" },
  { title: "情熱と歓喜のCarnaval！" },
  { title: "氷雨に舞う火の鳥" },
  { title: "エクストラ・エキストラ！ -Extra Extra-" },
  { title: "Worlds Dye Star（千寿 暦 Version）", query: "Worlds Dye Star 千寿 暦" },

  // Vol.11（発表済み7 + 未発表5）
  { title: "劇団電姫すいっちおん！" },
  { title: "ナツのキオクのナイショのホンネ！" },
  { title: "錆びついた胸に一雫の心を" },
  { title: "空っぽのギフトボックス" },
  { title: "Worlds Dye Star", query: "Worlds Dye Star 劇団電姫 ワールドダイスター" },
  { title: "ELECTRIC PRINCESS!" },
  { title: "ニア・ディア・ユア・ドリーム" },
  { title: "（Vol.11 未発表 1）", skipSearch: true },
  { title: "（Vol.11 未発表 2）", skipSearch: true },
  { title: "（Vol.11 未発表 3）", skipSearch: true },
  { title: "（Vol.11 未発表 4）", skipSearch: true },
  { title: "（Vol.11 未発表 5）", skipSearch: true },
];

function loadExistingIds() {
  const map = new Map();
  if (!fs.existsSync(OUT)) return map;
  for (const line of fs.readFileSync(OUT, "utf8").split(/\r?\n/)) {
    const cols = line.split("\t");
    if (cols.length >= 3 && cols[1] && cols[2]) map.set(cols[1].trim(), cols[2].trim());
  }
  return map;
}

function loadCache() {
  if (!fs.existsSync(CACHE)) return {};
  try {
    return JSON.parse(fs.readFileSync(CACHE, "utf8"));
  } catch {
    return {};
  }
}

function saveCache(cache) {
  fs.writeFileSync(CACHE, JSON.stringify(cache, null, 2), "utf8");
}

function textOf(v) {
  if (!v) return "";
  if (typeof v === "string") return v;
  return v.text || v.toString?.() || "";
}

function durationSeconds(v) {
  const t = textOf(v?.duration);
  if (!t) return null;
  const parts = t.split(":").map(Number);
  if (parts.some(Number.isNaN)) return null;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0];
}

function normalize(s) {
  return (s || "")
    .toLowerCase()
    .replace(/[！!？?♡☆×・／\/\-\s　]/g, "")
    .replace(/[（）()]/g, "")
    .replace(/version/g, "")
    .replace(/ver\.?/g, "");
}

function coreTitle(trackTitle) {
  return trackTitle
    .replace(/（.*?）/g, "")
    .replace(/\(.*?\)/g, "")
    .replace(/-Shindoi Syndrome-/g, "")
    .replace(/-Prelude-/g, "")
    .replace(/-Extra Extra-/g, "")
    .replace(/-好的？好啊！-/g, "")
    .trim();
}

function scoreCandidate(trackTitle, video) {
  const title = textOf(video.title);
  const author = textOf(video.author?.name || video.author);
  const dur = durationSeconds(video);
  let score = 0;

  if (!title) return -Infinity;

  // reject loops / mashups / chart videos / student shorts
  if (/1時間|１時間|耐久|メドレー|歌ってみた|cover|カバー|耳コピ|譜面|STELLA\s*\d+|HAL名古屋|チーム/i.test(title)) return -Infinity;
  if (dur != null && dur >= 20 * 60) return -Infinity;
  // vocal full-length preference: reject short non-Topic clips (<2:30) unless TV size / scene / OST-ish
  const allowShort =
    /TV size|TVサイズ|scene|Instrumental|インスト/i.test(trackTitle) ||
    /Ryo Takahashi|Kenichi Kuroda|Tatsuya Yano|高橋諒|黒田賢一|矢野達也/i.test(author);
  if (!allowShort && dur != null && dur > 0 && dur < 150 && !/topic/i.test(author)) return -Infinity;

  const nTitle = normalize(title);
  const nTrack = normalize(coreTitle(trackTitle));
  const wantInst = /instrumental/i.test(trackTitle) || /インスト/i.test(trackTitle);
  const hasInst = /instrumental|オフボーカル|off\s*vocal|karaoke|カラオケ/i.test(title);

  if (wantInst && !hasInst) return -Infinity;
  if (!wantInst && hasInst) score -= 40;

  // hard require: normalized core title must appear in video title
  // (allow short OST titles only with Topic/composer channels)
  const isTopicOrOfficial =
    /topic/i.test(author) ||
    /ワールドダイスター|ユメステ|lantis|バンダイナムコ|Ryo Takahashi|Kenichi Kuroda|Tatsuya Yano|高橋諒|黒田賢一|矢野達也/i.test(
      author
    );

  if (nTrack.length >= 2) {
    if (nTitle.includes(nTrack)) score += 60;
    else if (nTrack.length >= 6 && nTitle.includes(nTrack.slice(0, Math.ceil(nTrack.length * 0.7)))) score += 25;
    else if (isTopicOrOfficial && nTrack.length <= 6 && nTitle.startsWith(nTrack.slice(0, 2))) score += 10;
    else return -Infinity; // wrong song
  }

  // version tags
  if (/銀河座/.test(trackTitle) && !/銀河座/.test(title)) score -= 25;
  if (/Eden/.test(trackTitle) && !/Eden|エデン/i.test(title)) score -= 25;
  if (/劇団電姫/.test(trackTitle) && !/劇団電姫|電姫/.test(title)) score -= 25;
  if (/シリウス/.test(trackTitle) && !/シリウス/.test(title)) score -= 25;
  if (/TV size|TVサイズ/i.test(trackTitle) && !/tv\s*size|テレビサイズ|tvサイズ/i.test(title)) score -= 20;

  if (/topic/i.test(author)) score += 50;
  if (/ワールドダイスター|ユメステ|lantis|バンダイナムコ/i.test(author)) score += 35;
  if (/Ryo Takahashi|Kenichi Kuroda|Tatsuya Yano|高橋諒|黒田賢一|矢野達也/i.test(author)) score += 40;
  if (/official|公式|music video|\bMV\b/i.test(title)) score += 15;
  if (/3dmv|live|ライブ/i.test(title)) score -= 10;

  if (dur != null && dur > 0 && dur < 40) score -= 15;
  if (dur != null && dur >= 90 && dur <= 360) score += 10;

  return score;
}

function pickBest(trackTitle, results) {
  const videos = (results || []).filter((v) => v?.id && (v.type === "Video" || v.id));
  if (!videos.length) return null;
  let best = null;
  let bestScore = -Infinity;
  for (const v of videos.slice(0, 15)) {
    const s = scoreCandidate(trackTitle, v);
    if (s > bestScore) {
      bestScore = s;
      best = v;
    }
  }
  if (bestScore < 40) return null;
  return { id: best.id, title: textOf(best.title), author: textOf(best.author?.name || best.author), score: bestScore };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  if (TRACKS.length !== 228) {
    console.warn(`[warn] track count is ${TRACKS.length}, expected 228`);
  }

  const existing = loadExistingIds();
  const cache = loadCache();
  const yt = await Innertube.create({});

  const rows = [];
  let found = 0;
  let reused = 0;
  let missing = 0;

  for (let i = 0; i < TRACKS.length; i++) {
    const track = TRACKS[i];
    const n = i + 1;
    const cached = cache[track.title];
    let id = "";
    if (existing.get(track.title)) id = existing.get(track.title);
    else if (cached?.id && cached.score >= 40 && !cached.note) id = cached.id;

    if (!id && !track.skipSearch) {
      const query = track.query || `${track.title} ワールドダイスター`;
      process.stdout.write(`[${n}/${TRACKS.length}] search: ${query}\n`);
      try {
        const r = await yt.search(query, { type: "video" });
        const best = pickBest(track.title, r.results);
        if (best) {
          id = best.id;
          cache[track.title] = { ...best, query, at: new Date().toISOString() };
          console.log(`  -> ${best.id}  score=${best.score}  ${best.author} | ${best.title}`);
        } else {
          cache[track.title] = { id: "", query, at: new Date().toISOString(), note: "no good match" };
          console.log("  -> (no match)");
        }
      } catch (e) {
        console.log(`  -> error: ${e.message || e}`);
        cache[track.title] = { id: "", query, error: String(e), at: new Date().toISOString() };
      }
      if (n % 10 === 0) saveCache(cache);
      await sleep(DELAY_MS);
    } else if (id) {
      reused++;
      console.log(`[${n}/${TRACKS.length}] reuse: ${track.title} -> ${id}`);
    } else {
      console.log(`[${n}/${TRACKS.length}] skip: ${track.title}`);
    }

    if (id) found++;
    else missing++;
    rows.push(`${n}\t${track.title}\t${id}`);
  }

  saveCache(cache);
  fs.writeFileSync(OUT, rows.join("\n") + "\n", "utf8");
  console.log(`\nWrote ${OUT}`);
  console.log(`tracks=${TRACKS.length} with_id=${found} missing=${missing} reused_existing=${reused}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
