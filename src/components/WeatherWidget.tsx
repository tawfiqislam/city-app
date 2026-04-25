"use client"

import { useEffect, useState, useRef } from "react"

interface HourlyItem {
  time: string
  temp: number
  condition: string
  description: string
  icon: string
  humidity: number
  windSpeed: number
  pop: number
}

interface DailyItem {
  date: string
  tempMin: number
  tempMax: number
  condition: string
  description: string
  icon: string
  pop: number
  humidity: number
}

interface WeatherData {
  city: string
  apiCity: string
  rawApiCity: string
  country: string
  lat: number
  lon: number
  temperature: number
  feelsLike: number
  tempMin: number
  tempMax: number
  humidity: number
  windSpeed: number
  windDeg: number
  visibility: number | null
  pressure: number | null
  clouds: number | null
  sunrise: string | null
  sunset: string | null
  condition: string
  description: string
  icon: string
  alertLevel: "normal" | "warning" | "danger"
  alertMessage: string
  hourlyForecast: HourlyItem[]
  dailyForecast: DailyItem[]
  updatedAt: string
}

type LocationSource = "gps" | "ip" | "manual" | null

const ALL_DISTRICTS = [
  "Dhaka", "Faridpur", "Gazipur", "Gopalganj", "Kishoreganj",
  "Madaripur", "Manikganj", "Munshiganj", "Narayanganj", "Narsingdi",
  "Rajbari", "Shariatpur", "Tangail", "Bagerhat", "Chuadanga",
  "Jessore", "Jhenaidah", "Khulna", "Kushtia", "Magura",
  "Meherpur", "Narail", "Satkhira", "Barguna", "Barishal",
  "Bhola", "Jhalokati", "Patuakhali", "Pirojpur", "Bandarban",
  "Brahmanbaria", "Chandpur", "Chattogram", "Cumilla", "Cox's Bazar",
  "Feni", "Khagrachari", "Lakshmipur", "Noakhali", "Rangamati",
  "Habiganj", "Moulvibazar", "Sunamganj", "Sylhet", "Bogura",
  "Joypurhat", "Naogaon", "Natore", "Chapai Nawabganj", "Pabna",
  "Rajshahi", "Sirajganj", "Dinajpur", "Gaibandha", "Kurigram",
  "Lalmonirhat", "Nilphamari", "Panchagarh", "Rangpur", "Thakurgaon",
  "Jamalpur", "Mymensingh", "Netrokona", "Sherpur",
]

const DIVISION_CAPITALS = [
  "Dhaka", "Chattogram", "Rajshahi", "Khulna",
  "Barishal", "Sylhet", "Rangpur", "Mymensingh",
]

const WEATHER_EMOJI: Record<string, string> = {
  Clear: "☀️", Clouds: "☁️", Rain: "🌧️", Drizzle: "🌦️",
  Thunderstorm: "⛈️", Snow: "❄️", Mist: "🌫️", Fog: "🌫️",
  Haze: "🌫️", Dust: "🌪️", Smoke: "🌫️", Tornado: "🌪️", Squall: "💨",
}

const WEATHER_BG: Record<string, string> = {
  Clear: "from-amber-400 via-orange-400 to-yellow-300",
  Clouds: "from-slate-500 via-slate-400 to-gray-400",
  Rain: "from-blue-700 via-blue-500 to-indigo-500",
  Drizzle: "from-blue-500 via-sky-400 to-blue-300",
  Thunderstorm: "from-gray-900 via-slate-700 to-gray-800",
  Snow: "from-blue-200 via-indigo-200 to-blue-100",
  Mist: "from-gray-400 via-gray-300 to-gray-200",
  Fog: "from-gray-400 via-gray-300 to-gray-200",
  Haze: "from-amber-300 via-yellow-200 to-orange-200",
  Default: "from-teal-600 via-emerald-500 to-green-400",
}

