export const WORK_KEYWORDS = ["工作", "上班", "下班", "加班", "职场", "老板", "同事", "工资", "绩效", "会议", "需求", "工位", "摸鱼", "假期", "周末", "通勤", "面试", "招聘"];
export const BLOCKED_KEYWORDS = ["死亡", "去世", "暴力", "灾害", "洪灾", "地震", "被查", "调查", "出轨", "离世", "疾病", "伤病", "枪", "杀", "自杀", "政治", "选举", "总统", "政府", "外交", "议会", "政党"];

export function shanghaiParts(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
  }).formatToParts(date).reduce((result, part) => {
    if (part.type !== "literal") result[part.type] = Number(part.value);
    return result;
  }, {});
}

export function dayNumber(parts) {
  return Math.floor(Date.UTC(parts.year, parts.month - 1, parts.day) / 86400000);
}

export function parseBoardDate(markdown) {
  const match = markdown.match(/^#.*?(\d{4})[.\-/](\d{2})[.\-/](\d{2})/m);
  if (!match) return null;
  const date = { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
  const probe = new Date(Date.UTC(date.year, date.month - 1, date.day));
  if (probe.getUTCFullYear() !== date.year || probe.getUTCMonth() + 1 !== date.month || probe.getUTCDate() !== date.day) return null;
  date.key = `${match[1]}-${match[2]}-${match[3]}`;
  return date;
}

export function secondsUntilNine(now) {
  if (now.hour >= 9) return 0;
  return Math.max(0, (8 - now.hour) * 3600 + (59 - now.minute) * 60 + (60 - now.second));
}

export function isNightHour(hour) {
  return hour >= 18 || hour < 6;
}

export function isWorkSafeHotTitle(title) {
  const value = typeof title === "string" ? title.replace(/\s+/g, " ").trim().slice(0, 42) : "";
  if (!value || value.length < 3) return false;
  return WORK_KEYWORDS.some((word) => value.includes(word)) && !BLOCKED_KEYWORDS.some((word) => value.includes(word));
}
