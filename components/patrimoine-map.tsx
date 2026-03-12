"use client"

import { useEffect, useRef, useState } from "react"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import { Search, Map as MapIcon, Layers, ChevronDown, Menu, X } from "lucide-react"
import { feature } from "topojson-client"
import { PatrimoineModal } from "./patrimoine-modal"
import { Button } from "./ui/button"

export type PatrimoineGroup = "cultural" | "tourist" | "immaterial"

export interface PatrimoineSite {
  id: string
  name: string
  name_ht?: string
  name_en?: string
  description: string
  description_ht?: string
  description_en?: string
  coordinates: [number, number]
  imageUrl: string
  has360: boolean
  panoramaUrl?: string
  category: "fortress" | "church" | "palace" | "monument" | "natural" | "festival" | "craft"
  group: PatrimoineGroup
}

const patrimoineSites: PatrimoineSite[] = [
  {
    id: "citadelle",
    name: "Citadelle Laferrière",
    name_ht: "Sitadèl Laferyè",
    name_en: "Citadel Laferrière",
    description:
      "La Citadelle Laferrière est une grande forteresse située au sommet de la montagne Bonnet à l'Évêque. Symbole de la liberté haïtienne.",
    description_ht: "Sitadèl Laferyè se yon gwo fò ki sou tèt mòn Bonèt alévèk. Li se yon senbòl libète pou Ayisyen.",
    description_en: "The Citadel Laferrière is a large fortress located atop the Bonnet à l'Évêque mountain. A symbol of Haitian liberty.",
    coordinates: [-72.2435, 19.5739],
    imageUrl: "https://visithaiti.com/wp-content/uploads/2025/03/citadelle-henri-jean-oscar-augustin_hero.jpg",
    has360: true,
    panoramaUrl: "https://visithaiti.com/wp-content/uploads/2025/03/citadelle-henri-jean-oscar-augustin_hero.jpg",
    category: "fortress",
    group: "cultural",
  },
  {
    id: "sans-souci",
    name: "Palais Sans-Souci",
    name_ht: "Palè Sansousi",
    name_en: "Sans-Souci Palace",
    description:
      "Le Palais Sans-Souci était la résidence royale du roi Henri Ier d'Haïti dans le Nord.",
    description_ht: "Palè Sansousi te rezidans wa Henri I nan Nò Peyi a.",
    description_en: "The Sans-Souci Palace was the royal residence of King Henry I of Haiti in the North.",
    coordinates: [-72.2217, 19.6061],
    imageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    has360: true,
    panoramaUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80",
    category: "palace",
    group: "cultural",
  },
  {
    id: "bassin-bleu",
    name: "Bassin Bleu",
    name_ht: "Basen Ble",
    name_en: "Bassin Bleu",
    description: "Série de bassins naturels aux couleurs émeraude près de Jacmel.",
    description_ht: "Yon seri basen natirèl ak koulè ble toupre Jakmèl.",
    description_en: "A series of natural basins with emerald colors near Jacmel.",
    coordinates: [-72.35, 19.65],
    imageUrl: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=800&q=80",
    has360: true,
    panoramaUrl: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1600&q=80",
    category: "natural",
    group: "tourist",
  },
  {
    id: "rara",
    name: "Rara de Léogâne",
    name_ht: "Rara Leyogan",
    name_en: "Rara of Leogane",
    description: "Manifestation culturelle et musicale traditionnelle haïtienne.",
    description_ht: "Yon gwo fèt kiltirèl ak mizik tradisyonèl ayisyen.",
    description_en: "A traditional Haitian cultural and musical festival.",
    coordinates: [-72.6333, 18.5109],
    imageUrl: "/images/festivals/rara.webp",
    has360: false,
    category: "festival",
    group: "immaterial",
  },
  {
    id: "kanaval-jacmel",
    name: "Kanaval de Jacmel",
    name_ht: "Kanaval Jakmèl",
    name_en: "Jacmel Carnival",
    description: "Célèbre carnaval reconnu pour ses masques en papier-mâché et son artisanat exceptionnel.",
    description_ht: "Gwo fèt kanaval ki selèb pou bèl mas an papye-mache ak tout atizay li yo.",
    description_en: "Famous carnival known for its papier-mâché masks and exceptional craftsmanship.",
    coordinates: [-72.5393, 18.2404],
    imageUrl: "/images/festivals/carnaval.webp",
    has360: false,
    category: "festival",
    group: "immaterial",
  },
  {
    id: "gede",
    name: "Fête Gede",
    name_ht: "Fèt Gede",
    name_en: "Gede Festival",
    description: "Célébration spirituelle honorant les ancêtres et les esprits des morts (Gede).",
    description_ht: "Yon gwo selebrasyon espirityèl pou onore zansèt yo ak lespri mò yo (Gede).",
    description_en: "A spiritual celebration honoring ancestors and the spirits of the dead (Gede).",
    coordinates: [-72.3333, 18.5333],
    imageUrl: "/images/festivals/gede.webp",
    has360: false,
    category: "festival",
    group: "immaterial",
  }
]

