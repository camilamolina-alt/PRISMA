import EvidenciaTareaModal, { TareaParaCompletar } from "@/components/EvidenciaTareaModal";
import { API_URL } from "@/config/api";
import { useAlertas } from "@/providers/AlertaProvider";
import { useAuthSession } from "@/providers/AuthProvider";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TipoTarea = "precio" | "repo" | "promo";
type Filtro = "pendientes" | "listas" | "todas";

interface TareaApi {
  idTarea: number;
  tipo: TipoTarea;
  nombreTarea: string;
  checkTarea: boolean;
  fecha: string;
  fechaCheck: string | null;
  fotoURL: string | null;
  tienda: { nombre: string; ubicacion: string };
}

const estiloTipo: Record<TipoTarea, { texto: string; fondo: string; color: string }> = {
  precio: { texto: "Cambio de precio", fondo: "#E1EBFF", color: "#1F47A8" },
  repo: { texto: "Reposición", fondo: "#ECE8FF", color: "#3A2B96" },
  promo: { texto: "Promoción", fondo: "#DDF5F3", color: "#075A66" },
};

const filtros: { valor: Filtro; texto: string }[] = [
  { valor: "pendientes", texto: "Pendientes" },
  { valor: "listas", texto: "Listas" },
  { valor: "todas", texto: "Todas" },
];

const sombraTarjeta = { boxShadow: "0 4px 12px rgba(70, 54, 168, 0.08)" };

const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const fechaCorta = (iso: string) => {
  const [, m, d] = iso.slice(0, 10).split("-");
  return `${Number(d)} ${meses[Number(m) - 1]}`;
};

function IconoTipo({ tipo, color }: { tipo: TipoTarea; color: string }) {
  if (tipo === "precio") return <Feather name="dollar-sign" size={12} color={color} />;
  if (tipo === "promo") return <Feather name="tag" size={12} color={color} />;
  return <MaterialCommunityIcons name="package-variant-closed" size={13} color={color} />;
}

