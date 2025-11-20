import { Shipment, isProvider, isSize } from "./types";

export function parseShipment(line: string): Shipment | null {
  const parts = line.trim().split(/\s+/);
  if (parts.length !== 3) return null;

  const [date, sizeCode, providerCode] = parts;
  if (!isSize(sizeCode) || !isProvider(providerCode)) return null;

  const monthKey = date.substring(0, 7); // "YYYY-MM"

  return { date, size: sizeCode, provider: providerCode, monthKey };
}
