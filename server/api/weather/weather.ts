import { defineEventHandler, getQuery } from 'h3'

interface WeatherResponse {
  city?: string
  condition?: string
  temp?: number
  error?: boolean
  message?: string
}

const getWeatherDescription = (code: number) => {
  if (code === 0) return 'Clear'
  if (code === 1 || code === 2) return 'Growing clouds'
  if (code === 3) return 'Cloudy'
  if (code >= 45 && code <= 48) return 'Mist'
  if (code >= 51 && code <= 67) return 'Rain'
  if (code >= 71 && code <= 77) return 'Snowfall'
  if (code >= 80 && code <= 82) return 'Rain showers'
  if (code >= 95) return 'Thunder'
  return 'Unknown Weather'
}

export default defineEventHandler(async (event): Promise<WeatherResponse> => {
  const query = getQuery(event)
  const lat = query.lat
  const lon = query.lon

  if (!lat || !lon) {
    return {
      error: true,
      message: 'Saknar koordinater (lat/lon)'
    }
  }

  try {
    const geoPromise = $fetch<any>(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
    const weatherPromise = $fetch<any>(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
    const [geoRes, weatherRes] = await Promise.all([geoPromise, weatherPromise])
    const city = geoRes.address?.city || geoRes.address?.town || geoRes.address?.village || 'Okänd ort'
    const countryCode = geoRes.address?.country_code?.toUpperCase() || ''
    const currentTemp = Math.round(weatherRes.current_weather.temperature)
    const weatherCode = weatherRes.current_weather.weathercode

    return {
      city: `${city}${countryCode ? ', ' + countryCode : ''}`,
      condition: getWeatherDescription(weatherCode),
      temp: currentTemp
    }

  } catch (error) {
    console.error('Kunde inte hämta väderdata i server-api:', error)
    return {
      error: true,
      message: 'Något gick fel vid hämtning av väderdata'
    }
  }
})