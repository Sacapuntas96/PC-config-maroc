import { useEffect, useRef, useState } from "react";
import "./App.css";

const dataByCategory = {
  Processeur: "Processor",
  "Carte mère": "Motherboard",
  "Carte graphique": "GPU",
  "Mémoire RAM": "RAM",
  "Stockage (SSD & HDD)": "SSD_&_HDD",
  Alimentation: "PSU",
  Refroidissement: "Watercooling",
  Boîtier: "Case",
  "Carte son": "",
};

const category_to_fr = {
  Processeur: "Processor",
  "Carte mère": "Motherboard",
  "Carte graphique": "GPU",
  "Mémoire RAM": "RAM",
  "Stockage (SSD & HDD)": "SSD_&_HDD",
  Alimentation: "PSU",
  Refroidissement: "Watercooling",
  Boîtier: "Case",
  "Carte son": "Sound_Card",
}

const FIELDS_BY_CATEGORY = {
  Processeur: [
    { label: "Coeurs", key: "Nombre de coeurs " },
    { label: "Threads", key: "Nombre de threads" },
    { label: "Fréquence", key: "Fréquence CPU" },
    { label: "Socket", key: "Socket" },
  ],
  "Carte mère": [
    { label: "Socket", key: "Socket" },
    { label: "Slots", key: "Nombre de slots RAM" },
    { label: "Format", key: "Format" },
    { label: "Mémoire", key: "Type de mémoire" },
  ],
  "Carte graphique": [
    { label: "Marque", key: "Marque" },
    { label: "VRAM", key: "Quantité mémoire" },
    { label: "Fréq. mém.", key: "Fréquence mémoire" },
    { label: "Cœurs", key: "Unités de calcul" },
  ],
  "Mémoire RAM": [
    { label: "Type", key: "Type de mémoire" },
    { label: "Capacité", key: "Capacité totale" },
    { label: "Fréquence", key: "Fréquence(s) Mémoire" },
    { label: "Latence", key: "CAS Latency" },
  ],
  "Stockage (SSD & HDD)": [
    { label: "Capacité", key: "Capacité de disque" },
    { label: "Format", key: "Format de Disque" },
    { label: "Interface", key: "Interface" },
    { label: "Lecture", key: "Vitesse en lecture" },
  ],
  Alimentation: [
    { label: "Puissance", key: "Puissance" },
    { label: "Certification", key: "Certification" },
    { label: "Modulaire", key: "Modulaire" },
    { label: "Marque", key: "Marque" },
  ],
  Refroidissement: [
    { label: "Socket", key: "Support du processeur" },
    { label: "Ventilateurs", key: "Ventilateur(s)" },
    { label: "Matériau", key: "Matériau" },
    { label: "Marque", key: "Marque" },
  ],
  Boîtier: [
    { label: "Format", key: "Format du boitier" },
    { label: "Carte mère", key: "Format de carte mère" },
    { label: "Dimensions", key: "Dimensions (L x H x P)" },
    { label: "Ventilateurs", key: "Nombre de ventilateurs fournis" },
  ],
  "Carte son": [],
};

const CATEGORY_NAMES = Object.keys(dataByCategory);

const INITIAL_SELECTION = {};
for (const name of CATEGORY_NAMES) {
  INITIAL_SELECTION[name] = null;
}

const PAGE_SIZE = 20;

const formatMAD = (n) => Math.round(n).toLocaleString("fr-FR");

const formatPlain = (n) => formatMAD(n).replace(/[\u202f\u00a0]/g, " ");

const formatDate = (date) =>
  date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

function getTotal(selection) {
  let total = 0;
  for (const category of CATEGORY_NAMES) {
    const part = selection[category];
    if (part) {
      total += Number(part.price) || 0;
    }
  }
  return total;
}

function countSelected(selection) {
  let count = 0;
  for (const category of CATEGORY_NAMES) {
    if (selection[category]) {
      count += 1;
    }
  }
  return count;
}

function hasConflict(issues, category) {
  return issues.some((issue) => issue.categories.includes(category));
}

function getSortValue(value) {
  if (!value) return null;
  const number = parseFloat(value);
  if (isNaN(number)) {
    return String(value).toLowerCase();
  }
  return number;
}