const translations = {
  fr: {
    title: "Patrimoine d'Haïti",
    subtitle: "Explorez les trésors historiques et naturels",
    searchPlaceholder: "Rechercher une ville, un lieu...",
    all: "Tous",
    cultural: "Patrimoine Culturel",
    tourist: "Patrimoine Touristique",
    immaterial: "Patrimoine Immatériel",
    satellite: "Satellite",
    streets: "Rues",
    showBoundaries: "Frontières",
    noResults: "Aucun résultat trouvé",
  },
  ht: {
    title: "Patrimwàn Ayiti",
    subtitle: "Dekouvri tout bèl kote istorik ak natirèl yo",
    searchPlaceholder: "Chache yon lavil, yon kote...",
    all: "Tout",
    cultural: "Patrimwàn Kiltirèl",
    tourist: "Patrimwàn Touristik",
    immaterial: "Patrimwàn Imateryèl",
    satellite: "Satelit",
    streets: "Ri",
    showBoundaries: "Fwontyè",
    noResults: "Nou pa jwenn anyen",
  },
  en: {
    title: "Haiti Heritage",
    subtitle: "Explore historical and natural treasures",
    searchPlaceholder: "Search for a city, a place...",
    all: "All",
    cultural: "Cultural Heritage",
    tourist: "Tourist Heritage",
    immaterial: "Immaterial Heritage",
    satellite: "Satellite",
    streets: "Streets",
    showBoundaries: "Boundaries",
    noResults: "No results found",
  }
}

const categoryColors: Record<string, string> = {
  fortress: "#B45309",
  church: "#7C3AED",
  palace: "#DC2626",
  monument: "#059669",
  natural: "#0891B2",
  festival: "#DB2777",
  craft: "#EA580C",
}

const categoryLabels: Record<string, { fr: string, ht: string, en: string }> = {
  fortress: { fr: "Forteresse", ht: "Fò", en: "Fortress" },
  church: { fr: "Église", ht: "Legliz", en: "Church" },
  palace: { fr: "Palais", ht: "Palè", en: "Palace" },
  monument: { fr: "Monument", ht: "Moniman", en: "Monument" },
  natural: { fr: "Site Naturel", ht: "Sit Natirèl", en: "Natural Site" },
  festival: { fr: "Festival", ht: "Fèt", en: "Festival" },
  craft: { fr: "Artisanat", ht: "Atizana", en: "Crafts" },
}

const groups = ["cultural", "tourist", "immaterial"] as PatrimoineGroup[]
const groupLabels: Record<PatrimoineGroup, { fr: string, ht: string, en: string }> = {
  cultural: { fr: "Patrimoine Culturel", ht: "Patrimwàn Kiltirèl", en: "Cultural Heritage" },
  tourist: { fr: "Patrimoine Touristique", ht: "Patrimwàn Touristik", en: "Tourist Heritage" },
  immaterial: { fr: "Patrimoine Immatériel", ht: "Patrimwàn Imateryèl", en: "Immaterial Heritage" },
}


