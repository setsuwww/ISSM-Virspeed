"use client"

import { useState } from "react"
import { useToast } from "@/_context/Toast-Provider"
import { Button } from "@/_components/ui/Button"
import { Radar, MapPin, X } from "lucide-react"
import { Label } from "@/_components/ui/Label"

export function CreateLocationByScan({ onLocationCaptured }) {
  const { addToast } = useToast()

  const [loading, setLoading] = useState(false)
  const [coords, setCoords] = useState(null) // { latitude, longitude }

  const handleScan = () => {
    if (!navigator.geolocation) {
      addToast("Geolocation is not supported by your browser", { type: "error" })
      return
    }

    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setCoords({ latitude, longitude })
        addToast("Location captured", { type: "success" })
        onLocationCaptured?.({ latitude, longitude })
        setLoading(false)
      },
      (error) => {
        console.error(error)
        addToast("Unable to retrieve location", { type: "error" })
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  const removeCoords = () => setCoords(null)

  return (
    <>
      <Label className="mb-3">Scan area <span className="font-light text-slate-400">(Get current coordinates)</span><span className="text-xs bg-sky-100 px-2 text-sky-600 rounded-full">SCAN</span></Label>

      <div className="bg-slate-50/50 rounded-xl border border-dashed p-8 transition mb-6 flex flex-col items-start justify-start gap-4">
        {/* Radar Icon */}
        <div
          className={`group relative flex flex h-12 w-12 items-center justify-center rounded-md border transition
            ${coords ? "border-sky-400 bg-sky-100/40 text-sky-600" : "border-slate-300 bg-slate-100/40 text-slate-600"}`}
        >
          <Radar className="h-6 w-6 animate-pulse" />
          {coords && (
            <button
              type="button"
              onClick={removeCoords}
              className="absolute -top-2 -right-2 p-1 items-center justify-center rounded-full bg-white border border-slate-300 text-red-500 hover:bg-slate-100 hover:text-red-700"
            >
              <X className="w-3 h-3" strokeWidth={2} />
            </button>
          )}
        </div>

        {/* Display coordinates */}
        {coords ? (
          <div className="text-sm text-sky-700 text-start">
            <p>Latitude: {coords.latitude}</p>
            <p>Longitude: {coords.longitude}</p>
          </div>
        ) : (
          <p className="text-sm text-slate-600 text-center">
            Click <span className="font-semibold">"Scan Location"</span> to capture your current location
          </p>
        )}

        {/* Scan button */}
        <Button
          type="button"
          variant="positive"
          disabled={loading}
          onClick={handleScan}
          className="flex items-center gap-2 from-sky-600 to-sky-500 hover:from-sky-700 hover:to-sky-600 focus:ring-sky-300"
        >
          <MapPin className="h-4 w-4" />
          {loading ? "Scanning..." : "Scan Location"}
        </Button>
      </div>
    </>
  )
}
