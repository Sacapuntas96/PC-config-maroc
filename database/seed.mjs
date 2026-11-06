import fs from "node:fs";
import Database from "better-sqlite3";

const CATEGORIES = {
  "Processor": "src/Data/Processor_data.json",
  "Motherboard": "src/Data/Motherboard_data.json",
  "Watercooling": "src/Data/Watercooling_data.json",
  "GPU": "src/Data/GPU_data.json",
  "RAM": "src/Data/RAM_data.json",
  "SSD_&_HDD": "src/Data/SSD_&_HDD_data.json",
  "PSU": "src/Data/PSU_data.json",
  "Case": "src/Data/Case_data.json",
  "Sound_Card": "src/Data/Sound_Card_data.json"
};

const CATEGORY_TO_FR = {
  "Processor":   "Processeur",
  "Motherboard": "Carte mère",
  "Watercooling":"Refroidissement",
  "GPU":         "Carte graphique",
  "RAM":         "Mémoire RAM",
  "SSD_&_HDD":   "Stockage (SSD & HDD)",
  "PSU":         "Alimentation",
  "Case":        "Boîtier",
  "Sound_Card":  null
};

function reformat(text){
    text.replace(/'/g, "''");
    return text;
}



const db = new Database("products.db")



db.exec(`
  CREATE TABLE IF NOT EXISTS product (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    name     TEXT NOT NULL,
    price    REAL,
    specs    TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_proiduct_category ON product(category);
`);

const insertion = db.prepare(
    "INSERT INTO product (category, name, price, specs) VALUES (@category, @name, @price, @specs)"
);

const insertAll = db.transaction(() => {
    for(const category of Object.keys(CATEGORIES)){
        for(const item of JSON.parse(fs.readFileSync(CATEGORIES[category], "utf8"))){
            const name = item.Name;
            const price = item.Price;
            const specs = (() => {
            switch (CATEGORY_TO_FR[category]) {
                case "Processeur":
                return {
                    "Coeurs": item["Nombre de coeurs "],
                    "Threads": item["Nombre de threads"],
                    "Fréquence": item["Fréquence CPU"],
                    "Socket": item["Socket"],
                };

                case "Carte mère":
                return {
                    "Socket": item["Socket"],
                    "Slots": item["Nombre de slots RAM"],
                    "Format": item["Format"],
                    "Mémoire": item["Type de mémoire"],
                };

                case "Carte graphique":
                return {
                    "Marque": item["Marque"],
                    "VRAM": item["Quantité mémoire"],
                    "Fréq. mém.": item["Fréquence mémoire"],
                    "Cœurs": item["Unités de calcul"],
                };

                case "Mémoire RAM":
                return {
                    "Type": item["Type de mémoire"],
                    "Capacité": item["Capacité totale"],
                    "Fréquence": item["Fréquence(s) Mémoire"],
                    "Latence": item["CAS Latency"],
                };

                case "Stockage (SSD & HDD)":
                return {
                    "Capacité": item["Capacité de disque"],
                    "Format": item["Format de Disque"],
                    "Interface": item["Interface"],
                    "Lecture": item["Vitesse en lecture"],
                };

                case "Alimentation":
                return {
                    "Puissance": item["Puissance"],
                    "Certification": item["Certification"],
                    "Modulaire": item["Modulaire"],
                    "Marque": item["Marque"],
                };

                case "Refroidissement":
                return {
                    "Socket": item["Support du processeur"],
                    "Ventilateurs": item["Ventilateur(s)"],
                    "Matériau": item["Matériau"],
                    "Marque": item["Marque"],
                };

                case "Boîtier":
                return {
                    "Format": item["Format du boitier"],
                    "Carte mère": item["Format de carte mère"],
                    "Dimensions": item["Dimensions (L x H x P)"],
                    "Ventilateurs": item["Nombre de ventilateurs fournis"],
                };

                default:
                return {};
            }
            })();

            insertion.run({category, name, price, specs : JSON.stringify(specs)});   
        }
    }
})

insertAll.immediate()

db.close()