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

  const [current_filter, selectFilter] = useState("Coeurs")
  const [order, changeOrder] = useState(null)

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
                  selectFilter("None")
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

                <button key={filter.label} className={'filtering-button' + (current_filter === filter.label ? "-is-selected" : "")} onClick={() => selectFilter(filter.label)}>{filter.label}</button>
              ))}
            </div>
            <div className="card-grid">
              {dataByCategory[activeCategory].map((item, i) => (
                <Item_Card
                  key={item.Name + i}
                  item={item}
                  fields={fields}
                  onClick={() => {
                    if(selectedByCategory[activeCategory] == null){
                      selectionMethods[activeCategory](item)
                      setPrice(price + item.Price)
                    }
                    else if(selectedByCategory[activeCategory].Name == item.Name){
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
        </div>
        <div className='right-panel'>
          <p className="panel-label">Configuration</p>
          <div className="compat-banner">
            <span>incompatibilité détectée</span>
          </div>
          <div className="summary-list">
            {Object.keys(selectedByCategory).map(component => (
              <div key={component} className="summary-line is_empty">
                <span className="slot">{component}</span>
                <span className="part">{selectedByCategory[component] === null ? "Aucun(e)" : selectedByCategory[component].Name}</span>
                <span className="amount">—</span>
              </div>
            ))}
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
    <button className={"item_card" + ((selection != null ? selection.Name : "") === item.Name ? "-selected" : "")} onClick={onClick}>

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
        { label: "Chipset", key: "Chipset" },
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

export default App