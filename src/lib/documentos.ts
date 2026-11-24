import { API_URL } from "@/config/api";
import { Directory, File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

export type Documento = {
  idImportar: number;
  nombreArchivo: string;
  tipo: string;
  correoUsuario: string;
  mensaje: string | null;
  oki: boolean;
  fecha: string;
};

export async function leerDocumentos(token: string): Promise<Documento[]> {
  const res = await fetch(`${API_URL}/api/importaciones`, { headers: { Authorization: token } });
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
}

export async function abrirDocumento(doc: Documento, token: string) {
  const url = `${API_URL}/api/importaciones/${doc.idImportar}/archivo`;

  if (Platform.OS === "web") {
    const res = await fetch(url, { headers: { Authorization: token } });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    const enlace = URL.createObjectURL(await res.blob());
    const a = document.createElement("a");
    a.href = enlace;
    a.download = doc.nombreArchivo;
    a.click();
    URL.revokeObjectURL(enlace);
    return;
  }

  const carpeta = new Directory(Paths.cache, "documentos", String(doc.idImportar));
  carpeta.create({ idempotent: true, intermediates: true });
  const destino = new File(carpeta, doc.nombreArchivo);
  if (!destino.exists) {
    const tarea = File.createDownloadTask(url, destino, { headers: { Authorization: token } });
    const bajado = await tarea.downloadAsync();
    if (!bajado) throw new Error("No se pudo descargar");
  }

  if (!(await Sharing.isAvailableAsync())) throw new Error("No se puede abrir en este dispositivo");
  await Sharing.shareAsync(destino.uri, {
    mimeType: Platform.OS === "android" ? mimePorNombre(doc.nombreArchivo) : undefined,
    dialogTitle: doc.nombreArchivo,
  });
}

function mimePorNombre(nombre: string) {
  return nombre.toLowerCase().endsWith(".xls")
    ? "application/vnd.ms-excel"
    : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
}

export const nombreTipo: Record<string, string> = {
  tiendas: "Planilla de tiendas",
  envios: "Planilla de envíos",
  promociones: "Promociones y precios",
  eventos: "Eventos",
};

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
