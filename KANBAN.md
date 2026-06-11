# 📅 2026.06.11（周四）任务看板

> ⏩ 继续推进内容。

### 👩‍💼 聪明蛋三三
- 🎯 **核心目标**: RAG 启动 — 让 Agent 会读文档
- [ ] **Agent Lab Day 8**: PDF 解析 + 文本分块
- [ ] **算法**: ⑥ 存在重复元素 ⑦ 字母异位词分组
- [ ] **八股**: Embedding 原理 — 文本→向量，为什么距离近=语义近

### 🧑‍💻 人机^^
- 🎯 **核心目标**: 链表 8 题 + JVM + RAG
- [ ] **LC Day 5**: 链表（上）— 反转 / 合并有序 / 环形 I&II / 相交 / 删除倒数第 N / 两两交换 / 排序链表
- [ ] **Java 八股 Day 5**: JVM（上）— 内存结构、堆/栈/方法区、对象创建、类加载
- [ ] **Agent Lab Day 8**（同三三）: PDF 解析 + 文本分块
- [ ] **Agent 八股**: Embedding 原理

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
print(contains_duplicate([1, 1, 1, 3, 3, 4, 3, 2])) # True
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
