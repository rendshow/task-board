# 📅 2026.06.29（周一）任务看板

### 👩‍💼 聪明蛋三三
- 🎯 **核心目标**: Memory + 算法
- [ ] **Agent Lab Day 12**: Memory（上）— SQLite 存对话历史
- [ ] **算法**: ⑧ 有效的字母异位词 ⑨ 无重复字符的最长子串
- [ ] **八股**: Memory 类型体系 — 感官记忆 / 工作记忆 / 长期记忆

### 🧑‍💻 人机^^
- 🎯 **核心目标**: 复习 Agent Lab + Agent 八股
- [ ] 复习 Agent Lab 项目
- [ ] 自己找 Agent 相关八股看

> 下次验证：周六下午。

---

## 算法 ACM 示例（Python）

### 242. 有效的字母异位词

```python
def is_anagram(s, t):
    if len(s) != len(t):
        return False
    count = [0] * 26
    for i in range(len(s)):
        count[ord(s[i]) - ord('a')] += 1
        count[ord(t[i]) - ord('a')] -= 1
    return all(c == 0 for c in count)

# 测试
print(is_anagram("anagram", "nagaram"))  # True
print(is_anagram("rat", "car"))          # False
```

### 3. 无重复字符的最长子串

```python
def length_of_longest_substring(s):
    seen = set()
    left = 0
    max_len = 0
    for right in range(len(s)):
        while s[right] in seen:
            seen.remove(s[left])
            left += 1
        seen.add(s[right])
        max_len = max(max_len, right - left + 1)
    return max_len

# 测试
print(length_of_longest_substring("abcabcbb"))  # 3
print(length_of_longest_substring("bbbbb"))     # 1
print(length_of_longest_substring("pwwkew"))    # 3
```