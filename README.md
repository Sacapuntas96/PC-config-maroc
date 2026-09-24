# Configurateur PC

**Choisissez vos pièces. On vérifie la compatibilité.**

Configurateur PC est une application web pour composer un ordinateur de bureau pièce par pièce — processeur, carte mère, GPU, RAM, stockage, alimentation, refroidissement et boîtier — avec des prix en dirhams (MAD) et une détection automatique des incompatibilités, le tout dans une interface sombre et épurée.

## Features

- 🗂️ **9 catégories de composants** — Processeur, Carte mère, Carte graphique, Mémoire RAM, Stockage (SSD & HDD), Alimentation, Refroidissement, Boîtier, Carte son
- 🔍 **Recherche & tri** — recherche par nom dans chaque catégorie, tri croissant/décroissant sur n'importe quel champ (specs ou prix)
- ⚠️ **Détection d'incompatibilités** — vérifie en temps réel le socket CPU/carte mère, le type de RAM, le support de refroidissement et le format carte mère/boîtier, avec messages d'erreur détaillés
- 🧾 **Panneau de configuration en direct** — liste des pièces choisies, prix ligne par ligne, total automatique, lien direct vers chaque produit
- 📋 **Récapitulatif exportable** — génère une fiche de configuration et permet de l'enregistrer en fichier `.txt`
- 📄 **Pagination** — navigation par pages de 20 produits pour garder le catalogue lisible
- 📱 **Responsive** — barre de total fixe sur mobile, renvoyant vers le panneau de configuration

## Tech Stack

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JSON](https://img.shields.io/badge/JSON-000000?style=for-the-badge&logo=json&logoColor=white)

## Project Structure

```
configurateur-pc/
├── src/
│   ├── App.jsx            # Logique principale (catalogue, sélection, compatibilité, récapitulatif)
│   ├── App.css             # Thème, layout et styles des composants
│   └── Data/
│       ├── Processor_data.json
│       ├── Motherboard_data.json
│       ├── GPU_data.json
│       ├── RAM_data.json
│       ├── SSD_&_HDD_data.json
│       ├── PSU_data.json
│       ├── Watercooling_data.json
│       ├── Case_data.json
│       └── Sound_Card_data.json
└── index.html
```

## Compatibilité vérifiée

| Composants | Règle |
|---|---|
| Processeur ↔ Carte mère | Le socket du CPU doit correspondre à celui de la carte mère |
| Mémoire RAM ↔ Carte mère | Le type de mémoire (DDR4/DDR5) doit correspondre |
| Refroidissement ↔ Processeur | Le support du refroidisseur doit inclure le socket du CPU |
| Boîtier ↔ Carte mère | Le format de la carte mère doit être supporté par le boîtier |

## Getting Started

1. Clonez le dépôt
   ```bash
   git clone https://github.com/your-username/configurateur-pc.git
   ```
2. Installez les dépendances
   ```bash
   npm install
   ```
3. Lancez le serveur de développement
   ```bash
   npm run dev
   ```
