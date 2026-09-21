"""
UltraPC.ma - Scraper Mémoire vive PC (35-memoire-vive-pc)
Sous-catégories (segment d'URL) :
  - memoire-vive-ddr5 / memoire-vive-ddr4 / memoire-vive-ddr3
  - memoire-vive-pc-portable (SO-DIMM, portable)

Usage:
    python ultrapc_memoire_vive.py
"""

import re
from ultrapc_common import scrape_all, save_json, find_int, has_pattern

BASE_URL = "https://www.ultrapc.ma/35-memoire-vive-pc"
CATEGORY = "ram"

SUBTYPE_MAP = {
    "memoire-vive-ddr5": "ddr5",
    "memoire-vive-ddr4": "ddr4",
    "memoire-vive-ddr3": "ddr3",
    "memoire-vive-pc-portable": "laptop",
}


def subtype_from_url(url):
    segment = url.split("ultrapc.ma/")[1].split("/")[0]
    return SUBTYPE_MAP.get(segment, segment)


def extract_specs(name, haystack, url):
    subtype = subtype_from_url(url)
    specs = {}

    # Kit multi-barrettes : "32Go (2x16Go)" -> total=32, modules=2, taille_module=16
    kit = re.search(r"(\d+)\s*Go\s*\(\s*(\d+)\s*[xX]\s*(\d+)\s*Go\s*\)", haystack)
    if kit:
        specs["capacity_gb"] = int(kit.group(1))
        specs["modules"] = int(kit.group(2))
        specs["module_size_gb"] = int(kit.group(3))
    else:
        specs["capacity_gb"] = find_int(r"(\d+)\s*Go\b", haystack)
        specs["modules"] = 1
        specs["module_size_gb"] = specs["capacity_gb"]

    if subtype in ("ddr5", "ddr4", "ddr3"):
        specs["ram_type"] = subtype.upper()
    elif has_pattern(r"DDR5", haystack):
        specs["ram_type"] = "DDR5"
    elif has_pattern(r"DDR4", haystack):
        specs["ram_type"] = "DDR4"
    elif has_pattern(r"DDR3", haystack):
        specs["ram_type"] = "DDR3"
    else:
        specs["ram_type"] = None

    specs["frequency_mhz"] = find_int(r"(\d{3,5})\s*MHz", haystack)
    cl = re.search(r"CL\s?(\d+)", haystack, re.I)
    specs["cas_latency"] = int(cl.group(1)) if cl else None

    if subtype == "laptop" or has_pattern(r"SO-?DIMM", haystack):
        specs["form_factor"] = "SO-DIMM"
    else:
        specs["form_factor"] = "DIMM"

    specs["expo_xmp"] = has_pattern(r"\bXMP\b|\bEXPO\b", haystack)

    return specs


if __name__ == "__main__":
    data = scrape_all(
        base_url=BASE_URL,
        category=CATEGORY,
        extract_specs_fn=extract_specs,
        subtype_fn=subtype_from_url,
        key_fields=("capacity_gb", "frequency_mhz"),
    )
    save_json(data, "memoire_vive.json")
