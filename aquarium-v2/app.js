import { dayNumber, isNightHour, isWorkSafeHotTitle, parseBoardDate, secondsUntilNine, shanghaiParts } from "./logic.js";

const API_HOSTS = [
  "https://60s.okbaike.com",
  "https://60s.crystelf.top",
  "https://api.elysiayanyu.top",
];
const API_TIMEOUT = 2500;
const LOCAL = {
  jokes: [
    "需求评审像虾走路：看起来在前进，其实一直横着。",
    "螃蟹为什么不写日报？因为它的工作流总是横向扩展。",
    "今天没有 deadline，只有海岸线，游到哪里算哪里。",
    "章鱼有八只手，仍然建议一次只接一个需求。",
    "海星说：别催，我正在努力发光，不是在摸鱼。",
    "项目经理问进度，泥鳅说：已经滑到下一个迭代了。",
    "会议纪要的尽头是什么？是下一场会议的邀请函。",
    "同事说‘很快就好’，这句话在水下会变成一串气泡。",
    "加班像潮汐，退了以后，沙滩上会留下很多待办。",
    "PPT 不是海市蜃楼，但它确实会让需求看起来很近。",
    "老板问谁能扛一下，虾说：我只能扛住自己的虾线。",
    "代码过了测试，心情还没过测试，先让它在缸里游两圈。",
  ],
  loach: [
    "泥鳅签：今天宜顺流而下，忌在无效会议里原地打滑。",
    "小泥鳅提醒：需求再急，也要先把自己从石头缝里捞出来。",
    "泥鳅摸鱼守则：不争第一，只争一个舒服的水层。",
    "今日泥鳅运势：适合把复杂问题泡一泡，答案会自己浮上来。",
  ],
  hitokoto: [
    "把今天过好，剩下的交给明天的水流。",
    "慢一点不是掉队，是给灵感留出转身的空间。",
    "先照顾好自己的氧气，再去拯救项目的进度。",
  ],
  moyu: [
    "老板赚的是我们加班的钱，我摸的是老板的鱼。谁占便宜还不一定呢。",
    "工作做不完还有明天，命没了就真的没了。",
  ],
};

const state = {
  boardDate: null,
  daysLate: 0,
  manualNight: null,
  lastMessage: "",
  bubbleTimer: null,
  pools: { jokes: [], hitokoto: [], moyu: [], hot: [] },
  apiSuccess: 0,
  apiCached: 0,
  apiAttempted: 0,
};

const $ = (selector) => document.querySelector(selector);
const statusText = $("#status-text");
const boardMeta = $("#board-meta");
const apiStatus = $("#api-status");
const bubble = $("#message-bubble");
const messageLabel = $("#message-label");
const messageText = $("#message-text");
const messageLink = $("#message-link");
const themeToggle = $("#theme-toggle");

function formatBoardDate() {
  return state.boardDate ? `${state.boardDate.year}.${String(state.boardDate.month).padStart(2, "0")}.${String(state.boardDate.day).padStart(2, "0")}` : "日期未知";
}

function beforeNine(now = shanghaiParts()) { return now.hour < 9; }
function autoNight() { return isNightHour(shanghaiParts().hour); }

function setText(element, value) { element.textContent = String(value ?? ""); }

function storageGet(key) {
  try { return JSON.parse(sessionStorage.getItem(key) || "null"); } catch { return null; }
}
function storageSet(key, value) {
  try { sessionStorage.setItem(key, JSON.stringify(value)); } catch {}
}

async function loadJson(path) {
  for (const host of API_HOSTS) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), API_TIMEOUT);
    try {
      const response = await fetch(`${host}${path}`, { signal: controller.signal, cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json();
      if (payload?.code !== 200 || payload.data == null) throw new Error("invalid response");
      state.apiSuccess += 1;
      return payload.data;
    } catch {}
    finally { clearTimeout(timer); }
  }
  return null;
}

async function cached(path, key, ttl, transform) {
  state.apiAttempted += 1;
  const saved = storageGet(`aquarium-v2:${key}`);
  if (saved && saved.expires > Date.now()) {
    state.apiCached += 1;
    return saved.value;
  }
  const data = await loadJson(path);
  if (data == null) return null;
  const value = transform(data);
  if (value != null) storageSet(`aquarium-v2:${key}`, { expires: Date.now() + ttl, value });
  return value;
}

