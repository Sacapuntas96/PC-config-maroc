"""
UltraPC.ma - Scraper Cartes son (53-cartes-son)

Petite catégorie (parfois quasi vide selon les arrivages), même
structure de grille que les autres.

Usage:
    python ultrapc_cartes_son.py
"""

import re
from ultrapc_common import scrape_all, save_json, has_pattern

BASE_URL = "https://www.ultrapc.ma/53-cartes-son"
CATEGORY = "sound_card"


def extract_specs(name, haystack, url):
    specs = {}

    if has_pattern(r"\bUSB\b", haystack):
        specs["interface"] = "USB"
    elif has_pattern(r"PCI-?E(?:xpress)?", haystack):
        specs["interface"] = "PCIe"
    else:
        specs["interface"] = None

    channels = re.search(r"\b(2\.0|2\.1|5\.1|7\.1)\b", haystack)
    specs["channels"] = channels.group(1) if channels else None

    specs["bit_depth"] = None
    bits = re.search(r"(16|24|32)\s*[- ]?bit", haystack, re.I)
    if bits:
        specs["bit_depth"] = int(bits.group(1))

    return specs


if __name__ == "__main__":
    data = scrape_all(
        base_url=BASE_URL,
        category=CATEGORY,
        extract_specs_fn=extract_specs,
        key_fields=("interface",),
    )
    save_json(data, "cartes_son.json")
