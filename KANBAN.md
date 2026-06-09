# 📅 2026.06.10（周三）任务看板

### 🧑‍💻 人机^^
- 🎯 **核心目标**: 普通数组 + 矩阵 7 题 + 多线程收尾
- [ ] 课题配套软件（上午 2h）
- [ ] **LC Day 4**: `#189` `#238` `#41` `#73` `#54` `#48` `#240`
- [ ] **Java 八股 Day 4**: synchronized 锁升级 / ReentrantLock + AQS / volatile + CAS

### 👩‍💼 聪明蛋三三
- 🎯 **核心目标**: 工具广场 — 让 Agent 学会调外部工具
- [ ] **Agent Lab Day 7**: 写 Weather Tool + Search Tool，注册到 Agent
- [ ] **算法**: ④ 三数之和 ⑤ 接雨水
- [ ] **八股**: Function Calling 机制 — Tool Schema 怎么写、LLM 怎么决定调哪个

> 下次验证：周六下午。

---

## 算法 ACM 示例（Python）

### 15. 三数之和

```python
import sys

def three_sum(nums):
    nums.sort()
    n = len(nums)
    res = []
    for i in range(n - 2):
        if nums[i] > 0:            # 第一个数 > 0，后面不可能凑出 0
            break
        if i > 0 and nums[i] == nums[i - 1]:  # 跳过重复
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
                while left < right and nums[left] == nums[left - 1]:   # 跳过重复
                    left += 1
                while left < right and nums[right] == nums[right + 1]: # 跳过重复
                    right -= 1
    return res

if __name__ == '__main__':
    data = sys.stdin.read().strip().split()
    nums = list(map(int, data))
    ans = three_sum(nums)
    for t in ans:
        print(*t)
```

### 42. 接雨水（双指针）

```python
import sys

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

if __name__ == '__main__':
    data = sys.stdin.read().strip().split()
    height = list(map(int, data))
    print(trap(height))
```
