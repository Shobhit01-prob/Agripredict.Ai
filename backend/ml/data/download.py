"""
FAOSTAT Crop Production Bulk Downloader.
Downloads official FAOSTAT crop production data (QCL) and extracts the normalized dataset.
"""

import os
import sys
import urllib.request
import zipfile
from pathlib import Path

# Ensure backend package can be imported
current_dir = Path(__file__).resolve().parent
backend_dir = current_dir.parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

RAW_DATA_DIR = current_dir / "raw"
RAW_DATA_DIR.mkdir(parents=True, exist_ok=True)

FAO_PRIMARY_URL = "https://bulks-faostat.fao.org/production/Production_Crops_Livestock_E_All_Data_(Normalized).zip"
FAO_FALLBACK_URL = "https://fenixservices.fao.org/faostat/static/bulkdownloads/Production_Crops_Livestock_E_All_Data_(Normalized).zip"
ZIP_FILE_PATH = RAW_DATA_DIR / "Production_Crops_Livestock_E_All_Data_(Normalized).zip"
CSV_FILE_PATH = RAW_DATA_DIR / "Production_Crops_Livestock_E_All_Data_(Normalized).csv"


def download_file(url: str, dest_path: Path) -> bool:
    print(f"Connecting to: {url}...")
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "Mozilla/5.0 (AgriPredict AI ML Pipeline/1.0)"}
    )
    try:
        with urllib.request.urlopen(req, timeout=90) as response, open(dest_path, "wb") as out_file:
            total_size = int(response.headers.get("Content-Length", 0))
            downloaded = 0
            block_size = 1024 * 512  # 512 KB
            while True:
                buffer = response.read(block_size)
                if not buffer:
                    break
                out_file.write(buffer)
                downloaded += len(buffer)
                if total_size > 0:
                    pct = (downloaded / total_size) * 100
                    mb = downloaded / (1024 * 1024)
                    tot_mb = total_size / (1024 * 1024)
                    print(f"\rDownloading: {mb:.1f} / {tot_mb:.1f} MB ({pct:.1f}%)", end="", flush=True)
                else:
                    mb = downloaded / (1024 * 1024)
                    print(f"\rDownloading: {mb:.1f} MB", end="", flush=True)
            print()
        return True
    except Exception as e:
        print(f"\nDownload error from {url}: {e}")
        if dest_path.exists():
            dest_path.unlink()
        return False


def extract_zip(zip_path: Path, extract_dir: Path):
    print(f"Extracting {zip_path.name} to {extract_dir}...")
    with zipfile.ZipFile(zip_path, "r") as zip_ref:
        for member in zip_ref.namelist():
            print(f" - Found member: {member}")
            zip_ref.extract(member, extract_dir)
    print("Extraction complete.")


def verify_csv(csv_path: Path):
    if not csv_path.exists():
        raise FileNotFoundError(f"Expected CSV file not found at: {csv_path}")

    # Inspect first few lines
    print(f"\nInspecting schema for {csv_path.name}...")
    with open(csv_path, "r", encoding="latin-1") as f:
        header = f.readline().strip()
        line1 = f.readline().strip()

    print(f"Columns in dataset:\n{header}")
    print(f"\nSample first row:\n{line1}\n")


def main():
    print("=== AgriPredict AI: FAOSTAT Data Ingestion ===")
    if CSV_FILE_PATH.exists() and CSV_FILE_PATH.stat().st_size > 1000000:
        print(f"CSV file already exists at {CSV_FILE_PATH} ({CSV_FILE_PATH.stat().st_size / (1024*1024):.1f} MB). Skipping download.")
        verify_csv(CSV_FILE_PATH)
        return

    success = False
    for url in [FAO_PRIMARY_URL, FAO_FALLBACK_URL]:
        if download_file(url, ZIP_FILE_PATH):
            success = True
            break

    if not success:
        print("Failed to download from primary and fallback FAOSTAT URLs. Please verify network access.")
        sys.exit(1)

    extract_zip(ZIP_FILE_PATH, RAW_DATA_DIR)
    verify_csv(CSV_FILE_PATH)
    print("Data download and verification successful!")


if __name__ == "__main__":
    main()
