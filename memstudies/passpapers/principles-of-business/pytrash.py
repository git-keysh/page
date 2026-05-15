#!/usr/bin/env python3
"""
node.py - Download CSEC Principles of Business past papers (Paper 2)
from api.caribbeans.ai for years 2016-2025.
Saves files to: memstudies/passpapers/pob/
"""

import os
import time
import requests
from urllib.parse import urlparse, unquote
from pathlib import Path

BASE_DIR = Path("memstudies/passpapers/pob")
BASE_DIR.mkdir(parents=True, exist_ok=True)

PDF_URLS = [
    "https://api.caribbeans.ai/past_papers/csec/Principles%20of%20Business/Paper%202/CSEC_Principles_of_Business_P2_2025_MJ.pdf",
    "https://api.caribbeans.ai/past_papers/csec/Principles%20of%20Business/Paper%202/CSEC_Principles_of_Business_P2_2024_MJ.pdf",
    "https://api.caribbeans.ai/past_papers/csec/Principles%20of%20Business/Paper%202/CSEC_Principles_of_Business_P2_2023_MJ.pdf",
    "https://api.caribbeans.ai/past_papers/csec/Principles%20of%20Business/Paper%202/CSEC_Principles_of_Business_P2_2022_MJ.pdf",
    "https://api.caribbeans.ai/past_papers/csec/Principles%20of%20Business/Paper%202/CSEC_Principles_of_Business_P2_2021_MJ.pdf",
    "https://api.caribbeans.ai/past_papers/csec/Principles%20of%20Business/Paper%202/CSEC_Principles_of_Business_P2_2019_MJ.pdf",
    "https://api.caribbeans.ai/past_papers/csec/Principles%20of%20Business/Paper%202/CSEC_Principles_of_Business_P2_2018_MJ.pdf",
    "https://api.caribbeans.ai/past_papers/csec/Principles%20of%20Business/Paper%202/CSEC_Principles_of_Business_P2_2017_MJ.pdf",
    "https://api.caribbeans.ai/past_papers/csec/Principles%20of%20Business/Paper%202/CSEC_Principles_of_Business_P2_2016_MJ.pdf",
]

def download_pdf(url: str, output_dir: Path) -> bool:
    """
    Download a single PDF from url and save to output_dir.
    Extracts filename from the URL or creates one based on year.
    Returns True on success, False on failure.
    """
    parsed = urlparse(url)
    raw_filename = os.path.basename(parsed.path)
    filename = unquote(raw_filename)  
    if not filename.endswith(".pdf"):
        # Fallback: use year from URL (if detectable)
        parts = raw_filename.split("_")
        year = "unknown"
        for p in parts:
            if p.isdigit() and len(p) == 4:
                year = p
                break
        filename = f"CSEC_POB_P2_{year}.pdf"

    filepath = output_dir / filename
    if filepath.exists():
        print(f"⏭️  File already exists: {filepath.name} - skipping.")
        return True

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
    try:
        print(f"⬇️  Downloading: {filename} ...")
        resp = requests.get(url, headers=headers, timeout=30, stream=True)
        resp.raise_for_status()
        content_type = resp.headers.get("content-type", "")
        if "application/pdf" not in content_type and not url.endswith(".pdf"):
            print(f"⚠️  Warning: URL may not be PDF (content-type: {content_type})")
        with open(filepath, "wb") as f:
            for chunk in resp.iter_content(chunk_size=8192):
                f.write(chunk)
        print(f"✅ Saved: {filepath}")
        return True
    except requests.exceptions.RequestException as e:
        print(f"❌ Failed to download {filename}: {e}")
        return False

def main():
    print("🚀 Starting download of CSEC Principles of Business past papers (Paper 2)")
    print(f"📁 Target directory: {BASE_DIR.absolute()}\n")
    success_count = 0
    for idx, url in enumerate(PDF_URLS, start=1):
        print(f"[{idx}/{len(PDF_URLS)}] Processing: {url}")
        if download_pdf(url, BASE_DIR):
            success_count += 1
        time.sleep(1.5)
    print(f"\n🏁 Done. Successfully downloaded {success_count} of {len(PDF_URLS)} papers.")
    if success_count < len(PDF_URLS):
        print("⚠️  Some downloads failed. Check network or URL availability.")

if __name__ == "__main__":
    main()