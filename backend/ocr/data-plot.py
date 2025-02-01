import matplotlib.pyplot as plt

acc = []

with open("data/ocr/log/train-problem-one.log", "r", encoding="utf-8") as f:
    lines = f.readlines()
    for line in lines:
        if "Best test bbox ap is" in line:
            acc.append(float(line.split(" ")[-1].strip().strip(".")))

# with open("data/ocr/log/train-problem-type.log", "r", encoding="utf-8") as f:
#     lines = f.readlines()
#     for line in lines:
#         if "[Eval]" in line and "[Avg]" in line:
#             acc.append(float(line.split(",")[-2].strip().split(": ")[-1].strip(".").strip()))

print(acc)

plt.figure(figsize=(7, 5))
plt.title("One-column Problem Detection Accuracy vs. Epoch")
plt.plot(range(1, len(acc) + 1), acc)
plt.xlabel("Epoch")
plt.ylabel("Accuracy")
plt.savefig("acc.png")
