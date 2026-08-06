from __future__ import annotations

import argparse
import shutil
from pathlib import Path

from rembg import remove


def process_image(image_path: Path, target_root: Path, backup_root: Path) -> tuple[bool, str]:
    rel_path = image_path.relative_to(target_root)
    backup_path = backup_root / rel_path
    backup_path.parent.mkdir(parents=True, exist_ok=True)

    if not backup_path.exists():
        shutil.copy2(image_path, backup_path)

    input_bytes = image_path.read_bytes()
    output_bytes = remove(
        input_bytes,
        alpha_matting=True,
        alpha_matting_foreground_threshold=240,
        alpha_matting_background_threshold=10,
        alpha_matting_erode_size=10,
        post_process_mask=True,
    )

    if not output_bytes:
        return False, "No output bytes"

    image_path.write_bytes(output_bytes)
    return True, "Processed"


def main() -> None:
    parser = argparse.ArgumentParser(description="Batch remove backgrounds from product images.")
    parser.add_argument(
        "--target",
        default="images/products/mm1004",
        help="Directory containing PNG product images.",
    )
    parser.add_argument(
        "--backup",
        default="images/_originals_before_bg_remove",
        help="Backup directory for originals.",
    )
    args = parser.parse_args()

    target_dir = Path(args.target)
    backup_dir = Path(args.backup)

    if not target_dir.exists():
        raise SystemExit(f"Target directory not found: {target_dir}")

    files = sorted(target_dir.rglob("*.png"))
    if not files:
        raise SystemExit("No PNG files found to process.")

    total = len(files)
    processed = 0
    failed = 0

    print(f"Found {total} PNG files under {target_dir}")
    print(f"Backups will be stored in {backup_dir}")

    for index, image_path in enumerate(files, start=1):
        try:
            ok, message = process_image(image_path, target_dir, backup_dir)
            if ok:
                processed += 1
                print(f"[{index}/{total}] OK    {image_path}")
            else:
                failed += 1
                print(f"[{index}/{total}] FAIL  {image_path} -> {message}")
        except Exception as exc:  # noqa: BLE001
            failed += 1
            print(f"[{index}/{total}] FAIL  {image_path} -> {exc}")

    print("\nDone")
    print(f"Processed: {processed}")
    print(f"Failed:    {failed}")


if __name__ == "__main__":
    main()
