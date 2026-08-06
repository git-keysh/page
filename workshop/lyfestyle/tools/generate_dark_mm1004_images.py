from __future__ import annotations

import hashlib
import io
import json
from collections import deque
from pathlib import Path
from urllib.parse import urlparse

import requests
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PRODUCTS_JSON = ROOT / "products.json"
OUTPUT_DIR = ROOT / "images" / "products" / "mm1004" / "dark"
TARGET_PRODUCT_ID = "d4s-mm1004-bkg"


def darken_background(img: Image.Image) -> Image.Image:
    rgb = img.convert("RGB")
    px = rgb.load()
    width, height = rgb.size

    # Learn backdrop tone from border pixels so only the actual image background
    # is recolored, not product highlights.
    border_samples: list[tuple[int, int, int]] = []
    for x in range(width):
        border_samples.append(px[x, 0])
        border_samples.append(px[x, height - 1])
    for y in range(height):
        border_samples.append(px[0, y])
        border_samples.append(px[width - 1, y])

    neutral_border = [
        (r, g, b)
        for (r, g, b) in border_samples
        if max(r, g, b) - min(r, g, b) <= 28
    ]
    if neutral_border:
        avg_r = sum(c[0] for c in neutral_border) / len(neutral_border)
        avg_g = sum(c[1] for c in neutral_border) / len(neutral_border)
        avg_b = sum(c[2] for c in neutral_border) / len(neutral_border)
    else:
        avg_r, avg_g, avg_b = 230, 230, 230

    def is_bg_pixel(r: int, g: int, b: int) -> bool:
        # Only recolor near-neutral pixels close to learned border tone.
        return (
            abs(r - avg_r) <= 26
            and abs(g - avg_g) <= 26
            and abs(b - avg_b) <= 26
            and (max(r, g, b) - min(r, g, b) <= 30)
        )

    # Flood-fill from image borders so we only recolor true backdrop, not
    # bright highlights or label text on the product itself.
    visited = set()
    queue: deque[tuple[int, int]] = deque()

    for x in range(width):
        queue.append((x, 0))
        queue.append((x, height - 1))
    for y in range(height):
        queue.append((0, y))
        queue.append((width - 1, y))

    while queue:
        x, y = queue.popleft()
        if x < 0 or y < 0 or x >= width or y >= height:
            continue
        if (x, y) in visited:
            continue
        visited.add((x, y))

        r, g, b = px[x, y]
        if not is_bg_pixel(r, g, b):
            continue

        px[x, y] = (0, 0, 0)

        queue.append((x + 1, y))
        queue.append((x - 1, y))
        queue.append((x, y + 1))
        queue.append((x, y - 1))

    return rgb


def safe_name_from_url(url: str) -> str:
    parsed = urlparse(url)
    name = Path(parsed.path).name
    stem = Path(name).stem
    ext = Path(name).suffix or ".jpg"
    # Keep filenames unique and deterministic.
    digest = hashlib.sha1(url.encode("utf-8")).hexdigest()[:8]
    return f"{stem}-{digest}{ext}"


def collect_urls(product: dict) -> list[str]:
    urls: list[str] = []
    for img in product.get("images", []):
        if isinstance(img, str) and img.startswith("http"):
            urls.append(img)

    variants = product.get("color_variants", {})
    if isinstance(variants, dict):
        for data in variants.values():
            if not isinstance(data, dict):
                continue
            for img in data.get("images", []):
                if isinstance(img, str) and img.startswith("http"):
                    urls.append(img)

    # Preserve order while deduplicating.
    unique: list[str] = []
    seen: set[str] = set()
    for u in urls:
        if u not in seen:
            seen.add(u)
            unique.append(u)
    return unique


def main() -> None:
    products = json.loads(PRODUCTS_JSON.read_text(encoding="utf-8"))
    product = next((p for p in products if p.get("id") == TARGET_PRODUCT_ID), None)
    if not product:
        raise SystemExit(f"Product not found: {TARGET_PRODUCT_ID}")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    urls = collect_urls(product)
    mapping: dict[str, str] = {}

    for url in urls:
        file_name = safe_name_from_url(url)
        out_path = OUTPUT_DIR / file_name

        resp = requests.get(url, timeout=30)
        resp.raise_for_status()

        img = Image.open(io.BytesIO(resp.content))
        out = darken_background(img)
        out.save(out_path, quality=92)

        rel = out_path.relative_to(ROOT).as_posix()
        mapping[url] = rel
        print(f"Wrote: {rel}")

    map_path = OUTPUT_DIR / "dark-map.json"
    map_path.write_text(json.dumps(mapping, indent=2), encoding="utf-8")
    print(f"\nSaved mapping: {map_path.relative_to(ROOT).as_posix()}")
    print(f"Total generated: {len(mapping)}")


if __name__ == "__main__":
    main()
