
export interface WeatherData {
  temp: number;
  condition: string;
  code: number;
}

export const weatherService = {
  async getCurrentWeather(): Promise<WeatherData | null> {
    if (!('geolocation' in navigator)) {
      console.warn("Geolocation not available");
      return null;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Using Open-Meteo (Free, no key required)
          const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&temperature_unit=fahrenheit`
          );
          
          if (!res.ok) throw new Error("Weather fetch failed");
          
          const data = await res.json();
          const temp = Math.round(data.current.temperature_2m);
          const code = data.current.weather_code;
          
          // Simple condition mapping
          // WMO Weather interpretation codes (https://open-meteo.com/en/docs)
          // 0: Clear sky
          // 1, 2, 3: Mainly clear, partly cloudy, and overcast
          // 45, 48: Fog
          // 51-67: Drizzle / Rain
          // 71-77: Snow
          // 95-99: Thunderstorm
          let condition = "Clear";
          if (code > 0 && code <= 3) condition = "Cloudy";
          else if (code >= 51 && code <= 67) condition = "Rain";
          else if (code >= 71 && code <= 77) condition = "Snow";
          else if (code >= 95) condition = "Storm";

          resolve({ temp, condition, code });
        } catch (e) {
          console.error("Weather error:", e);
          resolve(null);
        }
      }, (err) => {
        console.warn("Location permission denied or unavailable:", err);
        resolve(null);
      }, { timeout: 10000 });
    });
  }
};
