"""
UltraPC.ma - Scraper Refroidissement (44-refroidissement)
Sous-catégories mélangées (identifiées via le segment d'URL) :
  - kits-watercooling      -> AIO liquid coolers (taille radiateur en mm)
  - ventirads-processeur   -> Air coolers / ventirads (taille ventilo, caloducs)
  - ventilateurs-boitier   -> Ventilateurs de boîtier (taille, quantité)
  - pate-thermique-pc      -> Pâte thermique (grammage)

Usage:
    python ultrapc_refroidissement.py
"""

from ultrapc_common import scrape_all, save_json, find_int, has_pattern

BASE_URL = "https://www.ultrapc.ma/44-refroidissement"
CATEGORY = "cooling"

SUBTYPE_MAP = {
    "kits-watercooling": "aio",
    "ventirads-processeur": "air_cooler",
    "ventilateurs-boitier": "case_fan",
    "pate-thermique-pc": "thermal_paste",
}


def subtype_from_url(url):
    segment = url.split("ultrapc.ma/")[1].split("/")[0]
    return SUBTYPE_MAP.get(segment, "other")


def extract_specs(name, haystack, url):
    cooler_type = subtype_from_url(url)
    specs = {"cooler_type": cooler_type}

    if cooler_type == "aio":
        size = find_int(r"(120|140|240|280|360|420|520|560|720)(?!\d)", name)
        if size is None:
            size = find_int(r"\b(120|140|240|280|360|420|520|560|720)\s*mm", haystack)
        specs["radiator_size_mm"] = size
        specs["argb"] = has_pattern(r"\bA?RGB\b", haystack)

    elif cooler_type == "air_cooler":
        specs["fan_size_mm"] = find_int(r"(\d{2,3})\s*mm", haystack)
        specs["heat_pipes"] = find_int(r"(\d+)\s*caloducs?", haystack)
        specs["argb"] = has_pattern(r"\bA?RGB\b", haystack)

    elif cooler_type == "case_fan":
        specs["fan_size_mm"] = find_int(r"(\d{2,3})\s*mm", haystack)
        qty = find_int(r"(?:pack|lot)\s*de\s*(\d+)", haystack)
        if qty is None:
            qty = find_int(r"(\d+)\s*ventilateurs?", haystack)
        specs["quantity"] = qty if qty else 1
        specs["argb"] = has_pattern(r"\bA?RGB\b", haystack)

    elif cooler_type == "thermal_paste":
        grams = find_int(r"(\d+(?:[.,]\d+)?)\s*g(?:rammes?)?\b", haystack)
        specs["grams"] = grams

    return specs


if __name__ == "__main__":
    data = scrape_all(
        base_url=BASE_URL,
        category=CATEGORY,
        extract_specs_fn=extract_specs,
        subtype_fn=subtype_from_url,
        key_fields=("radiator_size_mm", "fan_size_mm", "grams"),
    )
    save_json(data, "refroidissement.json")
