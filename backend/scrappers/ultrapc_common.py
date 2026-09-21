"""
ultrapc_common.py
------------------
Logique commune à tous les scrapers UltraPC.ma.

Toutes les pages catégories du site (processeurs, cartes mères, GPU,
RAM, stockage, alimentations, boîtiers, refroidissement, cartes son...)
utilisent la MEME grille PrestaShop (".product-miniature"), donc toute
la mécanique de pagination / fetch / parsing générique est factorisée
ici. Chaque scraper de composant n'a qu'à fournir :

  - une fonction extract_specs(name, haystack, url) -> dict
    qui retourne les caractéristiques propres à ce composant
  - éventuellement une fonction subtype_from_url(url) -> str
    quand la catégorie mélange plusieurs sous-types (ex: refroidissement)
  - la liste des champs "clés" qui, si absents, déclenchent un fetch
    de la fiche produit complète pour aller chercher la description
    longue (la description courte affichée dans la grille est parfois
    tronquée ou générique).

Usage typique dans un script de composant :

    from ultrapc_common import scrape_all, save_json

    if __name__ == "__main__":
        data = scrape_all(
            base_url="https://www.ultrapc.ma/21-processeurs",
            category="cpu",
            extract_specs_fn=extract_specs,
            key_fields=("socket", "cores"),
        )
        save_json(data, "processeurs.json")
"""

import re
import time
import json
import requests
from bs4 import BeautifulSoup

HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; PCConfigBot/1.0)"}

# Sélecteurs essayés dans l'ordre pour récupérer la description longue
# sur la fiche produit (varie légèrement selon les thèmes PrestaShop).
DESCRIPTION_SELECTORS = [
    "#description",
    ".product-description",
    ".product-description-full",
    "#idTab1",
    ".tab-pane#description",
]


def fetch_full_description(url, session):
    """Va chercher la fiche produit et renvoie sa description complète
    (texte brut, non tronqué). Retourne '' si rien n'a pu être extrait."""
    try:
        resp = session.get(url, headers=HEADERS, timeout=8)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")

        for selector in DESCRIPTION_SELECTORS:
            block = soup.select_one(selector)
            if block and block.get_text(strip=True):
                return block.get_text(" ", strip=True)

        meta = soup.find("meta", attrs={"name": "description"})
        if meta and meta.get("content"):
            return meta["content"]

        og = soup.find("meta", attrs={"property": "og:description"})
        if og and og.get("content"):
            return og["content"]

    except requests.RequestException as e:
        print(f"    (fetch failed: {e})", flush=True)

    return ""


def parse_product(article, category, extract_specs_fn, subtype_fn=None,
                   key_fields=(), session=None, fetch_full=False):
    """Parse un <article class="product-miniature"> de la grille et
    renvoie un dict avec les infos communes + les specs du composant."""
    name_tag = article.select_one(".product-title a")
    name = name_tag.get_text(strip=True)
    url = name_tag["href"]

    price_tag = article.select_one(".price")
    price = float(price_tag["content"]) if price_tag and price_tag.has_attr("content") else None

    regular_price_tag = article.select_one(".regular-price")
    regular_price = None
    if regular_price_tag:
        # Le site sépare les milliers avec différents espaces (normal,
        # insécable \xa0, insécable fine \u202f selon le navigateur/thème),
        # donc on retire tout caractère "espace" au sens Unicode plutôt
        # que de lister les variantes une par une.
        raw = re.sub(r"\s+", "", regular_price_tag.get_text())
        m = re.search(r"[\d,.]+", raw)
        if m:
            regular_price = float(m.group(0).replace(",", "."))

    avail_tag = article.select_one(".product-availability")
    availability = avail_tag.get_text(" ", strip=True) if avail_tag else None

    desc_tag = article.select_one(".product-description-short")
    desc = desc_tag.get_text(" ", strip=True) if desc_tag else ""

    subtype = subtype_fn(url) if subtype_fn else None

    haystack = f"{name} {desc}"
    specs = extract_specs_fn(name, haystack, url)

    used_full_description = False
    key_field_missing = any(specs.get(k) is None for k in key_fields)

    if fetch_full and session is not None and key_field_missing:
        full_desc = fetch_full_description(url, session)
        if full_desc:
            used_full_description = True
            full_haystack = f"{name} {full_desc}"
            full_specs = extract_specs_fn(name, full_haystack, url)
            for k, v in full_specs.items():
                if specs.get(k) is None:
                    specs[k] = v

    result = {
        "site": "UltraPC",
        "category": category,
        "name": name,
        "url": url,
        "price": price,
        "regular_price": regular_price,
        "on_sale": bool(regular_price and price and regular_price > price),
        "availability": availability,
        "used_full_description": used_full_description,
    }
    if subtype is not None:
        result["subtype"] = subtype
    result.update(specs)
    return result


def get_last_page(soup):
    pagination = soup.select_one(".pagination")
    if not pagination:
        return 1
    pages = []
    for a in pagination.select("a[href]"):
        m = re.search(r"[?&]page=(\d+)", a["href"])
        if m:
            pages.append(int(m.group(1)))
    return max(pages) if pages else 1


def scrape_page(base_url, page_num, category, extract_specs_fn, subtype_fn,
                 key_fields, session):
    url = f"{base_url}?page={page_num}"
    resp = session.get(url, headers=HEADERS, timeout=15)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")

    articles = soup.select(".product-miniature")
    products = []
    for i, a in enumerate(articles, 1):
        title_tag = a.select_one(".product-title a")
        if not title_tag:
            continue
        name_preview = title_tag.get_text(strip=True)
        print(f"  [{i}/{len(articles)}] {name_preview[:50]}", end=" ", flush=True)
        product = parse_product(
            a, category, extract_specs_fn, subtype_fn=subtype_fn,
            key_fields=key_fields, session=session, fetch_full=True,
        )
        if product["used_full_description"]:
            print("-> fetched full page", flush=True)
            time.sleep(1)
        else:
            print("-> ok", flush=True)
        products.append(product)
    return products, soup


def scrape_all(base_url, category, extract_specs_fn, subtype_fn=None,
                key_fields=(), max_pages=None, polite_delay=1.5):
    """Parcourt toutes les pages d'une catégorie et renvoie la liste
    complète des produits (avec leurs specs extraites)."""
    all_products = []
    page = 1
    last_page = 1
    session = requests.Session()

    while page <= last_page:
        products, soup = scrape_page(
            base_url, page, category, extract_specs_fn, subtype_fn,
            key_fields, session,
        )
        if not products:
            break
        all_products.extend(products)

        if page == 1:
            last_page = get_last_page(soup)
            if max_pages:
                last_page = min(last_page, max_pages)

        fetched = sum(1 for p in products if p["used_full_description"])
        print(f"Page {page}/{last_page} -> {len(products)} produits ({fetched} description(s) complète(s) récupérée(s))")
        page += 1
        time.sleep(polite_delay)

    return all_products


def save_json(data, filename):
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Saved {len(data)} produits dans {filename}")


# --- Petits helpers regex réutilisés par plusieurs scrapers -------------

def find_int(pattern, text, group=1, flags=re.I):
    m = re.search(pattern, text, flags)
    if not m:
        return None
    raw = m.group(group).replace(",", ".")
    try:
        return int(round(float(raw)))
    except ValueError:
        return None


def find_float(pattern, text, group=1, flags=re.I):
    m = re.search(pattern, text, flags)
    if not m:
        return None
    return float(m.group(group).replace(",", "."))


def has_pattern(pattern, text, flags=re.I):
    return bool(re.search(pattern, text, flags))
