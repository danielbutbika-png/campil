const z = n => String(n).padStart(2, '0');
const iso = d => `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
export default function forecast() {
  const days = [...Array(16)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return iso(d); });
  const hours = days.flatMap(d => [...Array(24)].map((_, h) => `${d}T${z(h)}:00`));
  const a = v => days.map(() => v);
  return { daily: { time: days, weather_code: a(3), temperature_2m_max: a(26), temperature_2m_min: a(19), apparent_temperature_max: a(29), precipitation_sum: a(0), precipitation_probability_max: a(5), wind_speed_10m_max: a(15), wind_gusts_10m_max: a(30), uv_index_max: a(5), sunrise: days.map(d => d + 'T06:52'), sunset: days.map(d => d + 'T17:54'), relative_humidity_2m_mean: a(79) },
    hourly: { time: hours, temperature_2m: hours.map((_, i) => 20 + 6 * Math.max(0, Math.sin(((i % 24) - 6) / 24 * 2 * Math.PI))), relative_humidity_2m: hours.map(() => 70), precipitation_probability: hours.map(() => 0), wind_speed_10m: hours.map(() => 10), wind_gusts_10m: hours.map(() => 20), weather_code: hours.map(() => 3) }, current: { temperature_2m: 24, relative_humidity_2m: 60, weather_code: 3, wind_speed_10m: 10 } };
}
