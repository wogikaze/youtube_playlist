import fs from "fs";

const WATCH_URL_RE = /https:\/\/www\.youtube\.com\/watch\?v=([\w-]{11})/;
const VIDEO_ID_RE = /(?:v=|youtu\.be\/)([\w-]{11})/;

/**
 * @param {string} line
 * @returns {string}
 */
export function normalizeLine(line) {
  if (line.includes("youtube.com")) {
    return line.replace(
      /https:\/\/www\.youtube\.com\/watch\?v=(.*?)(&.*|$)/,
      "0\t0\t$1"
    );
  }
  return line;
}

/**
 * @param {string} file
 * @returns {string[]}
 */
export function readVideoIds(file) {
  const data = fs.readFileSync(file, "utf8");
  return data
    .split(/\r?\n/)
    .map(normalizeLine)
    .map((line) => line.split("\t")[2]?.trim())
    .filter(Boolean);
}

/**
 * @param {string} file
 * @returns {{ title: string, id: string }[]}
 */
export function readRows(file) {
  const lines = fs
    .readFileSync(file, "utf8")
    .split(/\r?\n/)
    .filter((l) => l.trim() !== "");

  return lines.map((line) => {
    const cols = line.split("\t");
    if (cols.length >= 3) {
      return { title: cols[1] ?? "", id: (cols[2] ?? "").trim() };
    }
    if (cols.length === 1) {
      const m = cols[0].match(VIDEO_ID_RE) || cols[0].match(WATCH_URL_RE);
      return { title: "", id: m ? m[1] : "" };
    }
    return { title: cols[1] ?? "", id: "" };
  });
}

/**
 * @param {string} file
 * @param {{ title: string, id: string }[]} rows
 */
export function writeRows(file, rows) {
  const output = rows
    .map((r, idx) => `${idx + 1}\t${r.title}\t${r.id}`)
    .join("\n");
  fs.writeFileSync(file, output + (rows.length ? "\n" : ""), "utf8");
}
