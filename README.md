# PC-config-maroc
PC-config-maroc is a website that helps users build a PC config using components from the Ultrapc.ma official website
a# TeeOne

**Count your carbs. Dose with confidence.**

TeeOne is a lightweight web app for people managing type 1 diabetes — search a food database, build a meal, track total carbs against a daily goal, and calculate the insulin units to inject, all in a fast, theme-aware interface.

## Features

- 🔍 **Food search** — instantly search a database of 600+ foods by name, with a live result count
- 🍽️ **Meal builder** — add foods to a cart, adjust the weight (in grams) per item, and see the carb total update live
- 📊 **Progress bar** — visual, color-coded progress (red → yellow → green) toward your daily carb goal
- 💉 **Insulin calculator** — computes units to inject from total carbs, your insulin-to-carb ratio, and any extra correction units
- ⚠️ **Guardrails** — warns when adding a food already in the cart, and when calculating with an invalid dosage
- ✨ **Animated totals** — smooth number-counting animation whenever the carb total or result changes
- 🌗 **Light / Dark theme** — theme preference is saved and persisted across visits via `localStorage`

## Tech Stack

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

No framework

## Project Structure

```
TeeOne/
├── html/
│   └── index.html          # App markup (search, cart, dosage inputs, results)
├── script/
│   ├── main.js              # App logic (cart, progress bar, insulin calc, theming)
│   └── food.js               # Food database (name + carbs per 100g)
├── style/
│   └── style.css
└── images/
    ├── logo.svg
    ├── theme_icon.svg
    └── theme_icon_light_button.svg
```

## Getting Started

1. Clone the repo
   ```bash
   git clone https://github.com/your-username/TeeOne.git
   ```
2. Open `html/index.html` in your browser (or serve the folder with a local server, e.g. `npx serve`)
3. Search for foods, add them to your list, set your goal and dosage, and calculate

## Disclaimer

TeeOne is a personal tracking tool, not a medical device. It is not a substitute for professional medical advice — always confirm insulin dosing with your healthcare provider.
