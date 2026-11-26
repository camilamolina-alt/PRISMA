import AsyncStorage from "@react-native-async-storage/async-storage";
import { Client } from "@stomp/stompjs";
import { useGlobalSearchParams, usePathname, useRouter } from "expo-router";
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
import { API_URL, wsUrl } from "../config/api";
import { NivelAlerta } from "../data/alertas";
import { Envio, estadoVisible, fraseLlegada, leerMisEnvios } from "../lib/envios";
import { useAuthSession } from "./AuthProvider";


export type AlertaViva = {
  id: string;
  nivel: NivelAlerta;
  titulo: string;
  detalle: string;
  fecha: string;
  nueva: boolean;
  correo?: string;
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
  pendiente: "#0A6D7D",
};

const esAviso = (id: string) => id.startsWith("tarea-") || id.startsWith("envio-");

const CLAVE_VISTAS = "@tareasVistas";

async function leerVistas(): Promise<string[]> {
  try {
    return JSON.parse((await AsyncStorage.getItem(CLAVE_VISTAS)) ?? "[]");
  } catch {
    return [];
  }
}

async function guardarVistas(ids: string[]) {
  const tareas = ids.filter(esAviso);
  if (tareas.length === 0) return;
  const vistas = await leerVistas();
  try {
    await AsyncStorage.setItem(CLAVE_VISTAS, JSON.stringify([...new Set([...vistas, ...tareas])]));
  } catch {}
}

const PRIORIDAD: Record<NivelAlerta, number> = { critico: 0, retraso: 1, pendiente: 2 };

function ordenar(lista: AlertaViva[]) {
  return [...lista].sort(
    (a, b) => PRIORIDAD[a.nivel] - PRIORIDAD[b.nivel] || b.fecha.localeCompare(a.fecha)
  );
}

function tituloTarea(tipo?: string) {
  if (tipo === "promo") return "Nueva promoción";
  if (tipo === "precio") return "Cambio de precio";
  if (tipo === "repo") return "Reposición pendiente";
  if (tipo === "envio") return "Cambio en tu carga";
  if (tipo === "reporte") return "Fin de jornada";
  if (tipo === "problema") return "Nuevo reporte de problema";
  if (tipo === "mensaje") return "Nuevo mensaje";
  if (tipo === "rol") return "Cambio de rol";
  if (tipo === "tareaLista") return "Tarea completada";
  return "Nueva tarea";
}

const esVivo = (id: string) => id.startsWith("vivo-");

function alertaEnvio(e: Envio): AlertaViva {
  const estado = estadoVisible(e);
  const titulos: Record<string, string> = {
    EN_CAMINO: "Llegada de mercadería",
    POSIBLE_ATRASO: "Posible atraso de carga",
    NO_LLEGARA: "La carga no llegará",
  };
  return {
    id: `envio-${e.idEnvio}-${estado}`,
    nivel: estado === "EN_CAMINO" ? "pendiente" : "retraso",
    titulo: titulos[estado] ?? "Envío",
    detalle: `${e.tienda.nombre}: ${fraseLlegada(e)}${e.motivo ? ` · ${e.motivo}` : ""}`,
    fecha: e.fechaEnvio,
    nueva: false,
  };
}

function alertaStock(tipo: "critico" | "medio", s: any, fecha: string): AlertaViva {
  const producto = s.producto?.nombre ?? "Producto";
  return {
    id: `${tipo}-${producto}-${s.tienda?.idTienda ?? "tienda"}`,
    nivel: tipo === "medio" ? "retraso" : "critico",
    titulo: tipo === "medio" ? "Stock medio" : "Stock crítico",
    detalle: `${producto} (${s.cant_sala ?? 0} de ${s.cant_enviada ?? 0} unidades)${s.tienda?.nombre ? " · " + s.tienda.nombre : ""}`,
    fecha,
    nueva: false,
  };
}

