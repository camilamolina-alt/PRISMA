import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Platform } from "react-native";

const manual = process.env.EXPO_PUBLIC_API_URL;

const hostExpo = Constants.expoConfig?.hostUri?.split(":")[0] ?? "";
const esIP = /^\d{1,3}(\.\d{1,3}){3}$/.test(hostExpo);

export const API_URL_AUTO =
  manual ??
  (Platform.OS === "web"
    ? "http://localhost:8090"
    : `http://${esIP ? hostExpo : "10.0.2.2"}:8090`);

export let API_URL = API_URL_AUTO;

const CLAVE_SERVIDOR = "@servidor";

export function normalizarServidor(texto: string) {
  let url = texto.trim().replace(/\/+$/, "");
  if (!url) return "";
  if (!/^https?:\/\//.test(url)) url = "http://" + url;
  if (!/:\d+$/.test(url) && url.startsWith("http://")) url += ":8090";
  return url;
}

export async function cargarServidor() {
  try {
    const guardado = await AsyncStorage.getItem(CLAVE_SERVIDOR);
    API_URL = guardado || API_URL_AUTO;
  } catch {
    API_URL = API_URL_AUTO;
  }
  return API_URL;
}

export async function guardarServidor(texto: string | null) {
  const url = texto ? normalizarServidor(texto) : "";
  if (url) await AsyncStorage.setItem(CLAVE_SERVIDOR, url);
  else await AsyncStorage.removeItem(CLAVE_SERVIDOR);
  API_URL = url || API_URL_AUTO;
  return API_URL;
}

export const wsUrl = () => API_URL.replace(/^http/, "ws") + "/ws";

const cabeceras = (conBody: boolean, token?: string) => ({
  ...(conBody ? { "Content-Type": "application/json" } : {}),
  ...(token ? { Authorization: token } : {}),
});

export const api = {
  get: async (endpoint: string, token?: string) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: cabeceras(false, token),
    });
    if (!response.ok) throw new Error("Error en la petición GET");
    return { data: await response.json() };
  },

  post: async (endpoint: string, body: any, token?: string) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: cabeceras(true, token),
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error("Error en la petición POST");
    return { data: await response.json() };
  },

  put: async (endpoint: string, body: any, token?: string) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "PUT",
      headers: cabeceras(true, token),
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error("Error en la petición PUT");
    return { data: await response.json() };
  },
};