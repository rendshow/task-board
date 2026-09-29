import test from "node:test";
import assert from "node:assert/strict";
import { renderSettings } from "../scenes/riverscape/src/render-policy.js";
import { frameRate } from "../scenes/shared/render-policy.js";

test("quality profiles expose visibly different rendering budgets", () => {
  const eco = renderSettings({ profile: "eco", pixelRatio: 2 });
  const balanced = renderSettings({ profile: "balanced", pixelRatio: 2 });
  const detail = renderSettings({ profile: "detail", pixelRatio: 2 });

  assert.deepEqual([frameRate("eco"), frameRate("balanced"), frameRate("detail")], [20, 30, 60]);
  assert.deepEqual([eco.shadowSize, balanced.shadowSize, detail.shadowSize], [1024, 2048, 4096]);
  assert.ok(eco.resolution < balanced.resolution && balanced.resolution < detail.resolution);
  assert.ok(eco.maxPixels < balanced.maxPixels && balanced.maxPixels < detail.maxPixels);
  assert.deepEqual([eco.samples, balanced.samples, detail.samples], [2, 4, 4]);
});