// Map IP city names to clean Bangladesh districts
const IP_TO_DISTRICT: Record<string, string> = {
  "Dhaka": "Dhaka", "Chittagong": "Chattogram", "Comilla": "Cumilla",
  "Sylhet": "Sylhet", "Rajshahi": "Rajshahi", "Khulna": "Khulna",
  "Barisal": "Barishal", "Rangpur": "Rangpur", "Mymensingh": "Mymensingh",
  "Gazipur": "Gazipur", "Narayanganj": "Narayanganj", "Tongi": "Gazipur",
  "Savar": "Dhaka", "Narsingdi": "Narsingdi", "Tangail": "Tangail",
  "Bogra": "Bogura", "Jessore": "Jessore", "Mirpur": "Dhaka",
  "Uttara": "Dhaka", "Gulshan": "Dhaka", "Dhanmondi": "Dhaka",
  "Faridpur": "Faridpur", "Manikganj": "Manikganj", "Munshiganj": "Munshiganj",
  "Cox's Bazar": "Cox's Bazar", "Feni": "Feni", "Noakhali": "Noakhali",
  "Lakshmipur": "Lakshmipur", "Brahmanbaria": "Brahmanbaria",
  "Chandpur": "Chandpur", "Bandarban": "Bandarban",
}

function mapToDistrict(cityName: string): string {
  if (!cityName) return "Dhaka"
  if (IP_TO_DISTRICT[cityName]) return IP_TO_DISTRICT[cityName]
  const found = ALL_DISTRICTS.find(
    (d) => d.toLowerCase() === cityName.toLowerCase()
  )
  return found || "Dhaka"
}

const getWindDirection = (deg: number) => {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
  return dirs[Math.round(deg / 45) % 8]
}