function cleanText(value, max = 90) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : "";
}

function addPool(type, text, source, url = "") {
  const value = cleanText(text);
  if (!value) return;
  const normalizedUrl = typeof url === "string" && /^https:\/\//i.test(url) ? url : "";
  if (!state.pools[type].some((item) => item.text === value)) state.pools[type].push({ text: value, source, url: normalizedUrl });
}

function validHot(item) { return isWorkSafeHotTitle(item?.title || item?.text || item?.name); }
function listData(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.list)) return data.list;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

async function refreshContent() {
  const todayKey = shanghaiParts().key;
  const [joke, hitokoto, moyu, weibo] = await Promise.all([
    cached("/v2/dad-joke", "dad-joke", 30 * 60 * 1000, (data) => ({ text: data?.content || data?.joke || data?.text })),
    cached("/v2/hitokoto", "hitokoto", 30 * 60 * 1000, (data) => ({ text: data?.hitokoto || data?.content || data?.text })),
    cached("/v2/moyu", `moyu:${todayKey}`, 24 * 60 * 60 * 1000, (data) => ({ text: data?.moyuQuote || data?.content || data?.text })),
    cached("/v2/weibo", "weibo", 15 * 60 * 1000, (data) => listData(data).filter(validHot).slice(0, 6).map((item) => ({ text: item.title || item.text || item.name, url: item.link || item.url || item.href }))),
  ]);
  if (joke) addPool("jokes", joke.text, "在线冷笑话");
  if (hitokoto) addPool("hitokoto", hitokoto.text, "在线一言");
  if (moyu) addPool("moyu", moyu.text, "今日摸鱼日报");
  if (Array.isArray(weibo)) weibo.forEach((item) => addPool("hot", item.text, "职场热榜", item.url));
  const prepared = state.pools.jokes.length + state.pools.hitokoto.length + state.pools.moyu.length + state.pools.hot.length;
  setText(apiStatus, state.apiSuccess ? `动态签筒在线 · 已准备 ${prepared} 条` : state.apiCached ? `动态签筒使用最近缓存 · 已准备 ${prepared} 条` : "动态接口暂时休息 · 使用本地安全签");
}

function fallbackPool(type) {
  return (LOCAL[type] || []).map((text) => ({ text, source: "本地安全签", url: "" }));
}

function choosePool(kind) {
  const order = kind === "loach" ? ["moyu", "loach"] : kind === "hot" ? ["hot", "jokes", "hitokoto", "moyu"] : ["jokes", "hitokoto", "moyu", "hot"];
  const items = [];
  for (const type of order) items.push(...(state.pools[type] || []), ...fallbackPool(type));
  const unique = items.filter((item, index, array) => item.text && array.findIndex((other) => other.text === item.text) === index);
  const available = unique.filter((item) => item.text !== state.lastMessage);
  const pool = available.length ? available : unique;
  return pool[Math.floor(Math.random() * Math.max(pool.length, 1))] || { text: "海底今天风平浪静，先摸一会儿鱼。", source: "备用签", url: "" };
}

function showMessage({ kind = "random", label = "水族馆签筒" } = {}) {
  const item = choosePool(kind);
  showItem(label, item);
}

function showItem(label, item) {
  state.lastMessage = item.text;
  setText(messageLabel, `${label} · ${item.source}`);
  setText(messageText, item.text);
  messageLink.hidden = !item.url;
  if (item.url) {
    messageLink.href = item.url;
    setText(messageLink, "查看热榜原题");
  } else {
    messageLink.removeAttribute("href");
    setText(messageLink, "");
  }
  bubble.hidden = false;
  bubble.classList.remove("is-visible");
  void bubble.offsetWidth;
  bubble.classList.add("is-visible");
  clearTimeout(state.bubbleTimer);
  state.bubbleTimer = setTimeout(() => {
    bubble.classList.remove("is-visible");
    setTimeout(() => { bubble.hidden = true; }, 240);
  }, 5200);
}

