import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

import caseData from "./Data/Case_data.json"
import gpuData from "./Data/GPU_data.json"
import motherboardData from "./Data/Motherboard_data.json"
import processorData from "./Data/Processor_data.json"
import psuData from "./Data/PSU_data.json"
import ramData from "./Data/RAM_data.json"
import soundCardData from "./Data/Sound_Card_data.json"
import ssdHddData from "./Data/SSD_&_HDD_data.json"
import watercoolingData from "./Data/Watercooling_data.json"

const dataByCategory = {
  "Processeur": processorData,
  "Carte mère": motherboardData,
  "Carte graphique": gpuData,
  "Mémoire RAM": ramData,
  "Stockage (SSD & HDD)": ssdHddData,
  "Alimentation": psuData,
  "Refroidissement": watercoolingData,
  "Boîtier": caseData,
  "Carte son": soundCardData,
}

const CATEGORY_NAMES = Object.keys(dataByCategory)

const INITIAL_SELECTION = CATEGORY_NAMES.reduce((acc, name) => {
  acc[name] = null
  return acc
}, {})

const PAGE_SIZE = 20

const formatMAD = (n) => Math.round(n).toLocaleString("fr-FR")

/* ---------- App ---------- */

function App() {
  const [activeCategory, setActiveCategory] = useState("Processeur")
  const [selectedByCategory, setSelectedByCategory] = useState(INITIAL_SELECTION)

  const [sortField, setSortField] = useState(null)   // a label from sortOptions
  const [order, setOrder] = useState("ASC")
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(0)
  const [showIssues, setShowIssues] = useState(false)
  const [showRecap, setShowRecap] = useState(false)

  const fields = useMemo(() => getFields(activeCategory), [activeCategory])
  const sortOptions = useMemo(() => [...fields, { label: "Prix", key: "Price" }], [fields])

  const incompatibilities = useMemo(
    () => getIncompatibilities(selectedByCategory),
    [selectedByCategory]
  )

  // Derived from the selection, so it can never drift out of sync.
  const total = useMemo(
    () => Object.values(selectedByCategory).reduce((sum, item) => sum + (item ? Number(item.Price) || 0 : 0), 0),
    [selectedByCategory]
  )
  const selectedCount = Object.values(selectedByCategory).filter(Boolean).length

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = dataByCategory[activeCategory]
    if (q) list = list.filter(item => String(item.Name).toLowerCase().includes(q))
    const sortKey = sortOptions.find(o => o.label === sortField)?.key
    return sortKey ? sortItems(list, sortKey, order) : list
  }, [activeCategory, query, sortField, order, sortOptions])

  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE))
  const pageItems = results.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const activeSelection = selectedByCategory[activeCategory]

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [page, activeCategory])

  function handleSelectCategory(name) {
    setActiveCategory(name)
    setSortField(null)
    setOrder("ASC")
    setQuery("")
    setPage(0)
  }

  function handleSortClick(label) {
    if (sortField === label) {
      setOrder(order === "ASC" ? "DESC" : "ASC")
    } else {
      setSortField(label)
      setOrder("ASC")
    }
    setPage(0)
  }

  function handleQuery(value) {
    setQuery(value)
    setPage(0)
  }

  function handleSelectItem(item) {
    setSelectedByCategory(prev => {
      const current = prev[activeCategory]
      return { ...prev, [activeCategory]: current && current.ID === item.ID ? null : item }
    })
  }

  function removeItem(category) {
    setSelectedByCategory(prev => ({ ...prev, [category]: null }))
  }

  function resetBuild() {
    setSelectedByCategory(INITIAL_SELECTION)
    setShowIssues(false)
  }

  return (
    <div className="app">
      {/* ---------- Categories ---------- */}
      <nav className="rail" aria-label="Catégories">
        <div className="brand">
          <span className="brand-name">Configurateur PC</span>
          <span className="brand-sub">Prix en dirhams (MAD)</span>
        </div>
        <ul className="rail-list">
          {CATEGORY_NAMES.map(name => {
            const chosen = selectedByCategory[name]
            const conflict = incompatibilities.some(i => i.categories.includes(name))
            return (
              <li key={name}>
                <button
                  className={"rail-item" + (name === activeCategory ? " is-active" : "")}
                  aria-current={name === activeCategory ? "true" : undefined}
                  onClick={() => handleSelectCategory(name)}
                >
                  <span className="rail-name">{name}</span>
                  {conflict
                    ? <span className="rail-flag is-conflict" title="Incompatibilité">!</span>
                    : chosen && <span className="rail-flag is-done" title="Choisi"><CheckIcon /></span>}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* ---------- Catalogue ---------- */}
      <main className="catalog">
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
              onChange={e => handleQuery(e.target.value)}
            />
          </label>

          <div className="sort" role="group" aria-label="Trier par">
            <span className="sort-label">Trier par</span>
            {sortOptions.map(opt => {
              const on = sortField === opt.label
              return (
                <button
                  key={opt.label}
                  className={"chip" + (on ? " is-on" : "")}
                  aria-pressed={on}
                  onClick={() => handleSortClick(opt.label)}
                >
                  {opt.label}
                  {on && <span className="chip-dir" aria-label={order === "ASC" ? "croissant" : "décroissant"}>{order === "ASC" ? "↑" : "↓"}</span>}
                </button>
              )
            })}
          </div>
        </div>

        {pageItems.length === 0 ? (
          <div className="empty">
            <p>Aucun produit ne correspond à « {query} ».</p>
            <button className="btn-ghost" onClick={() => handleQuery("")}>Effacer la recherche</button>
          </div>
        ) : (
          <div className="card-grid">
            {pageItems.map((item, i) => (
              <ItemCard
                key={(item.ID ?? item.Name) + "-" + i}
                item={item}
                fields={fields}
                isSelected={activeSelection != null && activeSelection.ID === item.ID}
                onClick={() => handleSelectItem(item)}
              />
            ))}
          </div>
        )}

        {results.length > PAGE_SIZE && (
          <nav className="pager" aria-label="Pagination">
            <button className="btn-ghost" disabled={page === 0} onClick={() => setPage(page - 1)}>
              ← Précédent
            </button>
            <span className="pager-info">Page {page + 1} sur {pageCount}</span>
            <button className="btn-ghost" disabled={page >= pageCount - 1} onClick={() => setPage(page + 1)}>
              Suivant →
            </button>
          </nav>
        )}
      </main>

      {/* ---------- Configuration ---------- */}
      <aside className="build" id="configuration" aria-label="Configuration">
        <header className="build-head">
          <h2>Ma configuration</h2>
          <p>{selectedCount} sur {CATEGORY_NAMES.length} composants</p>
        </header>

        <div className={"status" + (incompatibilities.length > 0 ? " is-bad" : " is-ok")}>
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
                  {incompatibilities.length} incompatibilité{incompatibilities.length > 1 ? "s" : ""} détectée{incompatibilities.length > 1 ? "s" : ""}
                </span>
                <span className="status-caret">{showIssues ? "Masquer" : "Voir"}</span>
              </button>
              {showIssues && (
                <ul className="status-issues">
                  {incompatibilities.map((issue, i) => <li key={i}>{issue.message}</li>)}
                </ul>
              )}
            </>
          )}
        </div>

        <ul className="build-list">
          {CATEGORY_NAMES.map(category => {
            const part = selectedByCategory[category]
            const conflict = incompatibilities.some(i => i.categories.includes(category))
            return (
              <li key={category} className={"line" + (part ? "" : " is-empty") + (conflict ? " is-conflict" : "")}>
                <button className="line-main" onClick={() => handleSelectCategory(category)}>
                  <span className="line-slot">{category}</span>
                  <span className="line-part">{part ? part.Name : "Aucun(e)"}</span>
                  {(part &&
                    <a target="_blank" href={part.URL}><button className='link-redirect'>Lien</button></a>
          )}
                </button>
                {part && (
                  <div className="line-side">
                    <span className="line-price">{formatMAD(part.Price)}</span>
                    <button className="line-remove" aria-label={"Retirer " + category} onClick={() => removeItem(category)}>
                      <CloseIcon />
                    </button>
                  </div>
                )}
              </li>
            )
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
              <button className="btn-reset" onClick={resetBuild}>Tout retirer</button>
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

      {/* Small screens: the panel sits below the catalogue, this bar links to it */}
      <a className="mobile-total" href="#configuration">
        <span>{selectedCount}/{CATEGORY_NAMES.length} composants</span>
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
  )
}

/* ---------- Recap dialog ---------- */

function RecapDialog({ open, onClose, selection, incompatibilities, total, selectedCount }) {
  const ref = useRef(null)

  // The native <dialog> handles focus trapping and the Escape key for us.
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  const today = new Date()
  const dateLabel = today.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })

  function handleSave() {
    const text = buildRecapText(selection, incompatibilities, total, today)
    downloadTextFile(text, "configuration-pc-" + today.toLocaleDateString("sv-SE") + ".txt")
  }

  return (
    <dialog
      ref={ref}
      className="recap"
      aria-labelledby="recap-title"
      onClose={onClose}
      onClick={e => { if (e.target === ref.current) onClose() }}   // click on the backdrop
    >
      <header className="recap-head">
        <div>
          <h2 id="recap-title">Récapitulatif de ma configuration</h2>
          <p>{dateLabel} · {selectedCount} sur {CATEGORY_NAMES.length} composants</p>
        </div>
        <button className="recap-close" aria-label="Fermer" onClick={onClose}>
          <CloseIcon />
        </button>
      </header>

      <div className="recap-body">
        {incompatibilities.length > 0 && (
          <div className="recap-warning" role="alert">
            <strong>
              {incompatibilities.length} incompatibilité{incompatibilities.length > 1 ? "s" : ""} à corriger
            </strong>
            <ul>
              {incompatibilities.map((issue, i) => <li key={i}>{issue.message}</li>)}
            </ul>
          </div>
        )}

        <ul className="recap-list">
          {CATEGORY_NAMES.map(category => {
            const part = selection[category]
            const conflict = incompatibilities.some(i => i.categories.includes(category))
            return (
              <li key={category} className={"recap-line" + (part ? "" : " is-empty") + (conflict ? " is-conflict" : "")}>
                <span className="recap-slot">{category}</span>
                <span className="recap-part">{part ? part.Name : "Non choisi"}</span>
                <span className="recap-price">{part ? formatMAD(part.Price) + " MAD" : ""}</span>
              </li>
            )
          })}
        </ul>

        <div className="recap-total">
          <span>Total</span>
          <strong>{formatMAD(total)} <small>MAD</small></strong>
        </div>
      </div>

      <footer className="recap-actions">
        <button className="btn-ghost" onClick={onClose}>Modifier</button>
        <button className="btn-save" onClick={handleSave}>
          <DownloadIcon /> Enregistrer en .txt
        </button>
      </footer>
    </dialog>
  )
}

// Plain-text version of the recap, for the downloaded file.
function buildRecapText(selection, issues, total, date) {
  const rule = "-".repeat(48)
  const count = Object.values(selection).filter(Boolean).length
  const lines = [
    "CONFIGURATION PC",
    rule,
    "Date : " + date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
    "Composants choisis : " + count + " sur " + CATEGORY_NAMES.length,
    "",
  ]

  CATEGORY_NAMES.forEach(category => {
    const part = selection[category]
    lines.push(category)
    if (part) {
      lines.push("  " + part.Name)
      lines.push("  Prix : " + formatPlain(part.Price) + " MAD")
      if (part.URL) lines.push("  Lien : " + part.URL)
    } else {
      lines.push("  Non choisi")
    }
    lines.push("")
  })

  lines.push(rule, "TOTAL : " + formatPlain(total) + " MAD")

  if (issues.length > 0) {
    lines.push("", "Incompatibilités détectées :")
    issues.forEach(issue => lines.push("- " + issue.message))
  }

  return lines.join("\r\n") + "\r\n"
}

// fr-FR formatting uses narrow no-break spaces, which some text editors show as odd characters.
const formatPlain = (n) => formatMAD(n).replace(/[\u202f\u00a0]/g, " ")

function downloadTextFile(text, filename) {
  // The BOM makes Windows Notepad read the accents as UTF-8.
  const blob = new Blob(["\uFEFF" + text], { type: "text/plain;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

/* ---------- Card ---------- */

function ItemCard({ item, fields, isSelected, onClick }) {
  return (
    <button
      className={"card" + (isSelected ? " is-selected" : "")}
      aria-pressed={isSelected}
      onClick={onClick}
    >
      <h2 className="card-name">{item.Name}</h2>

      <dl className="card-specs">
        {fields.map(f => {
          const value = item[f.key]
          return (
            <div className="spec" key={f.key}>
              <dt>{f.label}</dt>
              <dd className={value ? "" : "is-missing"}>{value || "Non spécifié"}</dd>
            </div>
          )
        })}
      </dl>

      <div className="card-foot">
        <span className="card-price">
          {formatMAD(item.Price)} <span className="card-cur">MAD</span>
        </span>
        <span className="card-action">
          {isSelected ? <><CheckIcon /> Choisi</> : "Ajouter"}
        </span>
      </div>
    </button>
  )
}

/* ---------- Icons ---------- */

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8.5l3.2 3L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 2v8M4.5 7L8 10.5 11.5 7M3 13.5h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

/* ---------- Compatibility ---------- */

function socketToken(socket) {
  const parts = socket.trim().split(" ")
  return parts[parts.length - 1].toUpperCase()
}

function coolerSupportsSocket(coolerText, cpuSocket) {
  const token = socketToken(cpuSocket)
  return coolerText.replace(/\s/g, "").toUpperCase().includes(token)
}

function normFormat(str) {
  const n = str.toUpperCase().replace(/[^A-Z]/g, "")
  if (n === "MATX") return "MICROATX"
  if (n === "ITX") return "MINIITX"
  return n
}

function caseSupportsFormat(caseFormatText, moboFormat) {
  const list = caseFormatText.split(/[,/]| et /i).map(s => normFormat(s.trim())).filter(Boolean)
  return list.includes(normFormat(moboFormat))
}

function getIncompatibilities(sel) {
  const issues = []

  if (sel["Processeur"] && sel["Carte mère"] && sel["Processeur"].Socket !== sel["Carte mère"].Socket) {
    issues.push({
      categories: ["Processeur", "Carte mère"],
      message: "Le socket du processeur (" + sel["Processeur"].Socket + ") ne correspond pas à celui de la carte mère (" + sel["Carte mère"].Socket + ")",
    })
  }

  if (sel["Mémoire RAM"] && sel["Carte mère"] && sel["Mémoire RAM"]["Type de mémoire"] !== sel["Carte mère"]["Type de mémoire"]) {
    issues.push({
      categories: ["Mémoire RAM", "Carte mère"],
      message: "Le type de mémoire RAM (" + sel["Mémoire RAM"]["Type de mémoire"] + ") n'est pas compatible avec la carte mère (" + sel["Carte mère"]["Type de mémoire"] + ")",
    })
  }

  if (sel["Refroidissement"] && sel["Processeur"] && sel["Refroidissement"]["Support du processeur"] && !coolerSupportsSocket(sel["Refroidissement"]["Support du processeur"], sel["Processeur"].Socket)) {
    issues.push({
      categories: ["Refroidissement", "Processeur"],
      message: "Le refroidisseur ne supporte pas le socket du processeur (" + sel["Processeur"].Socket + ")",
    })
  }

  if (sel["Boîtier"] && sel["Carte mère"] && sel["Boîtier"]["Format de carte mère"] && sel["Carte mère"].Format && !caseSupportsFormat(sel["Boîtier"]["Format de carte mère"], sel["Carte mère"].Format)) {
    issues.push({
      categories: ["Boîtier", "Carte mère"],
      message: "Le format de la carte mère (" + sel["Carte mère"].Format + ") n'est pas compatible avec le boîtier",
    })
  }

  return issues
}

/* ---------- Fields & sorting ---------- */

function getFields(category) {
  switch (category) {
    case "Processeur":
      return [
        { label: "Coeurs",    key: "Nombre de coeurs " },   // trailing space is in the JSON
        { label: "Threads",   key: "Nombre de threads" },
        { label: "Fréquence", key: "Fréquence CPU" },
        { label: "Socket",    key: "Socket" },
      ]
    case "Carte mère":
      return [
        { label: "Socket",  key: "Socket" },
        { label: "Slots",   key: "Nombre de slots RAM" },
        { label: "Format",  key: "Format" },
        { label: "Mémoire", key: "Type de mémoire" },
      ]
    case "Carte graphique":
      return [
        { label: "Puce",        key: "Puce graphique" },
        { label: "VRAM",        key: "Quantité mémoire" },
        { label: "Fréq. mém.",  key: "Fréquence mémoire" },
        { label: "Cœurs",       key: "Unités de calcul" },
      ]
    case "Mémoire RAM":
      return [
        { label: "Type",      key: "Type de mémoire" },
        { label: "Capacité",  key: "Capacité totale" },
        { label: "Fréquence", key: "Fréquence(s) Mémoire" },
        { label: "Latence",   key: "CAS Latency" },
      ]
    case "Stockage (SSD & HDD)":
      return [
        { label: "Capacité",  key: "Capacité de disque" },
        { label: "Format",    key: "Format de Disque" },
        { label: "Interface", key: "Interface" },
        { label: "Lecture",   key: "Vitesse en lecture" },
      ]
    case "Alimentation":
      return [
        { label: "Puissance",     key: "Puissance" },
        { label: "Certification", key: "Certification" },
        { label: "Modulaire",     key: "Modulaire" },
        { label: "Marque",        key: "Marque" },
      ]
    case "Refroidissement":
      return [
        { label: "Socket",       key: "Support du processeur" },
        { label: "Ventilateurs", key: "Ventilateur(s)" },
        { label: "Matériau",     key: "Matériau" },
        { label: "Marque",       key: "Marque" },
      ]
    case "Boîtier":
      return [
        { label: "Format",       key: "Format du boitier" },        // "boitier" has no accent in the JSON
        { label: "Carte mère",   key: "Format de carte mère" },
        { label: "Dimensions",   key: "Dimensions (L x H x P)" },
        { label: "Ventilateurs", key: "Nombre de ventilateurs fournis" },
      ]
    default:
      return []
  }
}

function sortItems(items, key, sortingOrder) {
  const dir = sortingOrder === "DESC" ? -1 : 1

  const toComparable = (val) => {
    if (val == null || val === "") return null
    const match = String(val).match(/-?\d+(\.\d+)?/)
    return match ? parseFloat(match[0]) : String(val).toLowerCase()
  }

  return [...items].sort((a, b) => {
    const va = toComparable(a[key])
    const vb = toComparable(b[key])
    if (va == null && vb == null) return 0
    if (va == null) return 1      // missing values always go last
    if (vb == null) return -1
    if (typeof va === "number" && typeof vb === "number") return (va - vb) * dir
    return String(va).localeCompare(String(vb)) * dir
  })
}

export default App