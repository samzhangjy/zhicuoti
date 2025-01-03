import matplotlib.pyplot as plt
import matplotlib.font_manager
import json
import matplotlib

data = json.load(open("data/MATH-6-plain.json", "r", encoding="utf-8"))

tags = []
num = []
for problem in data:
    for tag in problem["tags"]:
        if tag not in tags:
            tags.append(tag)
            num.append(1)
        else:
            num[tags.index(tag)] += 1

print(tags)

plt.figure(figsize=(15, 10))
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.bar(tags, num)
plt.title("Tag distribution")
plt.xlabel("Tags")
plt.ylabel("Number of problems")
plt.xticks(rotation=50)
plt.tight_layout()
plt.savefig("./tag-distribution.png")
