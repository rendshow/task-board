import test from "node:test";
import assert from "node:assert/strict";
import { dayNumber, isNightHour, isWorkSafeHotTitle, parseBoardDate, secondsUntilNine } from "../logic.js";

test("parses the first dated markdown heading and rejects invalid dates", () => {
  assert.deepEqual(parseBoardDate("# 看板 2026.09.29\n\n# 2027.01.01"), { year: 2026, month: 9, day: 29, key: "2026-09-29" });
  assert.equal(parseBoardDate("# 看板 2026.02.31"), null);
  assert.equal(parseBoardDate("没有日期的看板"), null);
});

test("computes Beijing countdown and missing-day differences", () => {
  assert.equal(secondsUntilNine({ hour: 8, minute: 59, second: 0 }), 60);
  assert.equal(secondsUntilNine({ hour: 9, minute: 0, second: 0 }), 0);
  assert.equal(secondsUntilNine({ hour: 0, minute: 0, second: 0 }), 32400);
  assert.equal(dayNumber({ year: 2026, month: 9, day: 29 }) - dayNumber({ year: 2026, month: 9, day: 28 }), 1);
  assert.equal(isNightHour(5), true);
  assert.equal(isNightHour(6), false);
  assert.equal(isNightHour(17), false);
  assert.equal(isNightHour(18), true);
});

test("keeps safe work-related hot titles and filters sensitive ones", () => {
  assert.equal(isWorkSafeHotTitle("打工人的周末如何安排"), true);
  assert.equal(isWorkSafeHotTitle("上班摸鱼新姿势"), true);
  assert.equal(isWorkSafeHotTitle("某人因暴力事件被查"), false);
  assert.equal(isWorkSafeHotTitle("政府发布新的办公政策"), false);
  assert.equal(isWorkSafeHotTitle("今日娱乐榜单"), false);
});