function sortItems(items, key, order) {
  const direction = order === "ASC" ? 1 : -1;

  return [...items].sort((a, b) => {
    const valueA = getSortValue(a[key]);
    const valueB = getSortValue(b[key]);

    if (valueA === null && valueB === null) return 0;
    if (valueA === null) return 1;
    if (valueB === null) return -1;

    if (typeof valueA === "number" && typeof valueB === "number") {
      return (valueA - valueB) * direction;
    }
    return String(valueA).localeCompare(String(valueB)) * direction;
  });
}

function coolerSupportsSocket(coolerText, cpuSocket) {
  const words = cpuSocket.trim().split(" ");
  const socketName = words[words.length - 1].toUpperCase();
  const cleanCoolerText = coolerText.replace(/\s/g, "").toUpperCase();
  return cleanCoolerText.includes(socketName);
}

function cleanFormat(text) {
  const clean = text.toUpperCase().replace(/[^A-Z]/g, "");
  if (clean === "MATX") return "MICROATX";
  if (clean === "ITX") return "MINIITX";
  return clean;
}

function caseSupportsFormat(caseFormats, motherboardFormat) {
  const supportedFormats = caseFormats.split(/[,/]| et /i).map(cleanFormat);
  return supportedFormats.includes(cleanFormat(motherboardFormat));
}

function getIncompatibilities(selection) {
  const issues = [];

  const cpu = selection["Processeur"];
  const motherboard = selection["Carte mère"];
  const ram = selection["Mémoire RAM"];
  const cooler = selection["Refroidissement"];
  const pcCase = selection["Boîtier"];

  if (cpu && motherboard && cpu.Socket !== motherboard.Socket) {
    issues.push({
      categories: ["Processeur", "Carte mère"],
      message: `Le socket du processeur (${cpu.Socket}) ne correspond pas à celui de la carte mère (${motherboard.Socket})`,
    });
  }

  if (
    ram &&
    motherboard &&
    ram["Type de mémoire"] !== motherboard["Type de mémoire"]
  ) {
    issues.push({
      categories: ["Mémoire RAM", "Carte mère"],
      message: `Le type de mémoire RAM (${ram["Type de mémoire"]}) n'est pas compatible avec la carte mère (${motherboard["Type de mémoire"]})`,
    });
  }

  if (
    cooler &&
    cpu &&
    cooler["Support du processeur"] &&
    !coolerSupportsSocket(cooler["Support du processeur"], cpu.Socket)
  ) {
    issues.push({
      categories: ["Refroidissement", "Processeur"],
      message: `Le refroidisseur ne supporte pas le socket du processeur (${cpu.Socket})`,
    });
  }

  if (
    pcCase &&
    motherboard &&
    pcCase["Format de carte mère"] &&
    motherboard.Format &&
    !caseSupportsFormat(pcCase["Format de carte mère"], motherboard.Format)
  ) {
    issues.push({
      categories: ["Boîtier", "Carte mère"],
      message: `Le format de la carte mère (${motherboard.Format}) n'est pas compatible avec le boîtier`,
    });
  }

  return issues;
}

function buildRecapText(selection, issues, total, date) {
  const rule = "-".repeat(48);
  const lines = [
    "CONFIGURATION PC",
    rule,
    `Date : ${formatDate(date)}`,
    `Composants choisis : ${countSelected(selection)} sur ${CATEGORY_NAMES.length}`,
    "",
  ];

  for (const category of CATEGORY_NAMES) {
    const part = selection[category];
    lines.push(category);
    if (part) {
      lines.push(`  ${part.name}`);
      lines.push(`  Prix : ${formatPlain(part.price)} MAD`);
      if (part.URL) lines.push(`  Lien : ${part.URL}`);
    } else {
      lines.push("  Non choisi");
    }
    lines.push("");
  }

  lines.push(rule, `TOTAL : ${formatPlain(total)} MAD`);

  if (issues.length > 0) {
    lines.push("", "Incompatibilités détectées :");
    for (const issue of issues) {
      lines.push(`- ${issue.message}`);
    }
  }

  return lines.join("\r\n") + "\r\n";
}

