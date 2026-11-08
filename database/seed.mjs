import fs from "node:fs";

const DATA_DIR = "../frontend/pc-config-maroc/src/Data";

const FILES = {
  Processor: "Processor_data.json",
  Motherboard: "Motherboard_data.json",
  Watercooling: "Watercooling_data.json",
  GPU: "GPU_data.json",
  RAM: "RAM_data.json",
  "SSD_&_HDD": "SSD_&_HDD_data.json",
  PSU: "PSU_data.json",
  Case: "Case_data.json",
  Sound_Card: "Sound_Card_data.json",
};

const SPEC_SOURCES = {
  Processor: {
    Coeurs: "Nombre de coeurs ",
    Threads: "Nombre de threads",
    "Fréquence": "Fréquence CPU",
    Socket: "Socket",
  },
  Motherboard: {
    Socket: "Socket",
    Slots: "Nombre de slots RAM",
    Format: "Format",
    "Mémoire": "Type de mémoire",
  },
  GPU: {
    Marque: "Marque",
    VRAM: "Quantité mémoire",
    "Fréq. mém.": "Fréquence mémoire",
    "Cœurs": "Unités de calcul",
  },
  RAM: {
    Type: "Type de mémoire",
    "Capacité": "Capacité totale",
    "Fréquence": "Fréquence(s) Mémoire",
    Latence: "CAS Latency",
  },
  "SSD_&_HDD": {
    "Capacité": "Capacité de disque",
    Format: "Format de Disque",
    Interface: "Interface",
    Lecture: "Vitesse en lecture",
  },
  PSU: {
    Puissance: "Puissance",
    Certification: "Certification",
    Modulaire: "Modulaire",
    Marque: "Marque",
  },
  Watercooling: {
    Socket: "Support du processeur",
    Ventilateurs: "Ventilateur(s)",
    "Matériau": "Matériau",
    "Éclairage RGB ": "Éclairage RGB",
  },
  Case: {
    Format: "Format du boitier",
    "Carte mère": "Format de carte mère",
    Dimensions: "Dimensions (L x H x P)",
    Ventilateurs: "Nombre de ventilateurs fournis",
  },
  Sound_Card: {},
};

const esc = (value) => String(value ?? "").replace(/'/g, "''");

const lines = [
  "DROP TABLE IF EXISTS product;",
  "CREATE TABLE product (id INTEGER PRIMARY KEY AUTOINCREMENT, category TEXT NOT NULL, name TEXT NOT NULL, price REAL, specs TEXT NOT NULL, url TEXT NOT NULL);",
  "CREATE INDEX idx_product_category ON product(category);",
];

for (const [category, file] of Object.entries(FILES)) {
  const items = JSON.parse(fs.readFileSync(`${DATA_DIR}/${file}`, "utf8"));
  const sources = SPEC_SOURCES[category];

  for (const item of items) {
    const specs = {};
    for (const [specName, jsonKey] of Object.entries(sources)) {
      specs[specName] = item[jsonKey];
    }

    const price = Number(item.Price) || "NULL";

    lines.push(
      `INSERT INTO product (category, name, price, url, specs) VALUES ('${esc(category)}', '${esc(item.Name)}', ${price}, '${esc(item.URL)}', '${esc(JSON.stringify(specs))}');`
    );
  }
}

fs.writeFileSync("products.sql", lines.join("\n"));
console.log("products.sql written:", lines.length - 3, "products");