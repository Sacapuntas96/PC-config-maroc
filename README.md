# PC-config-maroc

**Build your PC with real prices from Morocco.**

PC-config-maroc is a website that helps users build a PC config using components from the [Ultrapc.ma](https://www.ultrapc.ma) official website — browse the catalog by category, pick one part per slot, catch incompatible choices, and see the total price in dirhams (MAD).

## Features

- 🧩 **9 component categories** — processors, motherboards, graphics cards, RAM, storage (SSD & HDD), power supplies, cooling, cases, and sound cards
- 🔍 **Search** — filter any category by product name, with a live product count
- ↕️ **Sort** — order products by key specs (cores, frequency, capacity, power…) or by price, ascending or descending
- 📄 **Pagination** — 20 products per page, with a card showing the key specs of each part
- ⚠️ **Compatibility checks** — flags a mismatch between processor and motherboard socket, RAM type and motherboard memory type, cooler and processor socket, and case and motherboard format
- 🧾 **Live build summary** — one line per category with the chosen part, its price, and a link to the product page on Ultrapc.ma, plus the running total in MAD
- 💾 **Recap and export** — review the full configuration in a dialog and save it as a `.txt` file
- 📱 **Responsive layout** — a floating total bar keeps the price in view on mobile
- 🕷️ **Own data scraper** — a Python script collects in-stock products from Ultrapc.ma into JSON files

The interface is in French and all prices are in MAD.

## Tech Stack

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)

Scraper: `requests` and `BeautifulSoup`. Product data is stored as static JSON files, so the site needs no database.

## Project Structure

```
pc-config-maroc/
├── backend/
│   └── scrapper_ultra-pc.py      # Scrapes ultrapc.ma and writes the JSON files
└── Frontend/
    └── pc-config-maroc/
        ├── index.html
        ├── package.json
        └── src/
            ├── main.jsx
            ├── App.jsx            # UI, compatibility checks, build summary
            ├── App.css
            └── Data/              # Scraped products, one JSON file per category
                ├── Processor_data.json
                ├── Motherboard_data.json
                ├── GPU_data.json
                ├── RAM_data.json
                ├── SSD_&_HDD_data.json
                ├── PSU_data.json
                ├── Watercooling_data.json
                ├── Case_data.json
                └── Sound_Card_data.json
```

## Getting Started

1. Clone the repo
   ```bash
   git clone https://github.com/Sacapuntas96/PC-config-maroc.git
   cd PC-config-maroc
   ```
2. Install and run the website
   ```bash
   cd Frontend/pc-config-maroc
   npm install
   npm run dev
   ```
3. Open the local address printed in the terminal, pick a part in each category, and check the summary on the right

### Updating the product data (optional)

The `Data/` folder already holds the scraped products. To refresh it:

```bash
pip install requests beautifulsoup4
python backend/scrapper_ultra-pc.py
```

Run it from the repository root, because the script writes to `Frontend/pc-config-maroc/src/Data/`. It skips any category whose JSON file already exists, so delete a file first to scrape that category again. Only in-stock products with a price are kept.

## Disclaimer

PC-config-maroc is an independent personal project and is not affiliated with Ultrapc.ma. Prices and stock come from a snapshot of the website and may be out of date, so always confirm them on the product page before buying. The compatibility checks cover sockets, memory type, and case format only. They don't check things like power supply wattage or graphics card length, so double-check your build before ordering.
