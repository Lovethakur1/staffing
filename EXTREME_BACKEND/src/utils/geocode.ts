/**
 * Geocoding utility using OpenStreetMap Nominatim API (free, no API key needed).
 * Converts address strings to latitude/longitude coordinates.
 */

interface GeoResult {
  lat: number;
  lng: number;
}

async function nominatimSearch(query: string): Promise<GeoResult | null> {
  const encoded = encodeURIComponent(query.trim());
  const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`;

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'ExtremeStaffingApp/1.0',
      'Accept': 'application/json',
    },
  });

  if (!res.ok) return null;

  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) return null;

  const lat = parseFloat(data[0].lat);
  const lng = parseFloat(data[0].lon);

  if (isNaN(lat) || isNaN(lng)) return null;
  return { lat, lng };
}

export async function geocodeAddress(address: string): Promise<GeoResult | null> {
  if (!address || address.trim().length < 3) return null;

  try {
    // Try full address first
    let result = await nominatimSearch(address);
    if (result) return result;

    // Try removing building/complex names (keep area, city, state, zip)
    const parts = address.split(',').map(p => p.trim()).filter(Boolean);
    if (parts.length > 2) {
      // Try last N parts (area, city, state)
      for (let skip = 1; skip < parts.length - 1; skip++) {
        const simpler = parts.slice(skip).join(', ');
        result = await nominatimSearch(simpler);
        if (result) return result;
      }
    }

    return null;
  } catch {
    console.error('[geocode] Failed to geocode address:', address);
    return null;
  }
}
