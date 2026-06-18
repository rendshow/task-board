# 📅 2026.06.17（周三）任务看板

### 👩‍💼 聪明蛋三三
- 🎯 **核心目标**: RAG 向量检索 + 算法恢复
- [ ] **Agent Lab Day 9**: RAG（下）ChromaDB + Embedding 建索引
- [ ] **算法**: ④ 三数之和 ⑤ 接雨水
- [ ] **八股**: 向量检索 — 余弦相似度 / Top-K / HNSW 概念

### 🧑‍💻 人机^^
- 🎯 **核心目标**: 回溯 + MySQL 索引 + Memory
- [ ] **LC Day 9**: 回溯 8 题 — 子集 / 全排列 / 组合总和 / 括号生成 / 电话号码字母组合 / 分割回文串 / N 皇后 / 单词搜索
- [ ] **Java 八股 Day 9**: MySQL（上）— B+Tree / 聚簇索引 vs 非聚簇 / 最左前缀 / 覆盖索引 / 索引下推
- [ ] **Agent Lab Day 12**: Memory（上）— SQLite 存对话历史
- [ ] **Agent 八股**: 上下文窗口 — Token 上限 / 截断策略 / 窗口压缩 / 摘要替代方案

> 下次验证：周六下午。

---

## 算法 ACM 示例（Python）

### 15. 三数之和

```python
def three_sum(nums):
    nums.sort()
    n = len(nums)
    res = []
    for i in range(n - 2):
        if nums[i] > 0:
            break
        if i > 0 and nums[i] == nums[i - 1]:
            continue
        left, right = i + 1, n - 1
        while left < right:
            total = nums[i] + nums[left] + nums[right]
            if total < 0:
                left += 1
            elif total > 0:
                right -= 1
            else:
                res.append([nums[i], nums[left], nums[right]])
                left += 1
                right -= 1
                while left < right and nums[left] == nums[left - 1]:
                    left += 1
                while left < right and nums[right] == nums[right + 1]:
                    right -= 1
    return res

# 测试
print(three_sum([-1, 0, 1, 2, -1, -4]))
# [[-1, -1, 2], [-1, 0, 1]]
```

### 42. 接雨水（双指针）

```python
def trap(height):
    if not height:
        return 0
    left, right = 0, len(height) - 1
    left_max = right_max = 0
    water = 0
    while left < right:
        if height[left] < height[right]:
            if height[left] >= left_max:
                left_max = height[left]
            else:
                water += left_max - height[left]
            left += 1
        else:
            if height[right] >= right_max:
                right_max = height[right]
            else:
                water += right_max - height[right]
            right -= 1
    return water

# 测试
print(trap([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]))
# 6
```