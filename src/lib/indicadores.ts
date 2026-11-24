import { API_URL } from "@/config/api";

export type Cumplimiento = { completadas: number; asignadas: number; porcentaje: number };
export type StockCritico = { hoy: number; ayer: number | null; variacion: number | null };
export type RutaPromotor = { correo: string; nombre: string; visitadas: number; asignadas: number; porcentaje: number };
export type TareasTienda = {
  idTienda: number;
  nombre: string;
  ubicacion: string | null;
  completadas: number;
  asignadas: number;
  porcentaje: number;
};

export type Indicadores = {
  zona: Cumplimiento;
  stockCritico: StockCritico;
  rutas: RutaPromotor[];
  tiendas: TareasTienda[];
};

export async function leerIndicadores(token: string): Promise<Indicadores> {
  const res = await fetch(`${API_URL}/api/indicadores`, { headers: { Authorization: token } });
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
}

export function colorPorcentaje(pct: number) {
  if (pct >= 100) return { barra: "#4F8BF5", texto: "#2450C2", fondo: "#E6EEFF" };
  if (pct >= 50) return { barra: "#3FD6A0", texto: "#0A6D7D", fondo: "#E3F5F5" };
  return { barra: "#FF7A9C", texto: "#C4202F", fondo: "#FDECEC" };
}
