import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
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

function App() {

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
  const [activeCategory, setActiveCategory] = useState("Processeur")
  const [price, setPrice] = useState(0)
  const fields = getFields(activeCategory)

  const [selected_processor, selectProcessor] = useState(null)
  const [selected_motherboard, selectMotherboard] = useState(null)
  const [selected_gpu, selectGpu] = useState(null)
  const [selected_ram, selectRam] = useState(null)
  const [selected_storage, selectStorage] = useState(null)
  const [selected_psu, selectPsu] = useState(null)
  const [selected_cooling, selectCooling] = useState(null)
  const [selected_case, selectCase] = useState(null)
  const [selected_soundcard, selectSoundcard] = useState(null)

  const [order, changeOrder] = useState(null)
  const [current_field, changeField] = useState(null)
  const [page_number, changePage] = useState(0)
  const [showIssues, setShowIssues] = useState(false)
  const MAX_PAGE = 20

  const selectedByCategory = {
    "Processeur":           selected_processor,
    "Carte mère":           selected_motherboard,
    "Carte graphique":      selected_gpu,
    "Mémoire RAM":          selected_ram,
    "Stockage (SSD & HDD)": selected_storage,
    "Alimentation":         selected_psu,
    "Refroidissement":      selected_cooling,
    "Boîtier":              selected_case,
    "Carte son":            selected_soundcard,
  }  

  const selectionMethods = {
    "Processeur":           selectProcessor,
    "Carte mère":           selectMotherboard,
    "Carte graphique":      selectGpu,
    "Mémoire RAM":          selectRam,
    "Stockage (SSD & HDD)": selectStorage,
    "Alimentation":         selectPsu,
    "Refroidissement":      selectCooling,
    "Boîtier":              selectCase,
    "Carte son":            selectSoundcard,
  }  

  const incompatibilities = getIncompatibilities(selectedByCategory)

  return (
    <>
      <div className='content'>
        <div className='left-panel'>
          <p className="panel-label">Composants</p>
          <div className="category-list">
            {Object.keys(dataByCategory).map(name =>(
              <div 
                key={name} 
                className={"category-item" + (name === activeCategory ? " is_active" : "")}
                onClick={() => {
                  setActiveCategory(name)
                  changeField("None")
                  changePage(0)
                  changeField(null)
                  changeOrder(null)
                }}
              >
                <span>{name}</span>
              </div>
            ))}
          </div>
        </div>
        <div className='middle-panel'>
          <h1>{dataByCategory[activeCategory].length} élément{dataByCategory[activeCategory].length << 1 ? "s" : ""} trouvé{dataByCategory[activeCategory].length << 1 ? "s" : ""} </h1>
            <div className='buttons'>
              <h3>Filter by : </h3>
                {getFields(activeCategory).map(filter =>(

                <button key={filter.label} className={'filtering-button' + (current_field === filter.label ? "-is-selected" : "")} onClick={() => {
                  if(!order){
                    changeOrder("ASC")
                  }

                  if(current_field == filter.label){
                    if(order == "ASC"){
                      changeOrder("DESC")
                    }
                    else{
                      changeOrder("ASC")
                    }
                    
                  }
                  else{
                    changeField(filter.label)
                  }
                  }}>
                  {filter.label}
                </button>
              ))}
            </div>
            <div className="card-grid">
              {(current_field === null ? dataByCategory[activeCategory] : sortByCategory(current_field, order, activeCategory, dataByCategory)).slice(page_number * MAX_PAGE, page_number * MAX_PAGE + MAX_PAGE).map((item, i) => (
                <Item_Card
                  key={item.Name + i}
                  item={item}
                  fields={fields}
                  onClick={() => {
                    if(selectedByCategory[activeCategory] == null){
                      selectionMethods[activeCategory](item)
                      setPrice(price + item.Price)
                    }
                    else if(selectedByCategory[activeCategory].ID == item.ID){
                      setPrice(price - item.Price)
                      selectionMethods[activeCategory](null)
                    }
                    else{
                      setPrice(price - selectedByCategory[activeCategory].Price + item.Price)
                      selectionMethods[activeCategory](item)
                    }
                  }}
                  selection = {selectedByCategory[activeCategory]}
                  
                  
                />
              ))}
            </div>
            {dataByCategory[activeCategory].length && (
  <div className='back-and-forth-buttons'>
    <h3>Page {page_number + 1} / {Math.abs((parseInt(dataByCategory[activeCategory].length / MAX_PAGE) - (dataByCategory[activeCategory].length / MAX_PAGE))) > 0 ? parseInt(dataByCategory[activeCategory].length / MAX_PAGE) + 1 : parseInt(dataByCategory[activeCategory].length / MAX_PAGE)}</h3>
    <button
      className='page-change'
      onClick={() => { if (page_number > 0) changePage(page_number - 1) }}
    >
      {'< Back'}
    </button>
    <button
      className='page-change'
      onClick={() => { if (page_number < ((dataByCategory[activeCategory].length / MAX_PAGE) - 1)) changePage(page_number + 1) }}
    >
      {'Forth >'}
    </button>
  </div>
)}
        </div>
        <div className='right-panel'>
          <p className="panel-label">Configuration</p>
          <div className="compat-banner">
            <span className={'compatibility-display' + (incompatibilities.length > 0 ? "-detected" : "")}>incompatibilité détectée</span>
            {incompatibilities.length > 0 && (
              <button className="compat-details-button" onClick={() => setShowIssues(!showIssues)}>
                Voir : {incompatibilities.length} incompatibilité{incompatibilities.length > 1 ? "s" : ""}
              </button>
            )}
            {showIssues && incompatibilities.length > 0 && (
              <div className="compat-issues-menu">
                {incompatibilities.map((issue, i) => (
                  <div key={i} className="compat-issue">{issue.message}</div>
                ))}
              </div>
            )}
          </div>
          <div className="summary-list">
            {Object.keys(selectedByCategory).map(component => {
              const isIncompatible = incompatibilities.some(issue => issue.categories.includes(component))
              return (
                <div key={component} className={"summary-line is_empty" + (isIncompatible ? " incompatibility" : "")}>
                  <span className="slot">{component}</span>
                  <span className="part">{selectedByCategory[component] === null ? "Aucun(e)" : selectedByCategory[component].Name}</span>
                  <span className="amount">—</span>
                </div>
              )
            })}
          </div>

          <div className="summary-total">
            <span className="label">Total</span>
            <span>
              <span className="amount">{price}</span>{" "}
              <span className="currency">MAD</span>
            </span>
          </div>
        </div>
      </div>
    </>
  )
}

