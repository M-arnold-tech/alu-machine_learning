import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Rwanda district coordinates
const RWANDA_DISTRICTS: Record<string, { lat: number; lon: number }> = {
  Kigali:    { lat: -1.9441, lon: 30.0619 },
  Musanze:   { lat: -1.5008, lon: 29.6349 },
  Huye:      { lat: -2.5956, lon: 29.7391 },
  Rubavu:    { lat: -1.6820, lon: 29.3479 },
  Rwamagana: { lat: -1.9492, lon: 30.4348 },
  Nyagatare: { lat: -1.2959, lon: 30.3257 },
  Muhanga:   { lat: -2.0836, lon: 29.7539 },
};

export interface WeatherData {
  district: string;
  temperature: number;    // °C
  humidity: number;       // %
  rainfall: number;       // mm (today's accumulation)
  windspeed: number;      // km/h
  condition: string;
  warning?: string;
  fetchedAt: string;
  source: string;
}

/** Map WMO weather-code to a human-readable label */
function describeWmoCode(code: number): string {
  if (code === 0)               return 'Clear Sky';
  if (code <= 2)                return 'Partly Cloudy';
  if (code === 3)               return 'Overcast';
  if (code <= 49)               return 'Foggy';
  if (code <= 59)               return 'Drizzle';
  if (code <= 69)               return 'Rain';
  if (code <= 79)               return 'Snow / Sleet';
  if (code <= 84)               return 'Rain Showers';
  if (code <= 99)               return 'Thunderstorm';
  return 'Unknown';
}

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);

  constructor(private readonly config: ConfigService) {}

  async getWeatherForDistrict(district: string): Promise<WeatherData> {
    const normalised = Object.keys(RWANDA_DISTRICTS).find(
      (k) => k.toLowerCase() === district.toLowerCase(),
    );
    if (!normalised) {
      throw new BadRequestException(
        `Unknown district "${district}". Known districts: ${Object.keys(RWANDA_DISTRICTS).join(', ')}`,
      );
    }

    const { lat, lon } = RWANDA_DISTRICTS[normalised];
    const baseUrl = this.config.get<string>('weather.apiUrl')!;

    const url =
      `${baseUrl}?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,relative_humidity_2m,precipitation,weathercode,windspeed_10m` +
      `&daily=precipitation_sum` +
      `&timezone=Africa%2FNairobi` +
      `&forecast_days=1`;

    this.logger.log(`Fetching Open-Meteo weather for ${normalised}: ${url}`);

    let raw: any;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      raw = await res.json();
    } catch (err: any) {
      this.logger.error(`Open-Meteo fetch failed: ${err.message}`);
      throw new Error(`Weather service unavailable: ${err.message}`);
    }

    const c = raw.current;
    const rainfall = raw.daily?.precipitation_sum?.[0] ?? c.precipitation ?? 0;

    const data: WeatherData = {
      district: normalised,
      temperature: Math.round(c.temperature_2m),
      humidity:    Math.round(c.relative_humidity_2m),
      windspeed:   Math.round(c.windspeed_10m),
      rainfall:    Math.round(rainfall * 10) / 10,
      condition:   describeWmoCode(c.weathercode),
      fetchedAt:   c.time,
      source:      'Open-Meteo (open-meteo.com)',
    };

    if (data.rainfall > 15) {
      data.warning = '⚠️ Heavy rainfall expected. Consider delaying irrigation and protecting seedlings.';
    }

    return data;
  }

  /** Return the list of supported district names */
  getSupportedDistricts(): string[] {
    return Object.keys(RWANDA_DISTRICTS);
  }
}

