import json
import csv
import os
from pprint import pprint

class Transform:
    def __init__(self, json_path: str):
        self.raw_data = json.load(open(json_path, "r", encoding="utf-8"))

    def transform_tags(self, output_path: str):
        tags = []
        for problem in self.raw_data:
            for tag in problem["tags"]:
                if tag.isascii(): continue
                if tag not in tags:
                    tags.append(tag)
        csv_data = []
        for problem in self.raw_data:
            row = [0] * len(tags)
            flag = False
            for tag in problem["tags"]:
                if tag.isascii(): continue
                row[tags.index(tag)] = 1
                flag = True
            if not flag:
                continue
            csv_data.append([problem["content_plain"].split(".", 1)[1].strip()] + row)
        headers = ["contentPlain"] + tags
        with open(output_path, "w", encoding="utf-8") as f:
            writer = csv.writer(f, quoting=csv.QUOTE_ALL)
            writer.writerows([headers] + csv_data)
    
    def merge_files(self, input_dir: str, output_path: str):
        data = []
        for file in os.listdir(input_dir):
            data.extend(json.load(open(os.path.join(input_dir, file), "r", encoding="utf-8")))
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(json.dumps(data, indent=4, ensure_ascii=False))
        print(f"Transformed data saved to {output_path}. Total {len(data)} problems.")

    def parse_tags(self, output_path: str):
        tags = []
        for problem in self.raw_data:
            for tag in problem["tags"]:
                if tag.isascii(): continue
                if tag not in tags:
                    tags.append(tag)
        pprint(tags)
        print(len(tags))
        data = {}
        for tag in tags:
            data[tag] = [""]
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(json.dumps(data, indent=4, ensure_ascii=False))
    
    def load_tags(self, input_path: str, output_path: str):
        tags = json.load(open(input_path, "r", encoding="utf-8"))
        data = []
        for problem in self.raw_data:
            curr = problem
            tag_ = []
            for tag in problem["tags"]:
                for tag_parsed in tags[tag]:
                    if tag_parsed not in tag_:
                        tag_.append(tag_parsed)
            curr["tags"] = tag_
            data.append(curr)
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(json.dumps(data, indent=4, ensure_ascii=False))


if __name__ == "__main__":
    transformer = Transform("./data/MATH-6-plain.json")
    # transformer.merge_files("./data/tmp", "./data/MATH-4-plain.json")
    transformer.transform_tags("./data/MATH-6-tags.csv")
    # transformer.load_tags("./data/MATH-tags.json", "./data/MATH-6-plain.json")
