import Constants from "expo-constants";
import { Platform } from "react-native";

const manual = process.env.EXPO_PUBLIC_API_URL;

const hostExpo = Constants.expoConfig?.hostUri?.split(":")[0] ?? "";
const esIP = /^\d{1,3}(\.\d{1,3}){3}$/.test(hostExpo);

export const API_URL =
  manual ??
  (Platform.OS === "web"
    ? "http://localhost:8090"
    : `http://${esIP ? hostExpo : "10.0.2.2"}:8090`);

console.log("API_URL en uso:", API_URL);

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