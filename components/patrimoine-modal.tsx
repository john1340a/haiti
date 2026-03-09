"use client"

import { useState } from "react"
import { X, MapPin, Maximize2, RotateCcw, Move } from "lucide-react"
import type { PatrimoineSite } from "./patrimoine-map"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface PatrimoineModalProps {
  site: PatrimoineSite | null
  isOpen: boolean
  onClose: () => void
  language: "fr" | "ht"
}

const translations = {
  fr: {
    reset: "Réinitialiser",
    normalView: "Vue normale",
    view360: "Vue 360°",
    dragToExplore: "Glissez pour explorer en 360°",
    getDirections: "Obtenir l'itinéraire",
    explore360: "Explorer en 360°",
  },
  ht: {
    reset: "Retounen",
    normalView: "Vi nòmal",
    view360: "Vi 360°",
    dragToExplore: "Glise pou dekouvri nan 360°",
    getDirections: "Kijan pou rive la",
    explore360: "Dekouvri nan 360°",
  }
}

const categoryLabels: Record<string, { fr: string, ht: string }> = {
  fortress: { fr: "Forteresse", ht: "Fò" },
  church: { fr: "Église", ht: "Legliz" },
  palace: { fr: "Palais", ht: "Palè" },
  monument: { fr: "Monument", ht: "Moniman" },
  natural: { fr: "Site Naturel", ht: "Sit Natirèl" },
  festival: { fr: "Festival", ht: "Fèt" },
  craft: { fr: "Artisanat", ht: "Atizana" },
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

export function PatrimoineModal({ site, isOpen, onClose, language }: PatrimoineModalProps) {
  const [is360View, setIs360View] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)

  const t = translations[language]

  if (!site) return null

  const handleMouseDown = (e: React.MouseEvent) => {
    if (is360View) {
      setIsDragging(true)
      setStartX(e.clientX)
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && is360View) {
      const deltaX = e.clientX - startX
      setRotation((prev) => prev + deltaX * 0.5)
      setStartX(e.clientX)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (is360View) {
      setIsDragging(true)
      setStartX(e.touches[0].clientX)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && is360View) {
      const deltaX = e.touches[0].clientX - startX
      setRotation((prev) => prev + deltaX * 0.5)
      setStartX(e.touches[0].clientX)
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  const resetView = () => {
    setRotation(0)
    setIs360View(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className="max-h-[95vh] w-[95vw] max-w-3xl overflow-y-auto rounded-2xl border-0 bg-card p-0 shadow-2xl sm:w-full scrollbar-hide">
        <div className="relative">
          {/* Image Container */}
          <div
            className="relative h-56 w-full overflow-hidden sm:h-80 md:h-96"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="h-full w-full transition-transform duration-100"
              style={{
                transform: is360View ? `translateX(${rotation}px)` : "none",
                cursor: is360View ? (isDragging ? "grabbing" : "grab") : "default",
              }}
            >
              <img
                src={is360View && site.panoramaUrl ? site.panoramaUrl : site.imageUrl}
                alt={site.name}
                className="h-full w-full object-cover"
                style={{
                  width: is360View ? "200%" : "100%",
                  objectPosition: is360View ? "center" : "center",
                }}
                draggable={false}
              />
            </div>

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-black/20" />

            {/* 360 Instructions */}
            {is360View && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 transform">
                <div className="flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-xs text-white backdrop-blur-sm">
                  <Move className="h-4 w-4" />
                  <span>{t.dragToExplore}</span>
                </div>
              </div>
            )}

            {/* Category Badge */}
            <div className="absolute left-4 top-4">
              <span
                className="rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-lg"
                style={{ backgroundColor: categoryColors[site.category] }}
              >
                {categoryLabels[site.category][language]}
              </span>
            </div>

            {/* Top Right Controls (360 Toggle & Close) */}
            <div className="absolute right-4 top-4 flex gap-2">
              {site.has360 && (
                <div className="flex gap-2">
                  {is360View && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={resetView}
                      className="rounded-full bg-white/90 text-foreground shadow-lg backdrop-blur-sm hover:bg-white"
                    >
                      <RotateCcw className="mr-1.5 h-4 w-4" />
                      {t.reset}
                    </Button>
                  )}
                  <Button
                    variant={is360View ? "default" : "secondary"}
                    size="sm"
                    onClick={() => setIs360View(!is360View)}
                    className={`rounded-full shadow-lg backdrop-blur-sm ${
                      is360View
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-white/90 text-foreground hover:bg-white"
                    }`}
                  >
                    <Maximize2 className="mr-1.5 h-4 w-4" />
                    {is360View ? t.normalView : t.view360}
                  </Button>
                </div>
              )}
              
              <button
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-foreground shadow-lg backdrop-blur-sm transition-colors hover:bg-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-2xl font-bold tracking-tight text-card-foreground sm:text-3xl">
                {language === "fr" ? site.name : (site.name_ht || site.name)}
              </DialogTitle>
            </DialogHeader>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>
                {site.coordinates[0].toFixed(4)}°N, {Math.abs(site.coordinates[1]).toFixed(4)}°O
              </span>
            </div>

            <p className="mt-4 leading-relaxed text-card-foreground/80">
              {language === "fr" ? site.description : (site.description_ht || site.description)}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${site.coordinates[1]},${site.coordinates[0]}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="default"
                  className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  {t.getDirections}
                </Button>
              </a>
              {site.has360 && !is360View && (
                <Button
                  variant="outline"
                  onClick={() => setIs360View(true)}
                  className="rounded-full border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground"
                >
                  <Maximize2 className="mr-2 h-4 w-4" />
                  {t.explore360}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
