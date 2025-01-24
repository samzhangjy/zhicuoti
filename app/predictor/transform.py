import csv
import json
import os
from pprint import pprint


class Transform:
    def __init__(self, json_path: str):
        self.raw_data = json.load(open(json_path, "r", encoding="utf-8"))

    def transform_tags(self, output_path: str):
        tags = []
        for problem in self.raw_data:
            for tag in problem["tags"]:
                if tag.isascii():
                    continue
                if tag not in tags:
                    tags.append(tag)
        csv_data = []
        for problem in self.raw_data:
            row = [0] * len(tags)
            flag = False
            for tag in problem["tags"]:
                if tag.isascii():
                    continue
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
            data.extend(
                json.load(open(os.path.join(input_dir, file), "r", encoding="utf-8"))
            )
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(json.dumps(data, indent=4, ensure_ascii=False))
        print(f"Transformed data saved to {output_path}. Total {len(data)} problems.")

    def parse_tags(self, output_path: str):
        tags = []
        for problem in self.raw_data:
            for tag in problem["tags"]:
                if tag.isascii():
                    continue
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
                if tag.isascii():
                    if "词义辨析" not in tag_:
                        tag_.append("词义辨析")
                    continue
                for tag_parsed in tags[tag]:
                    if tag_parsed not in tag_:
                        tag_.append(tag_parsed)
            curr["tags"] = tag_
            data.append(curr)
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(json.dumps(data, indent=4, ensure_ascii=False))

    def contigous_parse_tags(self, prev_tag_path: str, output_path: str):
        data = json.load(open(prev_tag_path, "r", encoding="utf-8"))
        tags = []
        for tag in data:
            if tag not in tags:
                tags.append(tag)
        for problem in self.raw_data:
            for tag in problem["tags"]:
                if tag.isascii():
                    continue
                if tag not in tags:
                    tags.append(tag)
                    data[tag] = [""]
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(json.dumps(data, indent=4, ensure_ascii=False))


if __name__ == "__main__":
    transformer = Transform("./data/ENG-10-plain.json")
    # transformer.merge_files("./data/tmp", "./data/ENG-9-plain.json")
    transformer.transform_tags("./data/ENG-10-tags.csv")
    # transformer.contigous_parse_tags("./data/ENG-7-tags.json", "./data/ENG-9-tags.json")
    # transformer.load_tags("./data/ENG-9-tags.json", "./data/ENG-10-plain.json")
