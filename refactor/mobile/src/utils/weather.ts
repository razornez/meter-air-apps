export interface WeatherData {
  temp: number;
  description: string;
  icon: string;
  humidity?: number;
  windSpeed?: number;
}

// WMO Weather code → deskripsi + emoji (bilingual)
const WMO_ID: Record<number, [string, string, string]> = {
  0:  ['Cerah', 'Clear', '☀️'],
  1:  ['Cerah Berawan', 'Mostly Clear', '🌤️'],
  2:  ['Berawan Sebagian', 'Partly Cloudy', '⛅'],
  3:  ['Mendung', 'Overcast', '☁️'],
  45: ['Berkabut', 'Foggy', '🌫️'],
  48: ['Embun Beku', 'Icy Fog', '🌫️'],
  51: ['Gerimis Ringan', 'Light Drizzle', '🌦️'],
  53: ['Gerimis', 'Drizzle', '🌦️'],
  55: ['Gerimis Lebat', 'Heavy Drizzle', '🌧️'],
  61: ['Hujan Ringan', 'Light Rain', '🌧️'],
  63: ['Hujan', 'Rain', '🌧️'],
  65: ['Hujan Lebat', 'Heavy Rain', '🌧️'],
  71: ['Salju Ringan', 'Light Snow', '🌨️'],
  73: ['Salju', 'Snow', '❄️'],
  75: ['Salju Lebat', 'Heavy Snow', '❄️'],
  80: ['Hujan Deras', 'Rain Shower', '🌦️'],
  81: ['Hujan Deras', 'Rain Showers', '🌧️'],
  82: ['Hujan Sangat Deras', 'Heavy Showers', '⛈️'],
  95: ['Badai Petir', 'Thunderstorm', '⛈️'],
  96: ['Badai Petir', 'Thunderstorm', '⛈️'],
  99: ['Badai Petir Lebat', 'Heavy Thunderstorm', '⛈️'],
};

export function wmoToWeather(code: number, lang: 'id' | 'en' = 'id'): { description: string; icon: string } {
  const entry = WMO_ID[code] ?? WMO_ID[0];
  return { description: lang === 'id' ? entry[0] : entry[1], icon: entry[2] };
}

export async function fetchWeather(lat: number, lon: number, lang: 'id' | 'en' = 'id'): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Weather fetch failed');
  const data = await res.json();
  const cur = data.current;
  const { description, icon } = wmoToWeather(cur.weather_code, lang);
  return {
    temp: Math.round(cur.temperature_2m),
    description,
    icon,
    humidity: cur.relative_humidity_2m,
    windSpeed: Math.round(cur.wind_speed_10m),
  };
}
