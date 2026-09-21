"""
UltraPC.ma - Scraper Disques durs et SSD (34-disques-durs-et-ssd)
Sous-catégories (segment d'URL) :
  - disques-ssd
  - disques-durs-internes
  - disques-durs-externes
  - accessoires-disque-dur (boîtiers externes, adaptateurs...)

Usage:
    python ultrapc_disques.py
"""

import re
from ultrapc_common import scrape_all, save_json, find_int, has_pattern

BASE_URL = "https://www.ultrapc.ma/34-disques-durs-et-ssd"
CATEGORY = "storage"

SUBTYPE_MAP = {
    "disques-ssd": "ssd",
    "disques-durs-internes": "hdd_internal",
    "disques-durs-externes": "hdd_external",
    "accessoires-disque-dur": "accessory",
}


def subtype_from_url(url):
    segment = url.split("ultrapc.ma/")[1].split("/")[0]
    return SUBTYPE_MAP.get(segment, segment)


def extract_specs(name, haystack, url):
    subtype = subtype_from_url(url)
    specs = {}

    if subtype == "ssd" or has_pattern(r"\bSSD\b", haystack):
        specs["storage_type"] = "SSD"
    elif has_pattern(r"\bHDD\b|disque dur", haystack):
        specs["storage_type"] = "HDD"
    else:
        specs["storage_type"] = None

    # Capacité normalisée en Go (1 To = 1000 Go)
    cap = re.search(r"(\d+(?:[.,]\d+)?)\s*(To|Go)\b", haystack, re.I)
    if cap:
        value = float(cap.group(1).replace(",", "."))
        unit = cap.group(2).lower()
        specs["capacity_gb"] = int(value * 1000) if unit == "to" else int(value)
    else:
        specs["capacity_gb"] = None

    if has_pattern(r"\bNVMe\b", haystack):
        specs["interface"] = "NVMe"
    elif has_pattern(r"SATA", haystack):
        specs["interface"] = "SATA"
    elif has_pattern(r"\bUSB\b", haystack):
        specs["interface"] = "USB"
    else:
        specs["interface"] = None

    pcie = re.search(r"PCI-?E(?:xpress)?\s*(?:Gen)?\s*(\d(?:\.\d)?)", haystack, re.I)
    specs["pcie_gen"] = pcie.group(1) if pcie else None

    if has_pattern(r"M\.?2", haystack):
        specs["form_factor"] = 'M.2'
    elif has_pattern(r'2[.,]5"|2\.5 ?pouces|2\.5"', haystack):
        specs["form_factor"] = '2.5"'
    elif has_pattern(r'3[.,]5"', haystack):
        specs["form_factor"] = '3.5"'
    else:
        specs["form_factor"] = None

    specs["external"] = subtype == "hdd_external" or has_pattern(r"externe", haystack)

    return specs


if __name__ == "__main__":
    data = scrape_all(
        base_url=BASE_URL,
        category=CATEGORY,
        extract_specs_fn=extract_specs,
        subtype_fn=subtype_from_url,
        key_fields=("capacity_gb", "storage_type"),
    )
    save_json(data, "disques_ssd.json")