function Item_Card({ item, fields, onClick, selection }) {
  
  return (
    <button className={"item_card" + ((selection != null ? selection.ID : 999999) === item.ID ? "-selected" : "")} onClick={onClick}>

      <div className="card_top">
        <h2>{item.Name}</h2>
        <span className="arrow">+</span>
      </div>

      <div className="card_stats">
        {fields.map(f => (
          <div className="stat" key={f.key}>
            <strong>{item[f.key] || "Non-Specified"}</strong>
            <span>{f.label}</span>
          </div>
        ))}
      </div>

      <div className="card_bottom">
        <span className="price">{item.Price} DH</span>
      </div>

    </button>
  )
}

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
      message: "- Le socket du processeur (" + sel["Processeur"].Socket + ") ne correspond pas à celui de la carte mère (" + sel["Carte mère"].Socket + ")",
    })
  }

  if (sel["Mémoire RAM"] && sel["Carte mère"] && sel["Mémoire RAM"]["Type de mémoire"] !== sel["Carte mère"]["Type de mémoire"]) {
    issues.push({
      categories: ["Mémoire RAM", "Carte mère"],
      message: "- Le type de mémoire RAM (" + sel["Mémoire RAM"]["Type de mémoire"] + ") n'est pas compatible avec la carte mère (" + sel["Carte mère"]["Type de mémoire"] + ")",
    })
  }

  if (sel["Refroidissement"] && sel["Processeur"] && sel["Refroidissement"]["Support du processeur"] && !coolerSupportsSocket(sel["Refroidissement"]["Support du processeur"], sel["Processeur"].Socket)) {
    issues.push({
      categories: ["Refroidissement", "Processeur"],
      message: "- Le refroidisseur ne supporte pas le socket du processeur (" + sel["Processeur"].Socket + ")",
    })
  }

  if (sel["Boîtier"] && sel["Carte mère"] && sel["Boîtier"]["Format de carte mère"] && sel["Carte mère"].Format && !caseSupportsFormat(sel["Boîtier"]["Format de carte mère"], sel["Carte mère"].Format)) {
    issues.push({
      categories: ["Boîtier", "Carte mère"],
      message: "- Le format de la carte mère (" + sel["Carte mère"].Format + ") n'est pas compatible avec le boîtier",
    })
  }

  return issues
}

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

function sortByCategory(field_name, sorting_order, activeCategory, dataByCategory) {
  const fieldsList = getFields(activeCategory)
  const fieldObj = fieldsList.find(f => f.label === field_name)
  if (!fieldObj) return dataByCategory[activeCategory]
  const field = fieldObj.key

  const elements = [...dataByCategory[activeCategory]]
  const dir = sorting_order === "DESC" ? -1 : 1

  const toComparable = (val) => {
    if (val == null) return null
    const match = String(val).match(/-?\d+(\.\d+)?/)
    return match ? parseFloat(match[0]) : String(val).toLowerCase()
  }

  return elements.sort((a, b) => {
    const va = toComparable(a[field])
    const vb = toComparable(b[field])
    if (va == null) return 1
    if (vb == null) return -1
    if (va > vb) return dir
    if (va < vb) return -dir
    return 0
  })
}

export default App