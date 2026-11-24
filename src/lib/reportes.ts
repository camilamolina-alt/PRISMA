import { API_URL } from "@/config/api";

export type ReporteCierre = {
  idReporte: number;
  correoPromotor: string;
  fotoURL: string;
  latitud: number;
  longitud: number;
  precisionMT: number | null;
  comentario: string | null;
  fecha: string;
};

export type ReporteProblema = {
  idProblemas: number;
  correoPromotor: string;
  fotoURL: string;
  comentario: string;
  fecha: string;
};

export type Promotor = { id: string; name: string; correo: string; rol: string };

async function leer<T>(ruta: string, token: string): Promise<T> {
  const res = await fetch(`${API_URL}${ruta}`, { headers: { Authorization: token } });
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
}

export const leerCierres = (token: string) => leer<ReporteCierre[]>("/api/reportes/cierre", token);
export const leerProblemas = (token: string) => leer<ReporteProblema[]>("/api/reportes/problema", token);

export async function leerPromotores(token: string) {
  const usuarios = await leer<Promotor[]>("/usuarios/mi-equipo", token);
  return usuarios.filter((u) => u.rol?.toLowerCase() === "promotor");
}

export const urlFoto = (fotoURL: string) => `${API_URL}${fotoURL}`;

export const urlMapa = (lat: number, lng: number) => `https://www.google.com/maps?q=${lat},${lng}`;

export function esHoy(iso: string) {
  const d = new Date(iso);
  const hoy = new Date();
  return d.getFullYear() === hoy.getFullYear() && d.getMonth() === hoy.getMonth() && d.getDate() === hoy.getDate();
}

export const hora = (iso: string) =>
  new Date(iso).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });

export const fechaLarga = (iso: string) =>
  new Date(iso).toLocaleDateString("es-CL", { weekday: "short", day: "numeric", month: "short" }) + " · " + hora(iso);

export function iniciales(nombre: string) {
  return nombre
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
