"""
UltraPC.ma - Scraper Cartes graphiques (39-cartes-graphiques)
Sous-catégories (segment d'URL) : nvidia / amd / professionnelles

Usage:
    python ultrapc_cartes_graphiques.py
"""

import re
from ultrapc_common import scrape_all, save_json, find_int, has_pattern

BASE_URL = "https://www.ultrapc.ma/39-cartes-graphiques"
CATEGORY = "gpu"

SUBTYPE_MAP = {
    "nvidia": "nvidia",
    "amd": "amd",
    "professionnelles": "professional",
}

# Modèles de puces (le plus long/spécifique d'abord pour bien capter "Ti"/"XT"/"SUPER")
CHIP_PATTERN = r"\b(RTX|GTX|RX)\s?(\d{3,4})\s?(Ti|SUPER|XT|GRE|XTX)?\b"


def subtype_from_url(url):
    segment = url.split("ultrapc.ma/")[1].split("/")[0]
    return SUBTYPE_MAP.get(segment, segment)


def extract_specs(name, haystack, url):
    specs = {}

    if has_pattern(r"\bnvidia|geforce|rtx|gtx\b", haystack):
        specs["brand"] = "NVIDIA"
    elif has_pattern(r"\bamd|radeon|\brx\b", haystack):
        specs["brand"] = "AMD"
    else:
        specs["brand"] = None

    chip = re.search(CHIP_PATTERN, haystack, re.I)
    if chip:
        parts = [chip.group(1).upper(), chip.group(2)]
        if chip.group(3):
            parts.append(chip.group(3).upper())
        specs["chip_model"] = " ".join(parts)
    else:
        specs["chip_model"] = None

    specs["vram_gb"] = find_int(r"(\d+)\s*Go\s*GDDR", haystack) or find_int(r"(\d+)\s*GB\b", haystack)

    mem_type = re.search(r"(GDDR6X|GDDR6|GDDR5|GDDR7)", haystack, re.I)
    specs["memory_type"] = mem_type.group(1).upper() if mem_type else None

    specs["dlss"] = has_pattern(r"\bDLSS\b", haystack)
    specs["ray_tracing"] = has_pattern(r"ray\s*tracing", haystack)

    return specs


if __name__ == "__main__":
    data = scrape_all(
        base_url=BASE_URL,
        category=CATEGORY,
        extract_specs_fn=extract_specs,
        subtype_fn=subtype_from_url,
        key_fields=("vram_gb", "chip_model"),
    )
    save_json(data, "cartes_graphiques.json")
