import AsyncStorage from "@react-native-async-storage/async-storage";

// Historial local de planillas subidas (solo en este dispositivo).
// Cuando exista un GET /api/importaciones en el backend, se puede reemplazar por ese fetch.

export type Documento = {
  id: string;
  nombre: string;
  tipo: "tiendas" | "promociones" | "eventos";
  fecha: string; // ISO
  ok: boolean;
  mensaje: string;
};

const CLAVE = "prisma:documentos";
const MAXIMO = 50;

export async function leerDocumentos(): Promise<Documento[]> {
  try {
    const crudo = await AsyncStorage.getItem(CLAVE);
    return crudo ? (JSON.parse(crudo) as Documento[]) : [];
  } catch {
    return [];
  }
}

export async function guardarDocumento(doc: Omit<Documento, "id" | "fecha">) {
  const nuevo: Documento = { ...doc, id: `${Date.now()}`, fecha: new Date().toISOString() };
  const lista = await leerDocumentos();
  try {
    await AsyncStorage.setItem(CLAVE, JSON.stringify([nuevo, ...lista].slice(0, MAXIMO)));
  } catch {
    // si falla el guardado local no bloqueamos la subida
  }
}

export const nombreTipo: Record<Documento["tipo"], string> = {
  tiendas: "Planilla de tiendas",
  promociones: "Promociones y precios",
  eventos: "Eventos",
};

// "Hoy 14:32", "Ayer 09:10" o "05 nov 18:00"
export function fechaCorta(iso: string) {
  const d = new Date(iso);
  const hora = d.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });
  const hoy = new Date();
  const ayer = new Date();
  ayer.setDate(hoy.getDate() - 1);
  if (d.toDateString() === hoy.toDateString()) return `Hoy ${hora}`;
  if (d.toDateString() === ayer.toDateString()) return `Ayer ${hora}`;
  return `${d.toLocaleDateString("es-CL", { day: "2-digit", month: "short" })} ${hora}`;
}