function updateStatus() {
  const now = shanghaiParts();
  if (!state.boardDate) {
    setText(statusText, "暂时读不到看板日期，今天先自由参观。 ");
    setText(boardMeta, "水族馆不会据此判断缺更，请检查 KANBAN.md 标题。");
    return;
  }
  if (state.daysLate <= 0) {
    setText(statusText, "今日看板已更新，来水族馆是自愿摸鱼。");
    setText(boardMeta, `看板日期 ${formatBoardDate()} · 鱼群、虾蟹和小泥鳅正在营业`);
    return;
  }
  if (beforeNine(now)) {
    const seconds = secondsUntilNine(now);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    setText(statusText, `今日看板还在起床，距 09:00 还有 ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}。`);
    setText(boardMeta, `上次更新 ${formatBoardDate()} · 已相隔 ${state.daysLate} 天`);
    return;
  }
  setText(statusText, "截至今日 09:00，新的任务看板尚未靠岸。");
  setText(boardMeta, `上次更新 ${formatBoardDate()} · 真实缺更 ${state.daysLate} 天 · 寄居蟹 ${Math.min(state.daysLate, 7)} 只 · 记录星 ${Math.min(Math.max(state.daysLate - 7, 0), 7)} 颗`);
}

function applyTheme() {
  const night = state.manualNight == null ? autoNight() : state.manualNight;
  document.documentElement.classList.toggle("night", night);
  themeToggle.textContent = night ? "☀" : "☾";
  themeToggle.setAttribute("aria-label", night ? "预览日景" : "预览夜景");
  document.dispatchEvent(new CustomEvent("aquarium-theme-change", { detail: { night } }));
  window.sceneSetTheme?.(night);
}

async function loadBoard() {
  try {
    const response = await fetch(`../KANBAN.md?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const markdown = await response.text();
    state.boardDate = parseBoardDate(markdown.replace(/\r\n/g, "\n"));
    const today = shanghaiParts();
    state.daysLate = state.boardDate ? Math.max(0, dayNumber(today) - dayNumber(state.boardDate)) : 0;
  } catch (error) {
    console.warn("KANBAN.md unavailable", error);
    state.boardDate = null;
    state.daysLate = 0;
  }
  window.aquariumDaysLate = state.daysLate;
  window.aquariumNight = autoNight();
  updateStatus();
}

function sceneError(error) {
  const box = $("#error");
  box.hidden = false;
  box.textContent = "3D 场景暂时无法启动，已保留可访问的静态入口。";
  const link = document.createElement("a");
  link.href = "../#aquarium";
  link.textContent = " 返回正式摸鱼水族馆";
  box.append(link);
  console.error(error);
}

function onResident({ kind, label }) {
  showMessage({ kind, label });
}
window.aquariumOnResident = onResident;
document.addEventListener("aquarium-resident", (event) => onResident(event.detail || {}));
document.addEventListener("aquarium-quality-change", (event) => {
  showItem("画质已切换", { text: event.detail?.text || "画质设置已更新。", source: "性能设置", url: "" });
});
window.aquariumSceneError = sceneError;

$("#draw-quote").addEventListener("click", () => showMessage({ kind: "random", label: "水族馆签筒" }));
$("#ask-loach").addEventListener("click", () => {
  document.dispatchEvent(new CustomEvent("aquarium-react-resident", { detail: { kind: "loach" } }));
  window.sceneReactResident?.("loach");
  showMessage({ kind: "loach", label: "小泥鳅" });
});
themeToggle.addEventListener("click", () => {
  state.manualNight = !(state.manualNight == null ? autoNight() : state.manualNight);
  applyTheme();
});
$("#back-board").addEventListener("click", () => { location.href = "../#aquarium"; });
document.addEventListener("keydown", (event) => {
  if (event.repeat || event.target.closest("button,select,input,textarea,a,[contenteditable]")) return;
  if (event.key.toLowerCase() === "j") showMessage({ kind: "random", label: "水族馆签筒" });
  if (event.key.toLowerCase() === "l") {
    window.sceneReactResident?.("loach");
    showMessage({ kind: "loach", label: "小泥鳅" });
  }
});

window.addEventListener("scene-ready", applyTheme);
setInterval(() => {
  updateStatus();
  if (state.manualNight == null) applyTheme();
}, 1000);
setInterval(refreshContent, 15 * 60 * 1000);

(async function initialize() {
  await loadBoard();
  refreshContent();
  try {
    await import("./scenes/riverscape/src/main.js?v=20260929.2");
  } catch (error) {
    sceneError(error);
  }
})();
