"""
UltraPC.ma - Scraper Boîtiers PC (48-boitier-pc)
Sous-catégories (segment d'URL) :
  - les-grandes-tours / les-moyennes-tours / les-minis-boitiers

Attention: cette catégorie contient aussi des bundles "boîtier + alim"
(le nom contient un "+"), marqués is_bundle=True.

Usage:
    python ultrapc_boitiers.py
"""

import re
from ultrapc_common import scrape_all, save_json, find_int, has_pattern

BASE_URL = "https://www.ultrapc.ma/48-boitier-pc"
CATEGORY = "case"

SUBTYPE_MAP = {
    "les-grandes-tours": "full_tower",
    "les-moyennes-tours": "mid_tower",
    "les-minis-boitiers": "mini",
}


def subtype_from_url(url):
    segment = url.split("ultrapc.ma/")[1].split("/")[0]
    return SUBTYPE_MAP.get(segment, segment)


def extract_specs(name, haystack, url):
    specs = {"format": subtype_from_url(url)}

    specs["tempered_glass"] = has_pattern(r"verre tremp[ée]", haystack)
    specs["fan_count"] = find_int(r"(\d+)\s*ventilateurs?", haystack)
    specs["argb"] = has_pattern(r"\bA?RGB\b", haystack)
    specs["lcd_screen"] = has_pattern(r"[ée]cran\s*(?:LCD)?|LCD\b", haystack)
    specs["is_bundle"] = has_pattern(r"\s\+\s", name)

    return specs


if __name__ == "__main__":
    data = scrape_all(
        base_url=BASE_URL,
        category=CATEGORY,
        extract_specs_fn=extract_specs,
        subtype_fn=subtype_from_url,
        key_fields=("fan_count",),
    )
    save_json(data, "boitiers.json")
