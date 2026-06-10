# 📅 2026.06.10（周三）任务看板

> 🔓 今日自由安排，仅晚间有空。

### 👩‍💼 聪明蛋三三
- 🎯 **核心目标**: 自由
- [ ] 有余力就回顾 Agent Lab Day 6 的代码

### 🧑‍💻 人机^^
- 🎯 **核心目标**: 自由
- [ ] 有余力就推一点 Agent Lab 进度

> 明日（周四）恢复正常节奏。

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
