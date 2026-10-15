import { Platform } from "react-native";
export const API_URL =
  Platform.OS === "web" ? "http://localhost:8090" : "http://10.0.2.2:8090";
  