const capitalize = (str: string) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : ""

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [locationLoading, setLocationLoading] = useState(true)
  const [error, setError] = useState("")
  const [locationSource, setLocationSource] = useState<LocationSource>(null)
  const [detectedDistrict, setDetectedDistrict] = useState<string>("Dhaka")
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null)
  const [deviceIp, setDeviceIp] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [showIpInfo, setShowIpInfo] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const filteredDistricts = ALL_DISTRICTS.filter((d) =>
    d.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const currentLabel = selectedDistrict || detectedDistrict

  useEffect(() => {
    detectLocation()
  }, [])

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
        setSearchQuery("")
      }
    }
    document.addEventListener("mousedown", handleOutside)
    return () => document.removeEventListener("mousedown", handleOutside)
  }, [])

  useEffect(() => {
    if (showDropdown) setTimeout(() => searchInputRef.current?.focus(), 50)
  }, [showDropdown])

  // ================================================
  // AUTO LOCATION: Always use IP for district name
  // GPS is used ONLY for weather coordinates accuracy
  // IP city is ALWAYS used for the district label
  // ================================================
  const detectLocation = async () => {
    setLocationLoading(true)
    setError("")

    // Always get IP location first for clean district name
    let ipLat: number | null = null
    let ipLon: number | null = null
    let ipDistrict = "Dhaka"
    let ipAddress = ""

    try {
      const ipRes = await fetch("https://ipapi.co/json/", { cache: "no-store" })
      if (ipRes.ok) {
        const ipData = await ipRes.json()
        ipLat = ipData.latitude
        ipLon = ipData.longitude
        ipAddress = ipData.ip || ""
        const ipCity = ipData.city || ""
        ipDistrict = mapToDistrict(ipCity)

        setDeviceIp(ipAddress)
        setDetectedDistrict(ipDistrict)

        console.log(
          `IP Location: ${ipAddress} → city: ${ipCity} → district: ${ipDistrict}`
        )
      }
    } catch {
      console.log("IP geolocation failed")
    }

    // Try GPS for accurate weather coordinates
    // But KEEP IP district name as the display label
    if ("geolocation" in navigator) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 8000,
            enableHighAccuracy: true,
          })
        })

        const { latitude, longitude } = pos.coords
        console.log("GPS coordinates obtained:", latitude, longitude)
        console.log("But using IP district name:", ipDistrict)

        setLocationSource("gps")
        setSelectedDistrict(null)
        setLocationLoading(false)

        // Fetch weather using GPS coords for accuracy
        // But pass IP district as the display label
        await fetchWeatherByCoords(latitude, longitude, ipDistrict)
        return
      } catch {
        console.log("GPS denied. Using IP location.")
      }
    }

    // Use IP coordinates if GPS failed
    if (ipLat && ipLon) {
      setLocationSource("ip")
      setSelectedDistrict(null)
      setLocationLoading(false)
      await fetchWeatherByCoords(ipLat, ipLon, ipDistrict)
      return
    }

    // Final fallback
    setLocationSource("manual")
    setDetectedDistrict("Dhaka")
    setSelectedDistrict("Dhaka")
    setLocationLoading(false)
    await fetchWeatherByDistrict("Dhaka")
  }

  const fetchWeatherByCoords = async (
    lat: number,
    lon: number,
    label: string
  ) => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(
        `/api/weather?lat=${lat}&lon=${lon}&city=${encodeURIComponent(label)}`,
        { cache: "no-store" }
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to fetch weather")
      setWeather(data)
      setLastUpdated(new Date())
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchWeatherByDistrict = async (district: string) => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(
        `/api/weather?city=${encodeURIComponent(district)}`,
        { cache: "no-store" }
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to fetch weather")
      setWeather(data)
      setLastUpdated(new Date())
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDistrictSelect = (district: string) => {
    setSelectedDistrict(district)
    setLocationSource("manual")
    setSearchQuery("")
    setShowDropdown(false)
    fetchWeatherByDistrict(district)
  }

  const handleMyLocation = () => {
    setSelectedDistrict(null)
    detectLocation()
  }

  const weatherEmoji = weather ? WEATHER_EMOJI[weather.condition] || "🌤️" : "🌤️"
  const weatherBg = weather ? WEATHER_BG[weather.condition] || WEATHER_BG.Default : WEATHER_BG.Default

  return (
    <div className="w-full space-y-4">
      {/* IP ADDRESS INFO PANEL */}
      {deviceIp && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            onClick={() => setShowIpInfo(!showIpInfo)}
            className="w-full px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-sm">
                🌐
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-800">
                  Your Device IP Address
                </p>
                <p className="text-xs text-gray-500">
                  Used to detect your approximate location
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-blue-700 font-mono text-sm font-bold">
                  {deviceIp}
                </span>
              </div>
              <span className="text-gray-400 text-sm">
                {showIpInfo ? "▲" : "▼"}
              </span>
            </div>
          </button>

          {showIpInfo && (
            <div className="px-5 pb-4 border-t border-gray-100">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-400 mb-1">IP Address</p>
                  <p className="font-mono font-bold text-gray-900 text-sm">
                    {deviceIp}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-400 mb-1">Detected District</p>
                  <p className="font-bold text-gray-900 text-sm">
                    {detectedDistrict}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-400 mb-1">Location Source</p>
                  <p className="font-bold text-gray-900 text-sm">
                    {locationSource === "gps"
                      ? "GPS + IP"
                      : locationSource === "ip"
                      ? "IP Address"
                      : "Manual"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-400 mb-1">Country</p>
                  <p className="font-bold text-gray-900 text-sm">
                    Bangladesh 🇧🇩
                  </p>
                </div>
              </div>

              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                <p className="text-yellow-700 text-xs">
                  <strong>Note:</strong> Your IP address is used only to detect
                  your approximate district location for weather. No personal
                  data is stored.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ALERT BANNER */}
      {weather && weather.alertLevel !== "normal" && (
        <div
          className={`rounded-2xl p-4 border-l-4 flex items-start gap-3 ${
            weather.alertLevel === "danger"
              ? "bg-red-50 border-red-500 text-red-800"
              : "bg-yellow-50 border-yellow-500 text-yellow-800"
          }`}
        >
          <span className="text-3xl flex-shrink-0">
            {weather.alertLevel === "danger" ? "🚨" : "⚠️"}
          </span>
          <div>
            <h3 className="font-bold text-sm">
              {weather.alertLevel === "danger"
                ? "Severe Weather Alert"
                : "Weather Advisory"}
            </h3>
            <p className="text-sm mt-0.5">{weather.alertMessage}</p>
          </div>
        </div>
      )}

      {/* MAIN WEATHER CARD */}
      <div className="rounded-3xl shadow-xl">
        {/* Header */}
        <div
          className={`bg-gradient-to-br ${weatherBg} p-5 text-white rounded-t-3xl relative`}
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-white/80 text-sm font-semibold">
                  🌦️ Bangladesh Weather
                </p>
                <p className="text-white/50 text-xs">
                  Live OpenWeatherMap Data
                </p>
              </div>
              <button
                onClick={() => {
                  if (selectedDistrict) {
                    fetchWeatherByDistrict(selectedDistrict)
                  } else {
                    detectLocation()
                  }
                }}
                disabled={loading || locationLoading}
                className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition disabled:opacity-50"
              >
                <span
                  className={
                    loading || locationLoading
                      ? "animate-spin inline-block text-sm"
                      : "text-sm"
                  }
                >
                  🔄
                </span>
              </button>
            </div>

            {/* Location badges */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {locationSource === "gps" && (
                <span className="px-2 py-1 bg-green-500/80 text-white text-xs rounded-full font-semibold">
                  📡 GPS + IP District
                </span>
              )}
              {locationSource === "ip" && (
                <span className="px-2 py-1 bg-blue-500/80 text-white text-xs rounded-full font-semibold">
                  🌐 IP: {deviceIp}
                </span>
              )}
              {locationSource === "manual" && (
                <span className="px-2 py-1 bg-white/20 text-white text-xs rounded-full font-semibold">
                  📍 Manual Selection
                </span>
              )}
              <button
                onClick={handleMyLocation}
                disabled={locationLoading}
                className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-xs rounded-full font-semibold transition disabled:opacity-50"
              >
                {locationLoading ? "Detecting..." : "📡 Use My Location"}
              </button>
            </div>

            {/* District selector */}
            <div className="relative z-50" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-full bg-white/20 hover:bg-white/30 rounded-xl px-4 py-3 flex items-center gap-2 transition text-left"
              >
                <span className="text-lg">📍</span>
                <div className="flex-1 min-w-0">
                  {locationLoading ? (
                    <span className="text-white/70 text-sm">
                      Detecting your location...
                    </span>
                  ) : (
                    <>
                      <span className="font-bold text-base">
                        {currentLabel}
                      </span>
                      <span className="text-white/60 text-sm ml-2">
                        District, Bangladesh
                      </span>
                    </>
                  )}
                </div>
                <span className="text-white/70 flex-shrink-0">
                  {showDropdown ? "▲" : "▼"}
                </span>
              </button>

              {showDropdown && (
                <div
                  className="absolute left-0 right-0 bg-white border border-gray-200 shadow-2xl z-[999]"
                  style={{ top: "100%", borderRadius: "0 0 16px 16px" }}
                >
                  <div className="p-3 border-b border-gray-100">
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-2">
                      <span className="text-gray-400 text-sm">🔍</span>
                      <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search any district..."
                        className="flex-1 bg-transparent text-gray-900 text-sm outline-none placeholder-gray-400"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      {searchQuery && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSearchQuery("")
                          }}
                          className="text-gray-400 hover:text-gray-600 text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShowDropdown(false)
                      handleMyLocation()
                    }}
                    className="w-full text-left px-4 py-3 text-sm flex items-center gap-3 bg-blue-50 hover:bg-blue-100 transition border-b border-gray-100 text-blue-700 font-semibold"
                  >
                    <span>📡</span>
                    <span>
                      Detect My Location
                      {deviceIp && (
                        <span className="ml-2 text-xs font-mono text-blue-500">
                          ({deviceIp})
                        </span>
                      )}
                    </span>
                  </button>

                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                    <p className="text-xs text-gray-500">
                      {filteredDistricts.length} of {ALL_DISTRICTS.length} districts
                    </p>
                  </div>

                  <div className="max-h-56 overflow-y-auto">
                    {filteredDistricts.length === 0 ? (
                      <div className="p-6 text-center text-gray-500 text-sm">
                        No district found for &quot;{searchQuery}&quot;
                      </div>
                    ) : (
                      filteredDistricts.map((district) => {
                        const isActive =
                          selectedDistrict === district ||
                          (!selectedDistrict && detectedDistrict === district)
                        return (
                          <button
                            key={district}
                            onClick={() => handleDistrictSelect(district)}
                            className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 border-b border-gray-50 hover:bg-blue-50 transition ${
                              isActive
                                ? "bg-blue-50 text-blue-700 font-semibold"
                                : "text-gray-700"
                            }`}
                          >
                            <span>{isActive ? "✅" : "📍"}</span>
                            <span className="flex-1">{district}</span>
                            {isActive && (
                              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                                {locationSource === "gps" || locationSource === "ip"
                                  ? "Your Location"
                                  : "Selected"}
                              </span>
                            )}
                          </button>
                        )
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* WEATHER BODY */}
        <div className="bg-white rounded-b-3xl">
          {loading || locationLoading ? (
            <div className="py-16 text-center">
              <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">
                {locationLoading
                  ? "Detecting your location via IP..."
                  : "Loading weather data..."}
              </p>
              <p className="text-gray-400 text-xs mt-1">
                {locationLoading
                  ? "Getting your IP address and district"
                  : "Fetching live data from OpenWeatherMap"}
              </p>
            </div>
          ) : error ? (
            <div className="py-12 text-center px-6">
              <div className="text-5xl mb-3">⚠️</div>
              <h3 className="font-bold text-gray-900 mb-2">
                Weather Unavailable
              </h3>
              <p className="text-red-600 text-sm mb-2">{error}</p>
              <div className="flex gap-3 justify-center mt-4">
                <button
                  onClick={() =>
                    selectedDistrict
                      ? fetchWeatherByDistrict(selectedDistrict)
                      : detectLocation()
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700"
                >
                  Try Again
                </button>
                <button
                  onClick={() => handleDistrictSelect("Dhaka")}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm hover:bg-emerald-700"
                >
                  Use Dhaka
                </button>
              </div>
            </div>
          ) : weather ? (
            <div>
              {/* Big temperature */}
              <div className={`bg-gradient-to-br ${weatherBg} px-6 pb-6 text-white`}>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-8xl font-thin leading-none">
                      {weather.temperature}°
                      <span className="text-3xl text-white/60">C</span>
                    </div>
                    <div className="text-xl font-medium mt-1 capitalize">
                      {capitalize(weather.description)}
                    </div>
                    <div className="text-white/70 text-sm mt-1">
                      Feels like {weather.feelsLike}° • H:{weather.tempMax}° L:{weather.tempMin}°
                    </div>
                    {/* CLEAN location label */}
                    <div className="text-white/50 text-xs mt-1 flex items-center gap-1 flex-wrap">
                      <span>📍</span>
                      <span className="font-medium">
                        {currentLabel} District, Bangladesh
                      </span>
                      {locationSource === "gps" && (
                        <span className="px-1.5 py-0.5 bg-green-500/40 rounded-full text-green-100 text-xs">
                          GPS
                        </span>
                      )}
                      {locationSource === "ip" && (
                        <span className="px-1.5 py-0.5 bg-blue-500/40 rounded-full text-blue-100 text-xs">
                          {deviceIp}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-8xl leading-none pb-2">{weatherEmoji}</div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 divide-x divide-gray-100 border-b border-gray-100">
                {[
                  { icon: "💧", label: "Humidity", value: `${weather.humidity}%` },
                  { icon: "💨", label: "Wind", value: `${weather.windSpeed}m/s ${getWindDirection(weather.windDeg)}` },
                  { icon: "👁️", label: "Visibility", value: weather.visibility !== null ? `${weather.visibility}km` : "N/A" },
                  { icon: "🌡️", label: "Pressure", value: weather.pressure !== null ? `${weather.pressure}hPa` : "N/A" },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center py-4 px-1">
                    <span className="text-xl mb-1">{item.icon}</span>
                    <span className="text-xs text-gray-400">{item.label}</span>
                    <span className="text-xs font-bold text-gray-800 text-center mt-0.5">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Cloud cover */}
              {weather.clouds !== null && (
                <div className="px-5 py-3 border-b border-gray-100">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs text-gray-500">☁️ Cloud Cover</span>
                    <span className="text-xs font-bold text-gray-800">{weather.clouds}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-gray-300 to-slate-500 rounded-full transition-all duration-700"
                      style={{ width: `${weather.clouds}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Sunrise / Sunset */}
              {(weather.sunrise || weather.sunset) && (
                <div className="grid grid-cols-2 gap-3 px-5 py-4 border-b border-gray-100">
                  {weather.sunrise && (
                    <div className="flex items-center gap-3 bg-amber-50 rounded-2xl p-3">
                      <span className="text-2xl">🌅</span>
                      <div>
                        <p className="text-xs text-amber-600">Sunrise</p>
                        <p className="font-bold text-amber-800">{weather.sunrise}</p>
                      </div>
                    </div>
                  )}
                  {weather.sunset && (
                    <div className="flex items-center gap-3 bg-orange-50 rounded-2xl p-3">
                      <span className="text-2xl">🌇</span>
                      <div>
                        <p className="text-xs text-orange-600">Sunset</p>
                        <p className="font-bold text-orange-800">{weather.sunset}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Hourly Forecast */}
              {weather.hourlyForecast.length > 0 && (
                <div className="px-5 py-4 border-b border-gray-100">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Hourly Forecast (Every 3 hours)
                  </h3>
                  <div className="grid grid-cols-6 gap-2">
                    {weather.hourlyForecast.map((h, i) => (
                      <div key={i} className="flex flex-col items-center gap-1 bg-gray-50 rounded-2xl py-3 px-1">
                        <span className="text-xs text-gray-500 text-center leading-tight">{h.time}</span>
                        <span className="text-2xl">{WEATHER_EMOJI[h.condition] || "🌤️"}</span>
                        <span className="text-sm font-bold text-gray-900">{h.temp}°</span>
                        {h.pop > 0 && (
                          <span className="text-xs text-blue-500 font-medium">{h.pop}%💧</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 6-Day Forecast */}
              {weather.dailyForecast.length > 0 && (
                <div className="px-5 py-4">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    6-Day Forecast
                  </h3>
                  <div className="space-y-2">
                    {weather.dailyForecast.map((day, i) => (
                      <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3">
                        <span className="text-2xl w-8 flex-shrink-0">
                          {WEATHER_EMOJI[day.condition] || "🌤️"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900">
                            {i === 0 ? "Today" : day.date}
                          </p>
                          <p className="text-xs text-gray-500 capitalize truncate">
                            {capitalize(day.description)}
                          </p>
                        </div>
                        {day.pop > 0 && (
                          <span className="text-xs text-blue-500 font-medium flex-shrink-0">
                            {day.pop}%💧
                          </span>
                        )}
                        <div className="flex items-center gap-2 text-sm font-bold flex-shrink-0">
                          <span className="text-gray-900">{day.tempMax}°</span>
                          <span className="text-gray-400">{day.tempMin}°</span>
                        </div>
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden hidden sm:block flex-shrink-0">
                          <div
                            className="h-full bg-gradient-to-r from-blue-400 to-orange-400 rounded-full"
                            style={{
                              width: `${Math.min(100, Math.max(10, ((day.tempMax - 15) / 20) * 100))}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="px-5 pb-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span>📍 {currentLabel}, Bangladesh</span>
                  {deviceIp && locationSource !== "manual" && (
                    <span className="px-2 py-0.5 bg-gray-100 rounded-full font-mono">
                      {deviceIp}
                    </span>
                  )}
                </div>
                <span>
                  🕐{" "}
                  {lastUpdated
                    ? lastUpdated.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Just now"}{" "}
                  • OpenWeatherMap
                </span>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* DIVISION CAPITALS */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Division Capitals
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleMyLocation}
            disabled={locationLoading}
            className={`px-4 py-2 rounded-full text-sm font-medium transition border ${
              locationSource !== "manual"
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-white text-emerald-600 border-emerald-300 hover:bg-emerald-50"
            }`}
          >
            {locationLoading ? "..." : "📡 My Location"}
          </button>
          {DIVISION_CAPITALS.map((district) => (
            <button
              key={district}
              onClick={() => handleDistrictSelect(district)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition border ${
                selectedDistrict === district
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
              }`}
            >
              {district}
            </button>
          ))}
        </div>
      </div>

      {/* ALL 64 DISTRICTS */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-gray-900 flex items-center gap-2">
            <span>🗺️</span>
            <span>All 64 Districts of Bangladesh</span>
          </h4>
          <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {ALL_DISTRICTS.length} Districts
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {ALL_DISTRICTS.map((district) => {
            const isActive =
              selectedDistrict === district ||
              (!selectedDistrict && detectedDistrict === district)
            return (
              <button
                key={district}
                onClick={() => handleDistrictSelect(district)}
                title={district}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition text-left truncate border ${
                  isActive
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-gray-50 text-gray-700 border-gray-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
                }`}
              >
                {isActive && "✓ "}
                {district}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}