# PC-config-maroc

A PC configurator built around real prices from Moroccan retailer [UltraPC.ma](https://www.ultrapc.ma). Pick a part in each category, see the running total in MAD, and get warned if two parts don't work together.

The project has two parts: a Python scraper that pulls the product data from UltraPC, and a React frontend that reads that data and lets you build a config.

## What it does

- Covers 9 categories: processor, motherboard, graphics card, RAM, storage (SSD and HDD), power supply, cooling, case and sound card
- Search by product name inside each category
- Sort by any of the specs shown on the cards, or by price, ascending or descending
- Results are paginated, 20 products per page
- One part per category, with the total price updated as you go
- Compatibility checks (see below)
- A recap window at the end, with a button to save your config as a `.txt` file
- Each chosen part links back to its UltraPC page
- Works on mobile, where the total sticks to the bottom of the screen

### Compatibility checks

Right now the app checks four things:

- CPU socket against motherboard socket
- RAM type (DDR4, DDR5...) against what the motherboard supports
- Cooler socket support against the CPU socket
- Motherboard format (ATX, mATX, ITX) against what the case accepts

Conflicts are flagged in the category list and explained in the sidebar. Nothing else is checked yet (PSU wattage, GPU length, etc.).

## Stack

- Python 3, `requests` and `BeautifulSoup` for the scraper
- React with Vite for the frontend, plain CSS, no UI library
- Product data stored as JSON files, no backend or database

## Project structure

```
.
├── backend/
│   └── scrapper_ultra-pc.py         # Scrapes UltraPC and writes the JSON files
└── Frontend/
    └── pc-config-maroc/
        ├── index.html
        ├── vite.config.js
        ├── package.json
        └── src/
            ├── main.jsx
            ├── App.jsx              # Whole UI + compatibility logic
            ├── App.css
            ├── index.css
            └── Data/
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

## Running it

### 1. Scrape the data

The JSON files are not in the repo (they're in `.gitignore`), so you need to run the scraper once before the frontend will build.

```bash
pip install requests beautifulsoup4
python backend/scrapper_ultra-pc.py
```

Run it from the root of the repo, not from inside `backend/`, since the output paths are relative. The script asks whether to empty all the data files first:

- `y` wipes everything and scrapes every category again
- `n` keeps the files that already have data and only scrapes the empty ones

For each product it opens the product page to get the full title and the spec sheet. Products that are out of stock, have no price, or have a very short spec sheet (fewer than 8 fields) are skipped. This makes a lot of requests, so a full run takes a while.

### 2. Start the frontend

```bash
cd Frontend/pc-config-maroc
npm install
npm run dev
```

## Things to know

- Prices are a snapshot from the last time you ran the scraper. They are not live, so re-run it to refresh them.
- The scraper depends on UltraPC's current HTML. If they change their layout, it will break.
- Spec names come straight from the site (in French), which is why the field keys in `App.jsx` look the way they do.
- This is a personal project. It isn't affiliated with UltraPC, and you should check a part's availability and price on their site before buying.