export default function Tareas() {
  const insets = useSafeAreaInsets();
  const { token } = useAuthSession();
  const { recargar: recargarAlertas } = useAlertas();
  const [tareas, setTareas] = useState<TareaApi[]>([]);
  const [filtro, setFiltro] = useState<Filtro>("pendientes");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  const cargar = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/tareas/mio`, { headers: { Authorization: token } });
      if (!res.ok) throw new Error();
      setTareas(await res.json());
      setError(false);
    } catch {
      setError(true);
    } finally {
      setCargando(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  const [completando, setCompletando] = useState<TareaParaCompletar | null>(null);

  const marcar = (id: number) => {
    const tarea = tareas.find((t) => t.idTarea === id);
    if (tarea && !tarea.checkTarea) {
      setCompletando({ id, titulo: tarea.nombreTarea, tienda: tarea.tienda.nombre });
      return;
    }
    setTareas((prev) => prev.map((t) => (t.idTarea === id ? { ...t, checkTarea: !t.checkTarea } : t)));
    fetch(`${API_URL}/api/tareas/${id}/check`, { method: "PUT", headers: { Authorization: token ?? "" } })
      .then((res) => {
        if (res.ok) recargarAlertas();
        else cargar();
      })
      .catch(() => cargar());
  };

  const pendientes = tareas.filter((t) => !t.checkTarea).length;
  const listas = tareas.length - pendientes;
  const visibles = tareas.filter((t) =>
    filtro === "todas" ? true : filtro === "pendientes" ? !t.checkTarea : t.checkTarea
  );

  return (
    <ScrollView
      className="flex-1 bg-[#F3F2FB]"
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      refreshControl={<RefreshControl refreshing={false} onRefresh={cargar} />}
    >
      <StatusBar style="light" />

      {/* Header */}
      <LinearGradient
        colors={["#4636A8", "#5743C2", "#4F6FD0", "#3F96C4"]}
        locations={[0, 0.45, 0.8, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingHorizontal: 20,
          paddingTop: insets.top + 20,
          paddingBottom: 56,
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
          gap: 18,
        }}
      >
        <View>
          <Text className="text-2xl font-bold text-white">Tareas</Text>
          <Text className="text-sm text-[#E2DDFB]">Precios, promos y reposición de tus tiendas</Text>
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1 rounded-2xl border border-[#FFFFFF33] bg-[#FFFFFF1F] px-4 py-3">
            <Text className="text-2xl font-extrabold text-white">{pendientes}</Text>
            <Text className="text-sm text-[#E2DDFB]">Pendientes</Text>
          </View>
          <View className="flex-1 rounded-2xl border border-[#FFFFFF33] bg-[#FFFFFF1F] px-4 py-3">
            <Text className="text-2xl font-extrabold text-white">{listas}</Text>
            <Text className="text-sm text-[#E2DDFB]">Listas</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Filtros */}
      <View className="-mt-6 flex-row gap-2 px-4">
        {filtros.map((f) => {
          const activo = filtro === f.valor;
          return (
            <Pressable
              key={f.valor}
              onPress={() => setFiltro(f.valor)}
              accessibilityRole="radio"
              accessibilityState={{ selected: activo }}
              className={`flex-1 items-center rounded-full border py-2.5 ${activo ? "border-[#5743C2] bg-[#5743C2]" : "border-[#E4E2EE] bg-white"}`}
              style={sombraTarjeta}
            >
              <Text className={`text-[15px] font-semibold ${activo ? "text-white" : "text-[#4636A8]"}`}>{f.texto}</Text>
            </Pressable>
          );
        })}
      </View>

      <View className="mt-5 gap-3 px-4">
        {cargando && <ActivityIndicator color="#5743C2" style={{ paddingVertical: 32 }} />}
        {!cargando && error && (
          <Text className="py-8 text-center text-[15px] text-[#C4202F]">No se pudieron cargar las tareas</Text>
        )}

        {!cargando && !error && visibles.length === 0 && (
          <View className="items-center gap-2 rounded-2xl border border-dashed border-[#C9C4E4] bg-white px-4 py-10">
            <Feather name={filtro === "pendientes" ? "check-circle" : "inbox"} size={30} color="#8C86A8" />
            <Text className="text-[15px] font-bold text-[#1B1733]">
              {filtro === "pendientes" ? "¡Estás al día!" : "No hay tareas aquí"}
            </Text>
            <Text className="text-center text-sm text-[#6B6787]">
              {filtro === "pendientes"
                ? "No tienes tareas pendientes por ahora"
                : "Cuando tu supervisor te asigne tareas aparecerán aquí"}
            </Text>
          </View>
        )}

        {!cargando &&
          visibles.map((t) => {
            const estilo = estiloTipo[t.tipo] ?? estiloTipo.repo;
            return (
              <View
                key={t.idTarea}
                className="flex-row items-center gap-3 rounded-2xl border border-[#E4E2EE] bg-white p-4"
                style={sombraTarjeta}
              >
                <View className="flex-1 gap-1">
                  <View
                    className="flex-row items-center gap-1 self-start rounded-lg px-2 py-0.5"
                    style={{ backgroundColor: t.checkTarea ? "#DCF7E5" : estilo.fondo }}
                  >
                    {t.checkTarea ? (
                      <Feather name="check" size={12} color="#11602F" />
                    ) : (
                      <IconoTipo tipo={t.tipo} color={estilo.color} />
                    )}
                    <Text className="text-xs font-bold" style={{ color: t.checkTarea ? "#11602F" : estilo.color }}>
                      {t.checkTarea ? `${estilo.texto}, lista` : estilo.texto}
                    </Text>
                  </View>
                  <Text className={`font-bold ${t.checkTarea ? "text-[#6B6787] line-through" : "text-[#1B1733]"}`}>
                    {t.nombreTarea}
                  </Text>
                  <Text className="text-sm text-[#6B6787]">
                    {t.tienda.nombre}
                    {t.tienda.ubicacion ? ` · ${t.tienda.ubicacion}` : ""}
                  </Text>
                  <Text className="text-xs text-[#8C86A8]">
                    {t.checkTarea && t.fechaCheck
                      ? `Lista el ${fechaCorta(t.fechaCheck)}`
                      : `Asignada el ${fechaCorta(t.fecha)}`}
                  </Text>
                  {t.checkTarea && t.fotoURL && (
                    <View className="flex-row items-center gap-1">
                      <Feather name="camera" size={12} color="#11602F" />
                      <Text className="text-xs font-semibold text-[#11602F]">Con foto de evidencia</Text>
                    </View>
                  )}
                </View>

                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: t.checkTarea }}
                  accessibilityLabel={`Marcar ${t.nombreTarea} como lista`}
                  hitSlop={8}
                  className={`h-10 w-10 items-center justify-center rounded-full ${t.checkTarea ? "bg-[#1F9D55]" : "border-2 border-[#8C86A8] bg-white"}`}
                  onPress={() => marcar(t.idTarea)}
                >
                  {t.checkTarea && <Feather name="check" size={20} color="white" />}
                </Pressable>
              </View>
            );
          })}
      </View>
      <EvidenciaTareaModal
        tarea={completando}
        onClose={() => setCompletando(null)}
        onCompletada={() => {
          setCompletando(null);
          cargar();
          recargarAlertas();
        }}
      />
    </ScrollView>
  );
}
