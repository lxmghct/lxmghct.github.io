---
layout: post
title: 使用 Clippy 统计 Rust 项目中的 lint
date: 2026-03-27 11:30:00 +0800
categories: troubleshooting
tags: rust
---

使用 Clippy 来检查 Rust 项目中的 lint 是一个很好的实践，可以帮助我们发现代码中的潜在问题和改进点。下面是一个示例脚本，展示了如何使用 Python 来运行 Clippy 并统计 lint 的数量。


```python
import subprocess
import json
import csv
from pathlib import Path
from collections import Counter

ROOT_DIR = "/path/to/rust/projects"

output_name = ROOT_DIR.split("/")[-1].replace("dataset-", "")

OUTPUT_CSV = f"clippy-output/{output_name}_clippy.csv"


def find_rust_projects(root):
    """查找 Rust 项目目录，兼容 translation_raw 结构"""
    projects = set()

    root = Path(root)

    # 原有逻辑：查找 Cargo.toml
    for path in root.rglob("Cargo.toml"):
        projects.add(path.parent)

    # 新增逻辑：查找 translation_raw / translation_raw_WIP
    for dir_path in root.rglob("*"):
        if not dir_path.is_dir():
            continue

        cargo = dir_path / "Cargo.toml"
        if cargo.exists():
            continue

        translation_raw = dir_path / "translation_raw"
        translation_raw_wip = dir_path / "translation_raw_WIP"

        if translation_raw.exists() and translation_raw.is_dir():
            projects.add(translation_raw)

        if translation_raw_wip.exists() and translation_raw_wip.is_dir():
            projects.add(translation_raw_wip)

    return sorted(projects)


def run_clippy(project_path):
    """运行 clippy 并统计 lint"""
    cmd = [
        "cargo",
        "clippy",
        "--message-format=json",
        "--all-targets",
        "--all-features"
    ]

    process = subprocess.Popen(
        cmd,
        cwd=project_path,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )

    lint_counter = Counter()
    level_counter = Counter()

    for line in process.stdout:
        try:
            msg = json.loads(line)
        except json.JSONDecodeError:
            continue

        if msg.get("reason") != "compiler-message":
            continue

        message = msg.get("message", {})
        code = message.get("code")
        level = message.get("level")

        if not code:
            continue

        lint_name = code.get("code")
        if not lint_name:
            continue

        # 只统计 clippy
        if not lint_name.startswith("clippy::"):
            continue

        lint_counter[lint_name] += 1
        level_counter[level] += 1

    process.wait()

    return lint_counter, level_counter


def main():
    projects = find_rust_projects(ROOT_DIR)

    print(f"Found {len(projects)} Rust projects")

    rows = []

    for project in projects:
        print(f"Running clippy: {project}")

        lint_counter, level_counter = run_clippy(project)

        # 保留最后一段路径
        project_path = str(project)
        project_name = project_path.split("/")[-1]
        if project_name == "translation_raw" or project_name == "translation_raw_WIP":
            suffix = "_raw" if project_name == "translation_raw" else "_opt"
            project_name = project_path.split("/")[-2] + suffix


        row = {
            "project": project_name,
            "warnings": level_counter.get("warning", 0),
            "errors": level_counter.get("error", 0),
            "total": sum(level_counter.values())
        }

        # 可选：加入常见 lint
        for lint, count in lint_counter.items():
            row[lint] = count

        rows.append(row)

    # 收集所有列名
    fieldnames = set()
    for r in rows:
        fieldnames.update(r.keys())

    fieldnames = sorted(fieldnames)
    # 把 project, warnings, errors, total 放在前面
    fieldnames = ["project", "warnings", "errors", "total"] + [f for f in fieldnames if f not in {"project", "warnings", "errors", "total"}]

    # 写入 CSV
    with open(OUTPUT_CSV, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Saved to {OUTPUT_CSV}")


if __name__ == "__main__":
    main()
```
