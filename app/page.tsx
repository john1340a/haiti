"use client"

import dynamic from "next/dynamic"

const PatrimoineMap = dynamic(
  () => import("@/components/patrimoine-map").then((mod) => mod.PatrimoineMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-svh w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Chargement de la carte...</p>
        </div>
      </div>
    ),
  }
)

export default function Page() {
  return (
    <main className="h-svh w-full overflow-hidden">
      <PatrimoineMap />
    </main>
  )
}
