"""
UltraPC.ma - Scraper Cartes mères (28-cartes-meres)

Usage:
    python ultrapc_cartes_meres.py
"""

import re
from ultrapc_common import scrape_all, save_json, find_int, has_pattern

BASE_URL = "https://www.ultrapc.ma/28-cartes-meres"
CATEGORY = "motherboard"

SOCKET_MAP = {
    "socket-1200": "LGA1200",
    "socket-1700": "LGA1700",
    "socket-1151": "LGA1151",
    "socket-1851": "LGA1851",
    "socket-am4": "AM4",
    "socket-am5": "AM5",
    "socket-2066": "LGA2066",
    "socket-amd-tr4": "TR4",
}

# Chipsets connus (Intel + AMD), du plus spécifique au plus générique
CHIPSET_PATTERN = r"\b(A520|A620|B550|B650|B760|B850|B870|H510|H610|H670|H770|X570|X670|X870|Z590|Z690|Z790|Z890|TRX40|WRX80)\b"

FORM_FACTORS = ["E-ATX", "Micro ATX", "Mini ITX", "ATX"]  # ordre: du plus spécifique au plus générique


def subtype_from_url(url):
    segment = url.split("ultrapc.ma/")[1].split("/")[0]
    return SOCKET_MAP.get(segment, segment)


def extract_specs(name, haystack, url):
    specs = {"socket": subtype_from_url(url)}

    chip = re.search(CHIPSET_PATTERN, haystack, re.I)
    specs["chipset"] = chip.group(1).upper() if chip else None

    specs["form_factor"] = None
    for ff in FORM_FACTORS:
        if has_pattern(re.escape(ff), haystack):
            specs["form_factor"] = ff
            break

    if has_pattern(r"DDR5", haystack):
        specs["ram_type"] = "DDR5"
    elif has_pattern(r"DDR4", haystack):
        specs["ram_type"] = "DDR4"
    elif has_pattern(r"DDR3", haystack):
        specs["ram_type"] = "DDR3"
    else:
        specs["ram_type"] = None

    specs["ram_slots"] = find_int(r"(\d+)\s*x\s*DDR", haystack)
    specs["wifi"] = has_pattern(r"\bwifi\b", haystack)

    return specs


if __name__ == "__main__":
    data = scrape_all(
        base_url=BASE_URL,
        category=CATEGORY,
        extract_specs_fn=extract_specs,
        subtype_fn=None,  # socket déjà inclus dans specs["socket"]
        key_fields=("chipset", "form_factor"),
    )
    save_json(data, "cartes_meres.json")
