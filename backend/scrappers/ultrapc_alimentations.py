"""
UltraPC.ma - Scraper Alimentations PC (43-alimentations-pc)

Attention: cette catégorie contient aussi des bundles "boîtier + alim"
(segment d'URL "les-moyennes-tours" au lieu d'une plage de wattage) ;
ils sont marqués is_bundle=True plutôt qu'exclus.

Usage:
    python ultrapc_alimentations.py
"""

import re
from ultrapc_common import scrape_all, save_json, find_int, has_pattern

BASE_URL = "https://www.ultrapc.ma/43-alimentations-pc"
CATEGORY = "psu"

WATTAGE_RANGE_SEGMENTS = {
    "moins-de-500-w",
    "entre-500-w-et-599-w",
    "entre-600-w-et-699-w",
    "entre-700-w-et-799-w",
    "entre-800-w-et-899-w",
    "plus-de-900-w",
}


def subtype_from_url(url):
    segment = url.split("ultrapc.ma/")[1].split("/")[0]
    return segment


def extract_specs(name, haystack, url):
    segment = subtype_from_url(url)
    specs = {}

    specs["wattage_w"] = find_int(r"(\d{3,4})\s*W\b", name) or find_int(r"(\d{3,4})\s*W\b", haystack)

    cert = re.search(r"80\s*\+?\s*(BRONZE|SILVER|GOLD|PLATINUM|TITANIUM|WHITE)", haystack, re.I)
    specs["certification"] = f"80+ {cert.group(1).capitalize()}" if cert else None

    if has_pattern(r"non\s*modulaire", haystack):
        specs["modular"] = "non-modular"
    elif has_pattern(r"semi[\s-]?modulaire", haystack):
        specs["modular"] = "semi-modular"
    elif has_pattern(r"\bmodulaire\b", haystack):
        specs["modular"] = "modular"
    else:
        specs["modular"] = None

    # Un vrai bundle a un "+" isolé entre deux produits (ex: "BOITIER + ALIM"),
    # à ne pas confondre avec la notation de certification "80+".
    specs["is_bundle"] = has_pattern(r"\s\+\s", name) or (segment not in WATTAGE_RANGE_SEGMENTS)

    return specs


if __name__ == "__main__":
    data = scrape_all(
        base_url=BASE_URL,
        category=CATEGORY,
        extract_specs_fn=extract_specs,
        subtype_fn=subtype_from_url,
        key_fields=("wattage_w",),
    )
    save_json(data, "alimentations.json")
