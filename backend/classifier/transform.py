import json
import csv


def transform(files: dict[str, str], output_path: str) -> str:
    headers = ["contentPlain"]
    csv_data = []
    for subject in files:
        headers.append(subject)
        with open(files[subject], "r", encoding="utf-8") as f:
            curr = json.loads(f.read())
        for entry in curr:
            row_data = [entry["content_plain"].split(".", 1)[1].strip()]
            for subject_ in files:
                row_data.append(1 if subject_ == subject else 0)
            csv_data.append(row_data)

    with open(output_path, "w", encoding="utf-8") as f:
        writer = csv.writer(f, quoting=csv.QUOTE_ALL)
        writer.writerows([headers] + csv_data)


if __name__ == "__main__":
    transform(
        {
            "MATH": "./data/predictor/MATH-plain.json",
            "ENGLISH": "./data/predictor/ENG-plain.json",
            "ZHENGZHI": "./data/predictor/ZHENGZHI-plain.json",
            "BIOLOGY": "./data/predictor/BIOLOGY-plain.json",
        },
        "./data/merged.csv",
    )