export function AlertasProvider({ children }: { children: ReactNode }) {
  const { token, rol, actualizarRol } = useAuthSession();
  const router = useRouter();
  const [alertas, setAlertas] = useState<AlertaViva[]>([]);
  const [conectado, setConectado] = useState(false);
  const [banner, setBanner] = useState<AlertaViva | null>(null);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  const ruta = usePathname();
  const { correo: correoChat } = useGlobalSearchParams<{ correo?: string }>();
  const enChatCon = useRef<string | undefined>(undefined);
  const misTiendas = useRef<Set<number> | null>(null);
  useEffect(() => {
    enChatCon.current = ruta === "/conversacion" ? correoChat : undefined;
  }, [ruta, correoChat]);

  const mostrarBanner = useCallback((alerta: AlertaViva) => {
    setBanner(alerta);
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => setBanner(null), 6000);
  }, []);

  const recargar = useCallback(async () => {
    if (!token) return;
    const headers = { Authorization: token };
    const leer = async (ruta: string) => {
      try {
        const res = await fetch(`${API_URL}${ruta}`, { headers });
        return res.ok ? await res.json() : [];
      } catch {
        return [];
      }
    };

    const esPromotor = rol === "promotor";
    const esSupervisor = rol === "supervisor";
    const [criticosTodos, mediosTodos, tareas, envios, asignaciones, equipo] = await Promise.all([
      leer("/api/stock/criticos"),
      leer("/api/stock/medios"),
      esPromotor ? leer("/api/tareas/mio") : Promise.resolve([]),
      esPromotor ? leerMisEnvios(token).catch((): Envio[] => []) : Promise.resolve([] as Envio[]),
      esPromotor ? leer("/api/asignaciones/mias") : esSupervisor ? leer("/api/asignaciones") : Promise.resolve([]),
      esSupervisor ? leer("/usuarios/mi-equipo") : Promise.resolve([]),
    ]);

    if (esPromotor || esSupervisor) {
      const correos = new Set((equipo as any[]).map((u) => u.correo));
      misTiendas.current = new Set(
        (asignaciones as any[])
          .filter((a) => esPromotor || correos.has(a.correoPromotor))
          .map((a) => a.tienda?.idTienda)
      );
    } else {
      misTiendas.current = null;
    }
    const esDeMisTiendas = (s: any) => !misTiendas.current || misTiendas.current.has(s.tienda?.idTienda);
    const criticos = criticosTodos.filter(esDeMisTiendas);
    const medios = mediosTodos.filter(esDeMisTiendas);

    const vistas = await leerVistas();
    const ahora = new Date().toISOString();
    const nuevas: AlertaViva[] = [
      ...criticos.map((s: any) => alertaStock("critico", s, ahora)),
      ...medios.map((s: any) => alertaStock("medio", s, ahora)),
      ...tareas.filter((t: any) => !t.checkTarea).map((t: any): AlertaViva => ({
        id: `tarea-${t.idTarea}`,
        nivel: "pendiente",
        titulo: tituloTarea(t.tipo),
        detalle: `${t.nombreTarea} · ${t.tienda?.nombre ?? "Tienda"}`,
        fecha: t.fecha ?? ahora,
        nueva: false,
      })),
      ...envios.filter((e) => e.estado !== "ENTREGADO").map(alertaEnvio),
    ];

    setAlertas((prev) =>
      ordenar([
        ...prev.filter((a) => esVivo(a.id)),
        ...nuevas.map((a) => ({
          ...a,
          nueva: esAviso(a.id)
            ? !vistas.includes(a.id) && (prev.find((p) => p.id === a.id)?.nueva ?? true)
            : prev.find((p) => p.id === a.id)?.nueva ?? false,
        })),
      ])
    );
  }, [token, rol]);

  useEffect(() => {
    if (!token) {
      setAlertas([]);
      setConectado(false);
      setBanner(null);
      return;
    }

    recargar();

    const client = new Client({
      brokerURL: wsUrl(),
      connectHeaders: { Authorization: token },
      reconnectDelay: 5000,
      onConnect: () => {
        setConectado(true);
        client.subscribe("/topic/alertas", (msg) => {
          try {
            const d = JSON.parse(msg.body);
            if (misTiendas.current && !misTiendas.current.has(d.idTienda)) return;
            const nivelStock = d.nivel === "medio" ? "medio" : "critico";
            const base = `${d.producto}-${d.idTienda}`;
            const nueva: AlertaViva = {
              id: `${nivelStock}-${base}`,
              nivel: nivelStock === "medio" ? "retraso" : "critico",
              titulo: nivelStock === "medio" ? "Stock medio" : "Stock crítico",
              detalle: String(d.mensaje || "").replace(/^[^:]*:\s*/, ""),
              fecha: new Date().toISOString(),
              nueva: true,
            };
            setAlertas((prev) =>
              ordenar([nueva, ...prev.filter((a) => a.id !== `critico-${base}` && a.id !== `medio-${base}`)])
            );
            mostrarBanner(nueva);
          } catch (e) {
            console.error("Error al procesar alerta:", e);
          }
        });

        client.subscribe("/user/queue/alertas", (msg) => {
          try {
            const d = JSON.parse(msg.body);

            if (d.nivel === "reporte" || d.nivel === "problema" || d.nivel === "mensaje" || d.nivel === "rol" || d.nivel === "tareaLista") {
              const esMensaje = d.nivel === "mensaje";
              if (esMensaje && enChatCon.current === d.producto) return;
              const nueva: AlertaViva = {
                id: `vivo-${d.nivel}-${Date.now()}`,
                nivel: d.nivel === "problema" || d.nivel === "rol" ? "retraso" : "pendiente",
                titulo: tituloTarea(d.nivel),
                detalle: String(d.mensaje || ""),
                fecha: new Date().toISOString(),
                nueva: true,
                correo: esMensaje ? d.producto : undefined,
              };
              setAlertas((prev) => ordenar([nueva, ...prev]));
              mostrarBanner(nueva);
              if (d.nivel === "rol" && d.producto) actualizarRol(d.producto);
              return;
            }

            const nueva: AlertaViva = {
              id: `tarea-vivo-${Date.now()}`,
              nivel: "pendiente",
              titulo: tituloTarea(d.nivel),
              detalle: String(d.mensaje || ""),
              fecha: new Date().toISOString(),
              nueva: true,
            };
            mostrarBanner(nueva);
            recargar();
          } catch (e) {
            console.error("Error al procesar tarea:", e);
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
  }, [token, recargar, mostrarBanner, actualizarRol]);

  const marcarLeida = useCallback((id: string) => {
    setAlertas((prev) => prev.map((a) => (a.id === id ? { ...a, nueva: false } : a)));
    guardarVistas([id]);
  }, []);

  const marcarTodas = useCallback(() => {
    setAlertas((prev) => {
      guardarVistas(prev.map((a) => a.id));
      return prev.map((a) => ({ ...a, nueva: false }));
    });
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
              if (banner.correo) {
                marcarLeida(banner.id);
                router.push({ pathname: "/conversacion", params: { correo: banner.correo } });
              } else {
                router.push("/alertas");
              }
            }}
          >
            <Text style={styles.bannerTitulo}>!! {banner.titulo}</Text>
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