const geoLocations: Record<string, { coords: [number, number], zoom: number }> = {
  "nord": { coords: [-72.25, 19.6], zoom: 10 },
  "nord-est": { coords: [-71.85, 19.45], zoom: 10 },
  "nord-ouest": { coords: [-72.9, 19.85], zoom: 10 },
  "artibonite": { coords: [-72.4, 19.2], zoom: 9 },
  "centre": { coords: [-72.05, 19.05], zoom: 9 },
  "ouest": { coords: [-72.3, 18.55], zoom: 9 },
  "sud": { coords: [-73.7, 18.25], zoom: 9 },
  "sud-est": { coords: [-72.45, 18.25], zoom: 9 },
  "nippes": { coords: [-73.5, 18.45], zoom: 10 },
  "grand'anse": { coords: [-74.2, 18.6], zoom: 10 },
  "port-au-prince": { coords: [-72.3333, 18.5333], zoom: 12 },
  "cap-haitien": { coords: [-72.2, 19.75], zoom: 13 },
  "jacmel": { coords: [-72.5333, 18.2333], zoom: 13 },
  "les cayes": { coords: [-73.75, 18.1833], zoom: 13 },
  "gonaives": { coords: [-72.6833, 19.45], zoom: 13 },
}

export function PatrimoineMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<Record<string, maplibregl.Marker>>({})
  const [selectedSite, setSelectedSite] = useState<PatrimoineSite | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | "all">("all")
  const [mapStyle, setMapStyle] = useState<"streets" | "satellite">("streets")
  const [showBoundaries, setShowBoundaries] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [language, setLanguage] = useState<"fr" | "ht" | "en">("fr")
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const t = translations[language]

  // Autocomplete Logic
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.length < 2) {
        setSuggestions([])
        return
      }

      try {
        // Local search in heritage sites and geo-locations
        const query = searchQuery.toLowerCase().trim()
        const localMatches = [
          ...patrimoineSites
            .filter(s => s.name.toLowerCase().includes(query) || (s.name_ht?.toLowerCase().includes(query) ?? false))
            .map(s => ({ id: s.id, name: s.name, type: "site", coordinates: s.coordinates, data: s })),
          ...Object.entries(geoLocations)
            .filter(([k]) => k.includes(query))
            .map(([k, v]) => ({ id: k, name: k.charAt(0).toUpperCase() + k.slice(1), type: "location", coordinates: v.coords, zoom: v.zoom }))
        ]

        // Remote search using Jawg Places
        const response = await fetch(
          `https://api.jawg.io/places/v1/autocomplete?text=${encodeURIComponent(searchQuery)}&access-token=${process.env.NEXT_PUBLIC_JAWG_ACCESS_TOKEN}&boundary.country=HTI&size=5`
        )
        const data = await response.json()
        const remoteMatches = data.features?.map((f: any) => ({
          id: f.properties.id,
          name: f.properties.label,
          type: "address",
          coordinates: f.geometry.coordinates,
        })) || []

        setSuggestions([...localMatches, ...remoteMatches])
      } catch (error) {
        console.error("Autocomplete error:", error)
      }
    }

    const timeoutId = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const map = new maplibregl.Map({
      container: mapRef.current,
      style: `https://api.jawg.io/styles/jawg-${mapStyle === "satellite" ? "sunny" : "streets"}.json?access-token=${process.env.NEXT_PUBLIC_JAWG_ACCESS_TOKEN}`,
      center: [-72.22, 19.65],
      zoom: 10,
      attributionControl: false,
    })

    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-left")
    map.addControl(new maplibregl.NavigationControl(), "bottom-right")

    map.on("style.load", () => {
      // Add Esri World Imagery Source
      if (!map.getSource("esri-satellite")) {
        map.addSource("esri-satellite", {
          type: "raster",
          tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
          tileSize: 256,
          maxzoom: 19,
          attribution: "Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
        })
      }

      // Add Satellite Layer (hidden initially or based on current style)
      if (!map.getLayer("esri-satellite-layer")) {
        // Try to find a good spot to insert: before the first label or water layer
        const layers = map.getStyle().layers
        let firstLabelId = ""
        for (const layer of layers) {
          if (layer.type === "symbol" || layer.id.includes("label") || layer.id.includes("place")) {
            firstLabelId = layer.id
            break
          }
        }

        map.addLayer(
          {
            id: "esri-satellite-layer",
            type: "raster",
            source: "esri-satellite",
            layout: {
              visibility: mapStyle === "satellite" ? "visible" : "none"
            },
            paint: {
              "raster-opacity": 1
            }
          },
          firstLabelId || undefined
        )
      }

      renderMarkers(map)
      loadBoundaries(map)
    })

    mapInstanceRef.current = map

    return () => {
      Object.values(markersRef.current).forEach(m => m.remove())
      markersRef.current = {}
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  const loadBoundaries = (map: maplibregl.Map) => {
    // 1. Departments (ADM1) - High visibility amber (Local Data)
    fetch("/data/hti-adm1.topojson")
      .then(res => res.json())
      .then(topology => {
        // Convert TopoJSON to GeoJSON
        const data = feature(topology, topology.objects['hti-adm1']) as any;
        if (!map.getSource("haiti-adm1")) {
          map.addSource("haiti-adm1", { type: "geojson", data })
          
          // Outer glow for extreme visibility
          map.addLayer({
            id: "haiti-adm1-glow",
            type: "line",
            source: "haiti-adm1",
            paint: {
              "line-color": "#000000",
              "line-width": 5,
              "line-opacity": 0.4
            },
            layout: {
              "visibility": showBoundaries ? "visible" : "none"
            }
          })

          map.addLayer({
            id: "haiti-adm1-line",
            type: "line",
            source: "haiti-adm1",
            paint: {
              "line-color": "#fbbf24", // Amber-400
              "line-width": 3,
              "line-opacity": 0.9
            },
            layout: {
              "visibility": showBoundaries ? "visible" : "none"
            }
          })
        }
      })
      .catch(err => console.error("Could not load ADM1 boundaries:", err))

    // 2. Communes (ADM2) - Clean white lines (Local Data)
    fetch("/data/hti-adm2.topojson")
      .then(res => res.json())
      .then(topology => {
        // Convert TopoJSON to GeoJSON
        const data = feature(topology, topology.objects['hti-adm2']) as any;
        if (!map.getSource("haiti-adm2")) {
          map.addSource("haiti-adm2", { type: "geojson", data })
          map.addLayer({
            id: "haiti-adm2-line",
            type: "line",
            source: "haiti-adm2",
            paint: {
              "line-color": "#ffffff",
              "line-width": 1.5,
              "line-opacity": 0.7
            },
            layout: {
              "visibility": showBoundaries ? "visible" : "none"
            }
          })
        }
      })
      .catch(err => console.error("Could not load ADM2 boundaries:", err))
  }

  // Handle Style Change (Simplified: just toggle layer visibility)
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    if (map.getLayer("esri-satellite-layer")) {
      map.setLayoutProperty("esri-satellite-layer", "visibility", mapStyle === "satellite" ? "visible" : "none")
      
      // Also hide 'background' and 'landuse' layers to see the satellite imagery
      const backgroundLayers = ["background", "land", "landuse", "park", "glacier"]
      backgroundLayers.forEach(id => {
        const layer = map.getLayer(id)
        if (layer) {
          map.setPaintProperty(id, `${layer.type}-opacity`, mapStyle === "satellite" ? 0 : 1)
        }
      })
    }
  }, [mapStyle])

  // Handle Boundary Visibility Toggle
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    const layers = ["haiti-adm1-glow", "haiti-adm1-line", "haiti-adm2-line"]
    layers.forEach(layerId => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, "visibility", showBoundaries ? "visible" : "none")
      }
    })
  }, [showBoundaries])

  const renderMarkers = (map: maplibregl.Map) => {
    // Clear existing
    Object.values(markersRef.current).forEach(m => m.remove())
    markersRef.current = {}

    patrimoineSites.forEach((site) => {
      const el = document.createElement("div")
      el.className = "custom-marker"
      el.innerHTML = `
        <div style="
          width: 40px; height: 40px;
          background: ${categoryColors[site.category]};
          border: 3px solid white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: transform 0.2s ease;
        ">
          <div style="transform: rotate(45deg); color: white; font-size: 16px;">
            ${getCategoryEmoji(site.category)}
          </div>
        </div>
      `

      const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat(site.coordinates as [number, number])
        .addTo(map)

      el.addEventListener("click", () => {
        setSelectedSite(site)
        setIsModalOpen(true)
      })

      markersRef.current[site.id] = marker
    })
  }

  // Update marker visibility
  useEffect(() => {
    patrimoineSites.forEach((site) => {
      const marker = markersRef.current[site.id]
      if (!marker) return
      const el = marker.getElement()
      const matchesCategory = activeCategory === "all" || site.category === activeCategory
      const matchesSearch = searchQuery === "" || 
        site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (site.name_ht?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)

      if (matchesCategory && matchesSearch) {
        el.style.display = "block"
      } else {
        el.style.display = "none"
      }
    })
  }, [activeCategory, searchQuery])

  const flyToSite = (site: PatrimoineSite) => {
    mapInstanceRef.current?.flyTo({
      center: site.coordinates as [number, number],
      zoom: 14,
      duration: 1500,
    })
  }

  const selectSuggestion = (suggestion: any) => {
    if (!mapInstanceRef.current) return

    setSearchQuery(suggestion.name)
    setSuggestions([])
    setShowSuggestions(false)

    if (suggestion.type === "site") {
      setSelectedSite(suggestion.data)
      setIsModalOpen(true)
      flyToSite(suggestion.data)
    } else {
      // For addresses and regions, we fly to the coordinates and adjust zoom
      const zoom = suggestion.zoom || (suggestion.type === "location" ? 11 : 15)
      
      mapInstanceRef.current.flyTo({
        center: suggestion.coordinates as [number, number],
        zoom: zoom,
        duration: 2000,
        essential: true
      })
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (suggestions.length > 0) {
      selectSuggestion(suggestions[0])
    }
  }


  const filteredSites = patrimoineSites.filter(site => {
    const matchesCategory = activeCategory === "all" || site.category === activeCategory
    const matchesSearch = searchQuery === "" || 
      site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (site.name_ht?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (site.name_en?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    return matchesCategory && matchesSearch
  })

  return (
    <div className="relative h-full w-full font-sans">
      <div ref={mapRef} className="h-full w-full" />

      {/* Header & Search */}
      <div className="absolute left-0 right-0 top-0 z-10 bg-linear-to-b from-background/95 via-background/80 to-transparent px-4 py-4 backdrop-blur-sm sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                {t.title}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t.subtitle}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 md:w-80">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setShowSuggestions(true)
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => {
                      // Small delay to allow onMouseDown to fire on desktop, 
                      // but preventDefault on mousedown is the main fix.
                      setTimeout(() => setShowSuggestions(false), 200)
                    }}
                    className="w-full rounded-full border border-border bg-background/50 py-2.5 pl-9 pr-4 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </form>

                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full mt-2 w-full overflow-hidden rounded-2xl border border-border bg-background/95 shadow-xl backdrop-blur-md z-50">
                    {suggestions.map((s, i) => (
                      <button
                        key={`${s.id}-${i}`}
                        onMouseDown={(e) => {
                          e.preventDefault() // Prevent focus loss from hiding the menu before selection
                          selectSuggestion(s)
                        }}
                        className="flex w-full items-center gap-3 px-4 py-3 leading-tight text-left hover:bg-muted transition-colors border-b border-border/50 last:border-0"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted/50 text-muted-foreground">
                          {s.type === "site" ? <MapIcon className="h-4 w-4" /> : <Search className="h-4 w-4" />}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-foreground">{s.name}</div>
                          <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">{s.type}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Language Switcher */}
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                  className="rounded-full border-border bg-background/50 px-3 py-5"
                >
                  {language === "fr" ? (
                    <img src="https://flagcdn.com/w40/fr.png" alt="FR" className="h-5 w-7 object-cover rounded-sm shadow-xs" />
                  ) : language === "ht" ? (
                    <img src="https://flagcdn.com/w40/ht.png" alt="HT" className="h-5 w-7 object-cover rounded-sm shadow-xs" />
                  ) : (
                    <img src="https://flagcdn.com/w40/gb.png" alt="EN" className="h-5 w-7 object-cover rounded-sm shadow-xs" />
                  )}
                  <ChevronDown className={`ml-2 h-3 w-3 transition-transform ${isLangMenuOpen ? "rotate-180" : ""}`} />
                </Button>
                {isLangMenuOpen && (
                  <div className="absolute right-0 mt-2 w-20 overflow-hidden rounded-xl border border-border bg-background/95 shadow-lg backdrop-blur-md">
                    {(["fr", "ht", "en"] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => { setLanguage(lang); setIsLangMenuOpen(false); }}
                        className="flex w-full items-center justify-center py-3 hover:bg-muted transition-colors"
                      >
                        <img 
                          src={`https://flagcdn.com/w40/${lang === "fr" ? "fr" : lang === "ht" ? "ht" : "gb"}.png`} 
                          alt={lang} 
                          className="h-5 w-7 object-cover rounded-sm shadow-xs" 
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Toggle */}
      <div className="absolute left-4 bottom-8 z-50 sm:hidden">
        <Button
          variant="default"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="h-12 w-12 rounded-full shadow-2xl border border-primary/20 backdrop-blur-md"
        >
          {isSidebarOpen ? (
            <X className="h-6 w-6 text-primary-foreground" />
          ) : (
            <Menu className="h-6 w-6 text-primary-foreground" />
          )}
        </Button>
      </div>

      {/* Sidebar - Controls & Filters */}
      <div className={`absolute left-4 top-24 z-40 flex flex-col gap-3 transition-all duration-300 sm:left-6 sm:flex ${
        isSidebarOpen ? "flex pointer-events-auto opacity-100 translate-x-0" : "hidden sm:flex"
      }`}>
        {/* Basemap Toggle */}
        <div className="flex flex-col gap-1 rounded-2xl bg-card/95 p-1.5 shadow-lg backdrop-blur-sm border border-border/40">
          <button
            onClick={() => setMapStyle("streets")}
            className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
              mapStyle === "streets" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <MapIcon className="h-3.5 w-3.5" />
            {t.streets}
          </button>
          <button
            onClick={() => setMapStyle("satellite")}
            className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
              mapStyle === "satellite" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            {t.satellite}
          </button>
          
          <div className="my-1 h-px bg-border/40 mx-2" />
          
          <button
            onClick={() => setShowBoundaries(!showBoundaries)}
            className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
              showBoundaries ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <MapIcon className="h-3.5 w-3.5" />
            {t.showBoundaries}
            <div className={`ml-auto h-1.5 w-1.5 rounded-full ${showBoundaries ? "bg-primary shadow-[0_0_8px_rgba(var(--primary),0.8)]" : "bg-muted-foreground/30"}`} />
          </button>
        </div>

        {/* Category Grouped Filter */}
        <div className="flex w-64 flex-col gap-2 rounded-2xl bg-card/95 p-3 shadow-lg backdrop-blur-sm border border-border/40 max-h-[50vh] overflow-y-auto scrollbar-hide">
          <button
            onClick={() => setActiveCategory("all")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
              activeCategory === "all" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <div className={`h-2 w-2 rounded-full ${activeCategory === "all" ? "bg-white" : "bg-muted-foreground"}`} />
            {t.all}
          </button>

          {groups.map((group) => (
            <div key={group} className="mt-2 space-y-1">
              <h3 className="px-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-2">
                {groupLabels[group][language]}
              </h3>
              {Object.keys(categoryLabels).filter(cat => {
                // Determine which group this category belongs to
                if (["fortress", "palace", "church", "monument"].includes(cat)) return group === "cultural"
                if (["natural"].includes(cat)) return group === "tourist"
                if (["festival", "craft"].includes(cat)) return group === "immaterial"
                return false
              }).map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat)
                    if (window.innerWidth < 640) setIsSidebarOpen(false)
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                    activeCategory === cat ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: categoryColors[cat] }} />
                  {categoryLabels[cat][language]}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Credits - Bottom Right (Perfectly matched with MapLibre native style) */}
      <div className="absolute bottom-[10px] right-[46px] z-40 flex h-5 items-center gap-1.5 rounded-full bg-white/80 px-2.5 backdrop-blur-xs text-[10px] font-sans text-[#333] transition-all hover:bg-white/95 shadow-sm">
        <span className="opacity-80 font-normal leading-[20px]">{language === "fr" ? "Réalisé par" : (language === "ht" ? "Reyalize pa" : "Developed by")}</span>
        <a 
          href="https://www.aigeoh.org/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="hover:underline font-normal leading-[20px] transition-colors"
        >
          AIGEOH
        </a>
        <span className="opacity-40 leading-[20px]">|</span>
        <a 
          href="https://www.malt.fr/profile/jeankellyseguin" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="hover:underline font-normal leading-[20px] transition-colors"
        >
          JK'S
        </a>
      </div>

      {/* Bottom Site Card */}
      {filteredSites.length > 0 && searchQuery !== "" && (
        <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2">
          <div className="rounded-2xl bg-card/95 p-3 shadow-2xl border border-border/40 backdrop-blur-md">
            <button
              onClick={() => { setSelectedSite(filteredSites[0]); setIsModalOpen(true); flyToSite(filteredSites[0]); }}
              className="group flex w-72 items-center gap-4 rounded-xl bg-background/50 p-2.5 transition-all hover:bg-background/80"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted shadow-sm">
                <img src={filteredSites[0].imageUrl} alt={filteredSites[0].name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: categoryColors[filteredSites[0].category] }} />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">{categoryLabels[filteredSites[0].category][language]}</span>
                </div>
                <h3 className="mt-1 line-clamp-1 text-sm font-bold text-foreground">
                  {language === "fr" ? filteredSites[0].name : (language === "ht" ? (filteredSites[0].name_ht || filteredSites[0].name) : (filteredSites[0].name_en || filteredSites[0].name))}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                  {language === "fr" ? filteredSites[0].description : (language === "ht" ? (filteredSites[0].description_ht || filteredSites[0].description) : (filteredSites[0].description_en || filteredSites[0].description))}
                </p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      <PatrimoineModal
        site={selectedSite}
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedSite(null); }}
        language={language}
      />

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .maplibregl-ctrl-attrib { font-size: 10px; background: rgba(255, 255, 255, 0.8) !important; backdrop-filter: blur(4px); border-radius: 4px; border: 1px solid rgba(0,0,0,0.05); }
      `}</style>
    </div>
  )
}

function getCategoryEmoji(category: string) {
  switch (category) {
    case "fortress": return "&#x1F3F0;"
    case "church": return "&#x26EA;"
    case "palace": return "&#x1F3DB;"
    case "monument": return "&#x1F5FF;"
    case "natural": return "&#x1F3DE;"
    case "festival": return "&#x1F3AD;"
    case "craft": return "&#x1F3A8;"
    default: return "&#x1F4CD;"
  }
}