function downloadTextFile(text, filename) {
  const blob = new Blob(["\uFEFF" + text], {
    type: "text/plain;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function App() {
  const [activeCategory, setActiveCategory] = useState("Processeur");
  const [selectedByCategory, setSelectedByCategory] =
    useState(INITIAL_SELECTION);
  const [sortKey, setSortKey] = useState(null);
  const [order, setOrder] = useState("ASC");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [showIssues, setShowIssues] = useState(false);
  const [showRecap, setShowRecap] = useState(false);

  const fields = FIELDS_BY_CATEGORY[activeCategory];
  const sortOptions = [...fields, { label: "Prix", key: "Price" }];
  const incompatibilities = getIncompatibilities(selectedByCategory);
  const total = getTotal(selectedByCategory);
  const selectedCount = countSelected(selectedByCategory);
  const activeSelection = selectedByCategory[activeCategory];

  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(`/api/products?category=${encodeURIComponent(category_to_fr[activeCategory])}`)
      .then(res => res.json())
      .then(data => setProducts(data));
  }, [activeCategory]);

  let results = products;
  products.map(item => {
    Object.keys(JSON.parse(item.specs)).map(element =>{
    })
  })

  const search = query.trim().toLowerCase();
  if (search) {
    results = results.filter((item) =>
      String(item.name).toLowerCase().includes(search),
    );
  }

  if (sortKey) {
    results = sortItems(results, sortKey, order);
  }

  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const pageItems = results.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [page, activeCategory]);

  function handleSelectCategory(name) {
    setActiveCategory(name);
    setSortKey(null);
    setOrder("ASC");
    setQuery("");
    setPage(0);
  }

  function handleSortClick(key) {
    if (sortKey === key) {
      setOrder(order === "ASC" ? "DESC" : "ASC");
    } else {
      setSortKey(key);
      setOrder("ASC");
    }
    setPage(0);
  }

  function handleQuery(value) {
    setQuery(value);
    setPage(0);
  }

  function handleSelectItem(item) {
    const current = selectedByCategory[activeCategory];
    const isAlreadySelected = current !== null && current.id === item.id;

    setSelectedByCategory({
      ...selectedByCategory,
      [activeCategory]: isAlreadySelected ? null : item,
    });
  }

  function removeItem(category) {
    setSelectedByCategory({ ...selectedByCategory, [category]: null });
  }

  function resetBuild() {
    setSelectedByCategory(INITIAL_SELECTION);
    setShowIssues(false);
  }

  return (
    <div className="app">
      <nav className="rail" aria-label="Catégories">
        <div className="brand">
          <span className="brand-name">Configurateur PC</span>
          <span className="brand-sub">Prix en dirhams (MAD)</span>
        </div>
        <ul className="rail-list">
          {CATEGORY_NAMES.map((name) => {
            const chosen = selectedByCategory[name];
            const conflict = hasConflict(incompatibilities, name);
            return (
              <li key={name}>
                <button
                  className={
                    "rail-item" + (name === activeCategory ? " is-active" : "")
                  }
                  aria-current={name === activeCategory ? "true" : undefined}
                  onClick={() => handleSelectCategory(name)}
                >
                  <span className="rail-name">{name}</span>
                  {conflict ? (
                    <span
                      className="rail-flag is-conflict"
                      title="Incompatibilité"
                    >
                      !
                    </span>
                  ) : (
                    chosen && (
                      <span className="rail-flag is-done" title="Choisi">
                        <CheckIcon />
                      </span>
                    )
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="catalog">
        <header className="catalog-head">
          <h1>{activeCategory}</h1>
          <p className="count">
            {results.length} produit{results.length > 1 ? "s" : ""}
          </p>
        </header>

        <div className="toolbar">
          <label className="search">
            <SearchIcon />
            <input
              type="search"
              value={query}
              placeholder={"Rechercher dans « " + activeCategory + " »"}
              onChange={(e) => handleQuery(e.target.value)}
            />
          </label>

          <div className="sort" role="group" aria-label="Trier par">
            <span className="sort-label">Trier par</span>
            {sortOptions.map((option) => {
              const on = sortKey === option.key;
              return (
                <button
                  key={option.key}
                  className={"chip" + (on ? " is-on" : "")}
                  aria-pressed={on}
                  onClick={() => handleSortClick(option.key)}
                >
                  {option.label}
                  {on && (
                    <span
                      className="chip-dir"
                      aria-label={order === "ASC" ? "croissant" : "décroissant"}
                    >
                      {order === "ASC" ? "↑" : "↓"}
                    </span>
                  )}
                </button>
              );
            })}
            <button className="chip" onClick={() => setSortKey(null)}>
              Clear
            </button>
          </div>
        </div>

        {pageItems.length === 0 ? (
          <div className="empty">
            {query !== "" ? (
              <>
                <p>Aucun produit ne correspond à « {query} ».</p>
                <button className="btn-ghost" onClick={() => handleQuery("")}>
                  Effacer la recherche
                </button>
              </>
            ) : (
              <p>Aucun produit disponible.</p>
            )}
          </div>
        ) : (
          <div className="card-grid">
            {pageItems.map((item, i) => (
              <ItemCard 
                key={(item.id ?? item.name) + "-" + i}
                item={item}
                fields={JSON.parse(item.specs)}
                isSelected={
                  activeSelection !== null && activeSelection.id === item.id
                }
                onClick={() => handleSelectItem(item)}
              />
            ))}
          </div>
        )}

        {results.length > PAGE_SIZE && (
          <nav className="pager" aria-label="Pagination">
            <button
              className="btn-ghost"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              ← Précédent
            </button>
            <span className="pager-info">
              Page {page + 1} sur {pageCount}
            </span>
            <button
              className="btn-ghost"
              disabled={page >= pageCount - 1}
              onClick={() => setPage(page + 1)}
            >
              Suivant →
            </button>
          </nav>
        )}
      </div>

      <aside className="build" id="configuration" aria-label="Configuration">
        <header className="build-head">
          <h2>Ma configuration</h2>
          <p>
            {selectedCount} sur {CATEGORY_NAMES.length} composants
          </p>
        </header>

        <div
          className={
            "status" + (incompatibilities.length > 0 ? " is-bad" : " is-ok")
          }
        >
          {incompatibilities.length === 0 ? (
            <p className="status-text">Aucune incompatibilité détectée</p>
          ) : (
            <>
              <button
                className="status-toggle"
                aria-expanded={showIssues}
                onClick={() => setShowIssues(!showIssues)}
              >
                <span>
                  {incompatibilities.length} incompatibilité
                  {incompatibilities.length > 1 ? "s" : ""} détectée
                  {incompatibilities.length > 1 ? "s" : ""}
                </span>
                <span className="status-caret">
                  {showIssues ? "Masquer" : "Voir"}
                </span>
              </button>
              {showIssues && (
                <ul className="status-issues">
                  {incompatibilities.map((issue, i) => (
                    <li key={i}>{issue.message}</li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>

        <ul className="build-list">
          {CATEGORY_NAMES.map((category) => {
            const part = selectedByCategory[category];
            const conflict = hasConflict(incompatibilities, category);
            return (
              <li
                key={category}
                className={
                  "line" +
                  (part ? "" : " is-empty") +
                  (conflict ? " is-conflict" : "")
                }
              >
                <button
                  className="line-main"
                  onClick={() => handleSelectCategory(category)}
                >
                  <span className="line-slot">{category}</span>
                  <span className="line-part">
                    {part ? part.name : "Aucun(e)"}
                  </span>
                  {part && (
                    <a target="_blank" href={part.url}>
                      <button className="link-redirect">Lien</button>
                    </a>
                  )}
                </button>
                {part && (
                  <div className="line-side">
                    <span className="line-price">
                      {formatMAD(part.price)}MAD
                    </span>
                    <button
                      className="line-remove"
                      aria-label={"Retirer " + category}
                      onClick={() => removeItem(category)}
                    >
                      <CloseIcon />
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        <footer className="build-total">
          <div className="total-row">
            <div>
              <span className="total-label">Total</span>
              <span className="total-value">
                {formatMAD(total)} <span className="total-cur">MAD</span>
              </span>
            </div>
            {selectedCount > 0 && (
              <button className="btn-reset" onClick={resetBuild}>
                Tout retirer
              </button>
            )}
          </div>
          <button
            className="btn-finish"
            disabled={selectedCount === 0}
            onClick={() => setShowRecap(true)}
          >
            Terminer la configuration
          </button>
        </footer>
      </aside>

      <a className="mobile-total" href="#configuration">
        <span>
          {selectedCount}/{CATEGORY_NAMES.length} composants
        </span>
        <strong>{formatMAD(total)} MAD</strong>
      </a>

      <RecapDialog
        open={showRecap}
        onClose={() => setShowRecap(false)}
        selection={selectedByCategory}
        incompatibilities={incompatibilities}
        total={total}
        selectedCount={selectedCount}
      />
    </div>
  );
}

function RecapDialog({
  open,
  onClose,
  selection,
  incompatibilities,
  total,
  selectedCount,
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const today = new Date();

  function handleSave() {
    const text = buildRecapText(selection, incompatibilities, total, today);
    const filename =
      "configuration-pc-" + today.toLocaleDateString("sv-SE") + ".txt";
    downloadTextFile(text, filename);
  }

  return (
    <dialog
      ref={dialogRef}
      className="recap"
      aria-labelledby="recap-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <header className="recap-head">
        <div>
          <h2 id="recap-title">Récapitulatif de ma configuration</h2>
          <p>
            {formatDate(today)} · {selectedCount} sur {CATEGORY_NAMES.length}{" "}
            composants
          </p>
        </div>
        <button className="recap-close" aria-label="Fermer" onClick={onClose}>
          <CloseIcon />
        </button>
      </header>

      <div className="recap-body">
        {incompatibilities.length > 0 && (
          <div className="recap-warning" role="alert">
            <strong>
              {incompatibilities.length} incompatibilité
              {incompatibilities.length > 1 ? "s" : ""} à corriger
            </strong>
            <ul>
              {incompatibilities.map((issue, i) => (
                <li key={i}>{issue.message}</li>
              ))}
            </ul>
          </div>
        )}

        <ul className="recap-list">
          {CATEGORY_NAMES.map((category) => {
            const part = selection[category];
            const conflict = hasConflict(incompatibilities, category);
            return (
              <li
                key={category}
                className={
                  "recap-line" +
                  (part ? "" : " is-empty") +
                  (conflict ? " is-conflict" : "")
                }
              >
                <span className="recap-slot">{category}</span>
                <span className="recap-part">
                  {part ? part.name : "Non choisi"}
                </span>
                <span className="recap-price">
                  {part ? formatMAD(part.price) + " MAD" : ""}
                </span>
              </li>
            );
          })}
        </ul>

        <div className="recap-total">
          <span>Total</span>
          <strong>
            {formatMAD(total)} <small>MAD</small>
          </strong>
        </div>
      </div>

      <footer className="recap-actions">
        <button className="btn-ghost" onClick={onClose}>
          Modifier
        </button>
        <button className="btn-save" onClick={handleSave}>
          <DownloadIcon /> Enregistrer en .txt
        </button>
      </footer>
    </dialog>
  );
}

function ItemCard({ item, fields, isSelected, onClick }) {
  return (
    <button
      className={"card" + (isSelected ? " is-selected" : "")}
      aria-pressed={isSelected}
      onClick={onClick}
    >
      <h2 className="card-name">{item.name}</h2>

      <dl className="card-specs">
        {Object.entries(fields).map((element) => {
          return (
            <div className="spec" key={element[0]}>
              <dt>{element[0]}</dt>
              <dd className={element[1] ? "" : "is-missing"}>
                {element[1] || "Non spécifié"}
              </dd>
            </div>
          );
        })}
      </dl>

      <div className="card-foot">
        <span className="card-price">
          {formatMAD(item.price)} <span className="card-cur">MAD</span>
        </span>
        <span className="card-action">
          {isSelected ? (
            <>
              <CheckIcon /> Choisi
            </>
          ) : (
            "Ajouter"
          )}
        </span>
      </div>
    </button>
  );
}

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 8.5l3.2 3L13 4.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 4l8 8M12 4l-8 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8 2v8M4.5 7L8 10.5 11.5 7M3 13.5h10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M10.5 10.5L14 14"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default App;