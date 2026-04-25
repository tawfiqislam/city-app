import { NextRequest, NextResponse } from "next/server"

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || ""

const DISTRICT_NAME_MAP: Record<string, string> = {
  "Barishal": "Barisal",
  "Barguna": "Barguna",
  "Bhola": "Bhola",
  "Jhalokati": "Jhalokathi",
  "Patuakhali": "Patuakhali",
  "Pirojpur": "Pirojpur",
  "Chattogram": "Chittagong",
  "Cumilla": "Comilla",
  "Cox's Bazar": "Cox's Bazar",
  "Feni": "Feni",
  "Khagrachari": "Khagrachhari",
  "Lakshmipur": "Lakshmipur",
  "Noakhali": "Noakhali",
  "Rangamati": "Rangamati",
  "Bandarban": "Bandarban",
  "Brahmanbaria": "Brahmanbaria",
  "Chandpur": "Chandpur",
  "Chapai Nawabganj": "Nawabganj",
  "Bogura": "Bogra",
  "Joypurhat": "Joypurhat",
  "Naogaon": "Naogaon",
  "Natore": "Natore",
  "Pabna": "Pabna",
  "Sirajganj": "Sirajganj",
  "Moulvibazar": "Maulvibazar",
  "Habiganj": "Habiganj",
  "Sunamganj": "Sunamganj",
  "Jhenaidah": "Jhenida",
  "Chuadanga": "Chuadanga",
  "Meherpur": "Meherpur",
  "Narail": "Narail",
  "Bagerhat": "Bagerhat",
  "Satkhira": "Satkhira",
  "Magura": "Magura",
  "Kushtia": "Kushtia",
  "Jessore": "Jessore",
  "Munshiganj": "Munshiganj",
  "Manikganj": "Manikganj",
  "Madaripur": "Madaripur",
  "Shariatpur": "Shariatpur",
  "Gopalganj": "Gopalganj",
  "Rajbari": "Rajbari",
  "Faridpur": "Faridpur",
  "Kishoreganj": "Kishoreganj",
  "Narsingdi": "Narsingdi",
  "Narayanganj": "Narayanganj",
  "Gazipur": "Gazipur",
  "Tangail": "Tangail",
  "Netrokona": "Netrakona",
  "Sherpur": "Sherpur",
  "Jamalpur": "Jamalpur",
  "Dinajpur": "Dinajpur",
  "Gaibandha": "Gaibandha",
  "Kurigram": "Kurigram",
  "Lalmonirhat": "Lalmonirhat",
  "Nilphamari": "Nilphamari",
  "Panchagarh": "Panchagarh",
  "Thakurgaon": "Thakurgaon",
}

// All 64 Bangladesh districts
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

// Map any name to clean district
const REVERSE_MAP: Record<string, string> = {
  "Chittagong": "Chattogram",
  "Comilla": "Cumilla",
  "Barisal": "Barishal",
  "Jhalokathi": "Jhalokati",
  "Khagrachhari": "Khagrachari",
  "Nawabganj": "Chapai Nawabganj",
  "Bogra": "Bogura",
  "Maulvibazar": "Moulvibazar",
  "Jhenida": "Jhenaidah",
  "Netrakona": "Netrokona",
  "Tongi": "Gazipur",
  "Savar": "Dhaka",
  "Mirpur": "Dhaka",
  "Uttara": "Dhaka",
  "Gulshan": "Dhaka",
  "Dhanmondi": "Dhaka",
  "Motijheel": "Dhaka",
  "Wari": "Dhaka",
  "Banani": "Dhaka",
  "Tejgaon": "Dhaka",
  "Mohammadpur": "Dhaka",
  "Khilgaon": "Dhaka",
  "Rampura": "Dhaka",
  "Badda": "Dhaka",
  "Demra": "Dhaka",
  "Lalbagh": "Dhaka",
  "Hazaribagh": "Dhaka",
  "Keraniganj": "Dhaka",
  "Dohar": "Dhaka",
  "Nawabganj District": "Dhaka",
}

function findNearestDistrict(cityName: string): string | null {
  if (!cityName) return null

  // Direct match
  if (REVERSE_MAP[cityName]) return REVERSE_MAP[cityName]

  // Check if it IS a district already
  const direct = ALL_DISTRICTS.find(
    (d) => d.toLowerCase() === cityName.toLowerCase()
  )
  if (direct) return direct

  // Partial match
  const partial = ALL_DISTRICTS.find(
    (d) =>
      cityName.toLowerCase().includes(d.toLowerCase()) ||
      d.toLowerCase().includes(cityName.toLowerCase())
  )
  if (partial) return partial

  return null
}

