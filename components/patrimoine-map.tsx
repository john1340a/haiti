"use client"

import { useEffect, useRef, useState } from "react"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import { PatrimoineModal } from "./patrimoine-modal"

export interface PatrimoineSite {
  id: string
  name: string
  description: string
  coordinates: [number, number]
  imageUrl: string
  has360: boolean
  panoramaUrl?: string
  category: "fortress" | "church" | "palace" | "monument" | "natural"
}

const patrimoineSites: PatrimoineSite[] = [
  {
    id: "citadelle",
    name: "Citadelle Laferrière",
    description:
      "La Citadelle Laferrière, également connue sous le nom de Citadelle Henry Christophe, est une grande forteresse située au sommet de la montagne Bonnet à l'Évêque. Construite entre 1805 et 1820, elle est la plus grande forteresse des Amériques et un symbole de la liberté haïtienne.",
    coordinates: [-72.2435, 19.5739],
    imageUrl: "https://visithaiti.com/wp-content/uploads/2025/03/citadelle-henri-jean-oscar-augustin_hero.jpg",
    has360: true,
    panoramaUrl: "https://visithaiti.com/wp-content/uploads/2025/03/citadelle-henri-jean-oscar-augustin_hero.jpg",
    category: "fortress",
  },
  {
    id: "sans-souci",
    name: "Palais Sans-Souci",
    description:
      "Le Palais Sans-Souci était la résidence royale du roi Henri Ier d'Haïti. Construit entre 1810 et 1813, ce palais majestueux témoigne de la grandeur de l'ère post-coloniale haïtienne. Bien que partiellement détruit par un tremblement de terre en 1842, ses ruines restent impressionnantes.",
    coordinates: [-72.2217, 19.6061],
    imageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    has360: true,
    panoramaUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80",
    category: "palace",
  },
  {
    id: "cap-haitien-cathedral",
    name: "Cathédrale Notre-Dame du Cap-Haïtien",
    description:
      "La Cathédrale Notre-Dame du Cap-Haïtien est un édifice religieux emblématique datant de l'époque coloniale française. Elle représente un mélange unique d'architecture coloniale et de spiritualité haïtienne.",
    coordinates: [-72.2022, 19.7578],
    imageUrl: "https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=800&q=80",
    has360: false,
    category: "church",
  },
  {
    id: "fort-picolet",
    name: "Fort Picolet",
    description:
      "Le Fort Picolet est une fortification historique située sur la côte nord d'Haïti. Il offre une vue panoramique sur l'océan Atlantique et témoigne de l'importance stratégique de la région durant l'ère coloniale.",
    coordinates: [-72.1667, 19.7833],
    imageUrl: "https://i0.wp.com/www.historic-haiti.com/wp-content/uploads/2021/07/Picolet-DJI_0041-scaled.jpg",
    has360: true,
    panoramaUrl: "https://i0.wp.com/www.historic-haiti.com/wp-content/uploads/2021/07/Picolet-DJI_0041-scaled.jpg",
    category: "fortress",
  },
  {
    id: "vertières",
    name: "Monument de Vertières",
    description:
      "Le Monument de Vertières commémore la bataille décisive de Vertières du 18 novembre 1803, qui a conduit à l'indépendance d'Haïti. Ce lieu symbolise la victoire des esclaves révoltés contre l'armée napoléonienne.",
    coordinates: [-72.185, 19.7394],
    imageUrl: "https://images.unsplash.com/photo-1564078516393-cf04bd966897?w=800&q=80",
    has360: false,
    category: "monument",
  },
  {
    id: "bassin-bleu",
    name: "Bassin Bleu",
    description:
      "Le Bassin Bleu est une série de bassins d'eau naturels aux couleurs émeraude et cobalt, nichés dans les montagnes près de Jacmel. Ce site naturel spectaculaire est entouré de cascades et de végétation luxuriante.",
    coordinates: [-72.35, 19.65],
    imageUrl: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=800&q=80",
    has360: true,
    panoramaUrl: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1600&q=80",
    category: "natural",
  },
]

const categoryColors: Record<PatrimoineSite["category"], string> = {
  fortress: "#B45309",
  church: "#7C3AED",
  palace: "#DC2626",
  monument: "#059669",
  natural: "#0891B2",
}

const categoryLabels: Record<PatrimoineSite["category"], string> = {
  fortress: "Forteresse",
  church: "Église",
  palace: "Palais",
  monument: "Monument",
  natural: "Site Naturel",
}

