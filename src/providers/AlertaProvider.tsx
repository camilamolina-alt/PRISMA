import { Client } from "@stomp/stompjs";
import { useRouter } from "expo-router";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Alert, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { API_URL } from "../config/api";
import { NivelAlerta } from "../data/alertas";
import { useAuthSession } from "./AuthProvider";

// Convierte http://... a ws://.../ws
const WS_URL = API_URL.replace(/^http/, "ws") + "/ws";

export type AlertaViva = {
  id: string;
  nivel: NivelAlerta;
  titulo: string;
  detalle: string;
  fecha: string;
  nueva: boolean;
};

type AlertasContextType = {
  alertas: AlertaViva[];
  conectado: boolean;
  recargar: () => Promise<void>;
  marcarLeida: (id: string) => void;
  marcarTodas: () => void;
};

const AlertasContext = createContext<AlertasContextType>({
  alertas: [],
  conectado: false,
  recargar: async () => {},
  marcarLeida: () => {},
  marcarTodas: () => {},
});

const COLORES: Record<NivelAlerta, string> = {
  critico: "#dc2626",
  retraso: "#d97706",
  pendiente: "#6b7280",
};

export function AlertasProvider({ children }: { children: ReactNode }) {
  const { token } = useAuthSession();
  const router = useRouter();
  const [alertas, setAlertas] = useState<AlertaViva[]>([]);
  const [conectado, setConectado] = useState(false);
  const [banner, setBanner] = useState<AlertaViva | null>(null);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mostrarBanner = useCallback((alerta: AlertaViva) => {
    setBanner(alerta);
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => setBanner(null), 6000);
  }, []);

  const recargar = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/stock/critico`, {
        headers: { Authorization: token },
      });
      if (!res.ok) return;
      const criticos = await res.json();
      setAlertas((prev) =>
        criticos.map((s: any): AlertaViva => {
          const id = `${s.producto?.nombre ?? "prod"}-${s.tienda?.idTienda ?? "tienda"}`;
          const previa = prev.find((a) => a.id === id);
          return {
            id,
            nivel: "critico",
            titulo: "Stock crítico",
            detalle: `${s.producto?.nombre} (${s.cant_sala ?? 0} unidades)`,
            fecha: new Date().toISOString(),
            nueva: previa?.nueva ?? false,
          };
        })
      );
    } catch {}
  }, [token]);

  useEffect(() => {
    if (!token) {
      setAlertas([]);
      setConectado(false);
      setBanner(null);
      return;
    }

    recargar();

    const client = new Client({
      brokerURL: WS_URL,
      reconnectDelay: 3000,
      onConnect: () => {
        setConectado(true);
        client.subscribe("/topic/alertas", (msg) => {
          // Ventana de aviso nativa para confirmar que llegó
          if (Platform.OS === "web") {
            window.alert("⚠️ ¡Alerta Crítica Recibida!: " + msg.body);
          } else {
            Alert.alert("⚠️ Alerta Crítica Recibida", msg.body);
          }

          try {
            const d = JSON.parse(msg.body);
            const nueva: AlertaViva = {
              id: `${d.producto}-${d.idTienda}-${Date.now()}`,
              nivel: d.nivel || "critico",
              titulo: d.nivel === "critico" ? "Stock crítico" : "Alerta",
              detalle: String(d.mensaje || "").replace(/^[^:]*:\s*/, ""),
              fecha: new Date().toISOString(),
              nueva: true,
            };
            setAlertas((prev) => [nueva, ...prev.filter((a) => a.id !== nueva.id)]);
            mostrarBanner(nueva);
          } catch (e) {
            console.error("Error al procesar alerta:", e);
          }
        });
      },
      onWebSocketClose: () => setConectado(false),
      onStompError: () => setConectado(false),
    });

    client.activate();

    return () => {
      client.deactivate();
      if (temporizador.current) clearTimeout(temporizador.current);
    };
  }, [token, recargar, mostrarBanner]);

  const marcarLeida = useCallback((id: string) => {
    setAlertas((prev) => prev.map((a) => (a.id === id ? { ...a, nueva: false } : a)));
  }, []);

  const marcarTodas = useCallback(() => {
    setAlertas((prev) => prev.map((a) => ({ ...a, nueva: false })));
  }, []);

  return (
    <AlertasContext.Provider
      value={{ alertas, conectado, recargar, marcarLeida, marcarTodas }}
    >
      <View style={{ flex: 1, position: "relative" }}>
        {children}

        {banner && (
          <Pressable
            style={[
              styles.banner,
              { backgroundColor: COLORES[banner.nivel] || "#dc2626" },
            ]}
            onPress={() => {
              setBanner(null);
              router.push("/alertas");
            }}
          >
            <Text style={styles.bannerTitulo}>⚠️ {banner.titulo}</Text>
            <Text style={styles.bannerDetalle}>{banner.detalle}</Text>
          </Pressable>
        )}
      </View>
    </AlertasContext.Provider>
  );
}

export const useAlertas = () => useContext(AlertasContext);

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    top: Platform.OS === "web" ? 20 : 50,
    left: 16,
    right: 16,
    padding: 16,
    borderRadius: 12,
    zIndex: 99999,
    elevation: 99,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  bannerTitulo: { color: "#fff", fontWeight: "700", fontSize: 16 },
  bannerDetalle: { color: "#fff", marginTop: 4, fontSize: 14 },
});