async function buildWeatherResponse(current: any, forecast: any, displayLabel: string) {
  const weatherMain = current.weather?.[0]?.main || "Clear"
  const weatherDescription = current.weather?.[0]?.description || ""
  const icon = current.weather?.[0]?.icon || "01d"
  const temp = Math.round(current.main?.temp ?? 0)
  const feelsLike = Math.round(current.main?.feels_like ?? 0)
  const tempMin = Math.round(current.main?.temp_min ?? 0)
  const tempMax = Math.round(current.main?.temp_max ?? 0)
  const humidity = current.main?.humidity ?? 0
  const windSpeed = current.wind?.speed ?? 0
  const windDeg = current.wind?.deg ?? 0
  const visibility = current.visibility ? Math.round(current.visibility / 1000) : null
  const pressure = current.main?.pressure ?? null
  const clouds = current.clouds?.all ?? null
  const sunrise = current.sys?.sunrise
    ? new Date(current.sys.sunrise * 1000).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : null
  const sunset = current.sys?.sunset
    ? new Date(current.sys.sunset * 1000).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : null

  const severeConditions = ["Thunderstorm", "Tornado", "Squall"]
  const warningConditions = ["Rain", "Drizzle", "Snow"]
  let alertLevel = "normal"
  let alertMessage = ""
  if (severeConditions.includes(weatherMain)) {
    alertLevel = "danger"
    alertMessage = "Severe weather detected. Stay indoors and take precautions."
  } else if (warningConditions.includes(weatherMain)) {
    alertLevel = "warning"
    alertMessage = "Rain or wet conditions expected."
  }

  const hourlyForecast = forecast?.list?.slice(0, 6).map((item: any) => ({
    time: new Date(item.dt * 1000).toLocaleTimeString("en-US", {
      hour: "2-digit", minute: "2-digit", hour12: true,
    }),
    temp: Math.round(item.main?.temp ?? 0),
    condition: item.weather?.[0]?.main || "Clear",
    description: item.weather?.[0]?.description || "",
    icon: item.weather?.[0]?.icon || "01d",
    humidity: item.main?.humidity ?? 0,
    windSpeed: item.wind?.speed ?? 0,
    pop: Math.round((item.pop ?? 0) * 100),
  })) || []

  const dailyMap: Record<string, any[]> = {}
  forecast?.list?.forEach((item: any) => {
    const date = new Date(item.dt * 1000).toLocaleDateString("en-US", {
      weekday: "short", month: "short", day: "numeric",
    })
    if (!dailyMap[date]) dailyMap[date] = []
    dailyMap[date].push(item)
  })

  const dailyForecast = Object.entries(dailyMap).slice(0, 6).map(([date, items]) => {
    const temps = items.map((i) => i.main?.temp ?? 0)
    const pops = items.map((i) => i.pop ?? 0)
    const mid = items[Math.floor(items.length / 2)]
    return {
      date,
      tempMin: Math.round(Math.min(...temps)),
      tempMax: Math.round(Math.max(...temps)),
      condition: mid?.weather?.[0]?.main || "Clear",
      description: mid?.weather?.[0]?.description || "",
      icon: mid?.weather?.[0]?.icon || "01d",
      pop: Math.round(Math.max(...pops) * 100),
      humidity: Math.round(items.reduce((s, i) => s + (i.main?.humidity ?? 0), 0) / items.length),
    }
  })

  const rawApiCity = current.name || ""
  const cleanDistrict = findNearestDistrict(rawApiCity) || displayLabel

  return {
    success: true,
    city: displayLabel,
    apiCity: cleanDistrict,
    rawApiCity,
    country: current.sys?.country || "BD",
    lat: current.coord?.lat,
    lon: current.coord?.lon,
    temperature: temp,
    feelsLike,
    tempMin,
    tempMax,
    humidity,
    windSpeed,
    windDeg,
    visibility,
    pressure,
    clouds,
    sunrise,
    sunset,
    condition: weatherMain,
    description: weatherDescription,
    icon,
    alertLevel,
    alertMessage,
    hourlyForecast,
    dailyForecast,
    updatedAt: new Date().toISOString(),
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!OPENWEATHER_API_KEY) {
      return NextResponse.json(
        { error: "OPENWEATHER_API_KEY missing in .env" },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const city = searchParams.get("city")
    const lat = searchParams.get("lat")
    const lon = searchParams.get("lon")

    let currentRes: Response
    let forecastRes: Response
    let displayLabel: string

    if (lat && lon) {
      const latNum = parseFloat(lat)
      const lonNum = parseFloat(lon)
      displayLabel = city || "My Location"

      ;[currentRes, forecastRes] = await Promise.all([
        fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latNum}&lon=${lonNum}&appid=${OPENWEATHER_API_KEY}&units=metric`,
          { cache: "no-store" }
        ),
        fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${latNum}&lon=${lonNum}&appid=${OPENWEATHER_API_KEY}&units=metric&cnt=48`,
          { cache: "no-store" }
        ),
      ])
    } else {
      const districtName = city || "Dhaka"
      const apiCity = DISTRICT_NAME_MAP[districtName] || districtName
      displayLabel = districtName

      ;[currentRes, forecastRes] = await Promise.all([
        fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(apiCity + ",BD")}&appid=${OPENWEATHER_API_KEY}&units=metric`,
          { cache: "no-store" }
        ),
        fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(apiCity + ",BD")}&appid=${OPENWEATHER_API_KEY}&units=metric&cnt=48`,
          { cache: "no-store" }
        ),
      ])
    }

    if (!currentRes.ok) {
      const err = await currentRes.json().catch(() => ({}))
      return NextResponse.json(
        { error: err.message || `Weather not found for ${city}` },
        { status: currentRes.status }
      )
    }

    const current = await currentRes.json()
    const forecast = forecastRes.ok ? await forecastRes.json() : null

    return NextResponse.json(await buildWeatherResponse(current, forecast, displayLabel))
  } catch (error: any) {
    console.error("Weather API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch weather data" },
      { status: 500 }
    )
  }
}