export function PatrimoineMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])
  const [selectedSite, setSelectedSite] = useState<PatrimoineSite | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<PatrimoineSite["category"] | "all">("all")

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const map = new maplibregl.Map({
      container: mapRef.current,
      style: `https://api.jawg.io/styles/jawg-streets.json?access-token=${process.env.NEXT_PUBLIC_JAWG_ACCESS_TOKEN}`,
      center: [-72.22, 19.65],
      zoom: 10,
      attributionControl: false,
    })

    map.addControl(
      new maplibregl.AttributionControl({
        compact: true,
      }),
      "bottom-left"
    )

    map.addControl(new maplibregl.NavigationControl(), "bottom-right")

    map.on("load", () => {
      patrimoineSites.forEach((site) => {
        const el = document.createElement("div")
        el.className = "custom-marker"
        el.innerHTML = `
          <div style="
            width: 40px;
            height: 40px;
            background: ${categoryColors[site.category]};
            border: 3px solid white;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: transform 0.2s ease;
          ">
            <div style="
              transform: rotate(45deg);
              color: white;
              font-size: 16px;
            ">
              ${getCategoryEmoji(site.category)}
            </div>
          </div>
        `

        el.addEventListener("mouseenter", () => {
          el.querySelector("div")?.setAttribute(
            "style",
            el.querySelector("div")?.getAttribute("style")?.replace("transform: rotate(-45deg)", "transform: rotate(-45deg) scale(1.1)") || ""
          )
        })

        el.addEventListener("mouseleave", () => {
          el.querySelector("div")?.setAttribute(
            "style",
            el.querySelector("div")?.getAttribute("style")?.replace("transform: rotate(-45deg) scale(1.1)", "transform: rotate(-45deg)") || ""
          )
        })

        const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
          .setLngLat(site.coordinates as [number, number])
          .addTo(map)

        el.addEventListener("click", () => {
          setSelectedSite(site)
          setIsModalOpen(true)
        })

        markersRef.current.push(marker)
      })
    })

    mapInstanceRef.current = map

    return () => {
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  useEffect(() => {
    markersRef.current.forEach((marker, index) => {
      const site = patrimoineSites[index]
      const element = marker.getElement()
      if (activeCategory === "all" || site.category === activeCategory) {
        element.style.display = "block"
      } else {
        element.style.display = "none"
      }
    })
  }, [activeCategory])

  const filteredSites =
    activeCategory === "all"
      ? patrimoineSites
      : patrimoineSites.filter((site) => site.category === activeCategory)

  const flyToSite = (site: PatrimoineSite) => {
    mapInstanceRef.current?.flyTo({
      center: site.coordinates as [number, number],
      zoom: 14,
      duration: 1500,
    })
  }

  return (
    <div className="relative h-full w-full">
      <div ref={mapRef} className="h-full w-full" />

      {/* Header */}
      <div className="absolute left-0 right-0 top-0 z-10 bg-linear-to-b from-background/95 via-background/80 to-transparent px-4 py-4 backdrop-blur-sm sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                Patrimoine Haiti Nord
              </h1>
              <p className="text-sm text-muted-foreground">
                Explorez les tresors historiques et naturels du Nord d{"'"}Haiti
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                {filteredSites.length} site{filteredSites.length > 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="absolute left-4 top-24 z-10 sm:left-6">
        <div className="flex flex-col gap-1.5 rounded-xl bg-card/95 p-2 shadow-lg backdrop-blur-sm">
          <button
            onClick={() => setActiveCategory("all")}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
              activeCategory === "all"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-current" />
            Tous
          </button>
          {(Object.keys(categoryColors) as PatrimoineSite["category"][]).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: categoryColors[cat] }}
              />
              {categoryLabels[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Site Card - Only show when a specific category is selected */}
      {activeCategory !== "all" && filteredSites.length > 0 && (
        <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2">
          <div className="rounded-2xl bg-card/95 p-3 shadow-lg backdrop-blur-sm">
            <button
              onClick={() => {
                setSelectedSite(filteredSites[0])
                setIsModalOpen(true)
                flyToSite(filteredSites[0])
              }}
              className="group flex w-56 items-center gap-3 rounded-xl bg-background/80 p-2.5 transition-all hover:bg-background hover:shadow-md sm:w-64"
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted sm:h-16 sm:w-16">
                <img
                  src={filteredSites[0].imageUrl}
                  alt={filteredSites[0].name}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                />
                {filteredSites[0].has360 && (
                  <div className="absolute bottom-0.5 right-0.5 rounded bg-secondary/90 px-1 py-0.5 text-[8px] font-bold text-secondary-foreground">
                    360
                  </div>
                )}
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: categoryColors[filteredSites[0].category] }}
                  />
                  <span className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
                    {categoryLabels[filteredSites[0].category]}
                  </span>
                </div>
                <h3 className="mt-0.5 line-clamp-1 text-xs font-semibold text-card-foreground sm:text-sm">
                  {filteredSites[0].name}
                </h3>
                <p className="mt-0.5 line-clamp-1 text-[10px] text-muted-foreground sm:text-xs">
                  {filteredSites[0].description}
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
        onClose={() => {
          setIsModalOpen(false)
          setSelectedSite(null)
        }}
      />

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .maplibregl-ctrl-attrib {
          font-size: 10px;
          background: rgba(255, 255, 255, 0.8) !important;
          backdrop-filter: blur(4px);
        }
      `}</style>
    </div>
  )
}

function getCategoryEmoji(category: PatrimoineSite["category"]) {
  switch (category) {
    case "fortress":
      return "&#x1F3F0;"
    case "church":
      return "&#x26EA;"
    case "palace":
      return "&#x1F3DB;"
    case "monument":
      return "&#x1F5FF;"
    case "natural":
      return "&#x1F3DE;"
    default:
      return "&#x1F4CD;"
  }
}
