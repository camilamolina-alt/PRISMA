import { API_URL } from "@/config/api";

export type EstadoEnvio = "EN_CAMINO" | "POSIBLE_ATRASO" | "NO_LLEGARA" | "ENTREGADO";

// Tal como lo devuelve GET /api/envios (entidad Envio)
export type Envio = {
  idEnvio: number;
  tienda: { idTienda: number; nombre: string; ubicacion: string };
  estado: EstadoEnvio;
  fechaEnvio: string; // LocalDate: "2026-11-12"
  aproxLlegada: string; // LocalDate: "2026-11-20"
  motivo: string | null;
};

export type EnvioDetalle = {
  idDetalle: number;
  producto: { sku: string; nombre: string };
  cantidad: number;
};

const cabeceras = (token: string) => ({ Authorization: token });

// Supervisor: todos los envíos
export async function leerEnvios(token: string): Promise<Envio[]> {
  const res = await fetch(`${API_URL}/api/envios`, { headers: cabeceras(token) });
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
}

// Promotor: los envíos de las tiendas que tiene asignadas
export async function leerMisEnvios(token: string): Promise<Envio[]> {
  const res = await fetch(`${API_URL}/api/asignaciones/mias`, { headers: cabeceras(token) });
  if (!res.ok) throw new Error(`Error ${res.status}`);
  const asignaciones: { tienda: { idTienda: number } }[] = await res.json();
  const ids = [...new Set(asignaciones.map((a) => a.tienda.idTienda))];

  const listas = await Promise.all(
    ids.map(async (id) => {
      const r = await fetch(`${API_URL}/api/envios/tienda/${id}`, { headers: cabeceras(token) });
      return r.ok ? ((await r.json()) as Envio[]) : [];
    })
  );
  return listas.flat().sort((a, b) => a.aproxLlegada.localeCompare(b.aproxLlegada));
}

export async function leerDetalle(idEnvio: number, token: string): Promise<EnvioDetalle[]> {
  const res = await fetch(`${API_URL}/api/envios/${idEnvio}/detalle`, { headers: cabeceras(token) });
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
}

export async function cambiarEstado(
  idEnvio: number,
  cambio: { estado: EstadoEnvio; motivo: string | null; nuevaLlegada: string | null },
  token: string
): Promise<Envio> {
  const res = await fetch(`${API_URL}/api/envios/${idEnvio}/estado`, {
    method: "PUT",
    headers: { ...cabeceras(token), "Content-Type": "application/json" },
    body: JSON.stringify(cambio),
  });
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
}

// ---------- Fechas ----------

// "2026-11-20" -> Date local (sin el desfase de zona horaria que da new Date("2026-11-20"))
export function aFecha(iso: string) {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(a, m - 1, d);
}

// Date -> "2026-11-20", el formato que entiende LocalDate en Spring
export function aIso(fecha: Date) {
  const m = String(fecha.getMonth() + 1).padStart(2, "0");
  const d = String(fecha.getDate()).padStart(2, "0");
  return `${fecha.getFullYear()}-${m}-${d}`;
}

// "jue 20 nov"
export function fechaBonita(iso: string) {
  return aFecha(iso).toLocaleDateString("es-CL", { weekday: "short", day: "numeric", month: "short" });
}

// Días desde hoy hasta la fecha (negativo si ya pasó)
export function diasHasta(iso: string) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return Math.round((aFecha(iso).getTime() - hoy.getTime()) / 86_400_000);
}

// ---------- Estado que se muestra ----------

// Si ya pasó la fecha aprox y nadie lo marcó como entregado, se muestra como posible atraso.
// No se guarda en la BD: se calcula al mostrarlo.
export function estadoVisible(envio: Envio): EstadoEnvio {
  if (envio.estado === "EN_CAMINO" && diasHasta(envio.aproxLlegada) < 0) return "POSIBLE_ATRASO";
  return envio.estado;
}

export const estiloEstado: Record<EstadoEnvio, { texto: string; fondo: string; color: string; icono: string }> = {
  EN_CAMINO: { texto: "En camino", fondo: "#E0F2FE", color: "#075985", icono: "truck-fast-outline" },
  POSIBLE_ATRASO: { texto: "Posible atraso", fondo: "#FFF2DC", color: "#9A5300", icono: "clock-alert-outline" },
  NO_LLEGARA: { texto: "No llegará", fondo: "#FDECEC", color: "#C4202F", icono: "truck-remove-outline" },
  ENTREGADO: { texto: "Entregado", fondo: "#DCF7E5", color: "#11602F", icono: "truck-check-outline" },
};

// La frase principal de la tarjeta, siempre con "aprox." porque no se sabe exacto
export function fraseLlegada(envio: Envio) {
  const estado = estadoVisible(envio);
  const dias = diasHasta(envio.aproxLlegada);
  const fecha = fechaBonita(envio.aproxLlegada);

  if (estado === "ENTREGADO") return "Mercadería entregada";
  if (estado === "NO_LLEGARA") return "Este envío no llegará";
  if (dias < 0) return `Debía llegar aprox. el ${fecha}`;
  const cuando = dias === 0 ? "hoy" : dias === 1 ? "mañana" : `el ${fecha}`;
  if (estado === "POSIBLE_ATRASO") return `Con atraso, llega aprox. ${cuando}`;
  return `Llega aprox. ${cuando}`;
}
