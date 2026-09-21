"""
UltraPC.ma - Scraper Processeurs (21-processeurs)

Le segment d'URL correspond directement au socket (ex: socket-am4,
socket-1700, socket-am5, socket-1851...), donc on s'en sert pour
normaliser le socket plutot que de le deviner depuis le texte.

Usage:
    python ultrapc_processeurs.py
"""

import re
from ultrapc_common import scrape_all, save_json, find_int, has_pattern

BASE_URL = "https://www.ultrapc.ma/21-processeurs"
CATEGORY = "cpu"

SOCKET_MAP = {
    "socket-1200": "LGA1200",
    "socket-1700": "LGA1700",
    "socket-1151": "LGA1151",
    "socket-1851": "LGA1851",
    "socket-am4": "AM4",
    "socket-am5": "AM5",
    "socket-amd-tr4": "TR4",
    "socket-swrx8": "sWRX8",
}


def subtype_from_url(url):
    """Ici le 'subtype' renvoyé est le socket normalisé."""
    segment = url.split("ultrapc.ma/")[1].split("/")[0]
    return SOCKET_MAP.get(segment, segment)


def extract_specs(name, haystack, url):
    specs = {}

    if re.search(r"\bamd\b", name, re.I):
        specs["brand"] = "AMD"
    elif re.search(r"\bintel\b", name, re.I):
        specs["brand"] = "Intel"
    else:
        specs["brand"] = None

    specs["socket"] = subtype_from_url(url)

    # Fréquences: "(3.4 GHz / 4.6 GHz)" = base / boost dans le nom
    m = re.search(r"\(([\d.,]+)\s*GHz\s*/\s*([\d.,]+)\s*GHz\)", name, re.I)
    if m:
        specs["base_clock_ghz"] = float(m.group(1).replace(",", "."))
        specs["boost_clock_ghz"] = float(m.group(2).replace(",", "."))
    else:
        specs["base_clock_ghz"] = None
        # Fallback: "jusqu'à 4.7 GHz" donne au moins le boost
        boost = re.search(r"jusqu'?[àa]\s*([\d.,]+)\s*GHz", haystack, re.I)
        specs["boost_clock_ghz"] = float(boost.group(1).replace(",", ".")) if boost else None

    # Coeurs / Threads: "8-Core 16-Threads" ou "10 cœurs" / "28-Threads"
    specs["cores"] = find_int(r"(\d+)\s*-?\s*[Cc]ores?\b", haystack) or find_int(r"(\d+)\s*c[oœ]urs?", haystack)
    specs["threads"] = find_int(r"(\d+)\s*-?\s*[Tt]hreads?\b", haystack)

    specs["cache_mb"] = find_int(r"(?:GameCache|Cache)\s*(\d+)\s*Mo", haystack)
    specs["tdp_w"] = find_int(r"TDP\s*(\d+)\s*W", haystack)

    if has_pattern(r"\btray\b", haystack):
        specs["packaging"] = "Tray"
    elif has_pattern(r"\bbox\b|bo[iî]te", haystack):
        specs["packaging"] = "Box"
    else:
        specs["packaging"] = None

    if has_pattern(r"sans graphique int[ée]gr[ée]", haystack):
        specs["integrated_graphics"] = False
    elif has_pattern(r"graphique int[ée]gr[ée]", haystack):
        specs["integrated_graphics"] = True
    else:
        specs["integrated_graphics"] = None

    return specs


if __name__ == "__main__":
    data = scrape_all(
        base_url=BASE_URL,
        category=CATEGORY,
        extract_specs_fn=extract_specs,
        subtype_fn=None,  # socket déjà inclus dans specs["socket"]
        key_fields=("cores", "threads", "tdp_w"),
    )
    save_json(data, "processeurs.json")
