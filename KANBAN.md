# 📅 2026.06.18（周四）任务看板

### 👩‍💼 聪明蛋三三
- 🎯 **核心目标**: RAG 问答链路 + 算法
- [ ] **Agent Lab Day 10**: RAG 问答 — 检索 → 拼接 → 生成
- [ ] **算法**: ⑥ 存在重复元素 ⑦ 字母异位词分组
- [ ] **八股**: RAG 全链路 — Embedding → 检索 → 重排 → 生成

### 🧑‍💻 人机^^
- 🎯 **核心目标**: 回溯 + MySQL 索引 + Memory
- [ ] **LC Day 9**: 回溯 8 题 — 子集 / 全排列 / 组合总和 / 括号生成 / 电话号码字母组合 / 分割回文串 / N 皇后 / 单词搜索
- [ ] **Java 八股 Day 9**: MySQL（上）— B+Tree / 聚簇索引 vs 非聚簇 / 最左前缀 / 覆盖索引 / 索引下推
- [ ] **Agent Lab Day 12**: Memory（上）— SQLite 存对话历史
- [ ] **Agent 八股**: 上下文窗口 — Token 上限 / 截断策略 / 窗口压缩 / 摘要替代方案

> 下次验证：周六下午。

---

## 算法 ACM 示例（Python）

### 217. 存在重复元素

```python
def contains_duplicate(nums):
    seen = set()
    for x in nums:
        if x in seen:
            return True
        seen.add(x)
    return False

# 测试
print(contains_duplicate([1, 2, 3, 1]))              # True
print(contains_duplicate([1, 2, 3, 4]))              # False
```

### 49. 字母异位词分组

```python
from collections import defaultdict

def group_anagrams(strs):
    groups = defaultdict(list)
    for s in strs:
        key = ''.join(sorted(s))
        groups[key].append(s)
    return list(groups.values())

# 测试
print(group_anagrams(["eat", "tea", "tan", "ate", "nat", "bat"]))
# [['eat', 'tea', 'ate'], ['tan', 'nat'], ['bat']]
```