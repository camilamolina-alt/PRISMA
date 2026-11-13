import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { API_URL } from "../config/api";
import { NivelAlerta } from "../data/alertas";
import { useAlertas } from "../providers/AlertaProvider";
import { useAuthSession } from "../providers/AuthProvider";

interface TareaApi { correoPromotor: string; checkTarea: boolean; }

interface UsuarioDTO {
  id: string;
  name: string;
  correo: string;
  rol: string;
}

//alertas
const estiloAlerta: Record<NivelAlerta, { fondo: string; color: string }> = {
  critico: { fondo: "#FDECEC", color: "#C4202F" },
  retraso: { fondo: "#FFF2DC", color: "#9A5300" },
  pendiente: { fondo: "#E6EEFF", color: "#2450C2" },
};

function IconoAlerta({ nivel, color }: { nivel: NivelAlerta; color: string }) {
  if (nivel === "critico") return <MaterialCommunityIcons name="package-variant-remove" size={22} color={color} />;
  if (nivel === "retraso") return <MaterialCommunityIcons name="truck-fast-outline" size={22} color={color} />;
  return <Feather name="check-square" size={20} color={color} />;
}

// Colores del prisma para la barra de "aplicados en tienda"
const coloresBarra = ["#8B7CFF", "#4FA8F5", "#2FCFC4", "#6EDC9E"] as const;

// Sombras suaves (mismo valor en todas las tarjetas para que se vean coherentes)
const sombraTarjeta = { boxShadow: "0 4px 12px rgba(10, 85, 104, 0.08)" };
const sombraIcono = (rgb: string) => ({ boxShadow: `0 4px 10px rgba(${rgb}, 0.3)` });

export default function HomeSupervisor() {
  const { signOut, token } = useAuthSession();
  const router = useRouter();
  const { alertas } = useAlertas();

  const [tareas, setTareas] = useState<TareaApi[]>([]);
  const [nombre, setNombre] = useState<string | null>(null);
  const[promotores, setPromotores] = useState<UsuarioDTO[]>([]);
  const [totalPromotores, setTotalPromotores] = useState<number>(0);
  const [activosPromotores, setActivosPromotores] = useState<number>(0);

  useEffect(() => {
    if (!token) return;

    const headers = { Authorization: token };

    fetch(`${API_URL}/api/me`, { headers })
      .then((res) => (res.ok ? res.json() : null))
      .then((me) => {

        setNombre(me?.nombre ?? me?.name ?? null);
      })
      .catch(() => { });

    // Calculo de promotores
    fetch(`${API_URL}/usuarios`, { headers })
      .then((res) => (res.ok ? res.json() : []))
      .then((usuarios: UsuarioDTO[]) => {

        const promotores = usuarios.filter(
          (u) => u.rol?.toLowerCase() === "promotor"
        );
        setTotalPromotores(promotores.length);
        setPromotores(promotores);
        setActivosPromotores(promotores.length);
      })
      .catch((err) => console.error("Error al cargar promotores:", err));

    fetch(`${API_URL}/api/tareas`, { headers })
      .then((res) => (res.ok ? res.json() : []))
      .then((data: TareaApi[]) => setTareas(data))
      .catch(() => { });
  }, [token]);



  //perfil
  const iniciales = nombre
    ? nombre
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
    : "AA";
  const primerNombre = nombre?.split(" ")[0];


  const fechaHoy = new Date().toLocaleDateString("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const nuevas = alertas.filter((a) => a.nueva).length;
  // En el inicio solo las 2 primeras, el resto en "Ver todas"
  const alertasInicio = alertas.slice(0, 2);

  // Precios y promos: estatico por ahora
  const aplicados = tareas.filter((t)=>t.checkTarea).length;
  const asignados = tareas.length;
  const faltan = promotores
  .filter((p) => tareas.some((t) => t.correoPromotor === p.correo && !t.checkTarea))
  .map((p) => p.name);

  return (
    <ScrollView className="flex-1 bg-[#EEF6F7]">
      <StatusBar style="light" />

      {/* Header turquesa: perfil + resumen del equipo */}
      <LinearGradient
        colors={["#0A5568", "#0B7C8E", "#0EA5B0", "#3BCBC3"]}
        locations={[0, 0.42, 0.78, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingHorizontal: 18,
          paddingTop: 58,
          paddingBottom: 64,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
          gap: 22,
        }}
      >
        {/* Perfil + campana */}
        <View className="flex-row items-center justify-between">
          <View className="flex-1 flex-row items-center gap-3">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-white">
              <Text className="text-lg font-bold text-[#0A5568]">{iniciales}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-white">
                {primerNombre ? `Hola, ${primerNombre}` : "Cargando..."}
              </Text>
              <Text className="text-sm text-[#D4F5F4]">Supervisión, {fechaHoy}</Text>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Notificaciones, ${nuevas} nuevas`}
            className="h-11 w-11 items-center justify-center rounded-full border border-[#FFFFFF59] bg-[#FFFFFF29]"
            onPress={() => router.push("/alertas")}
          >
            <Ionicons name="notifications-outline" size={22} color="white" />
            {nuevas > 0 && (
              <View className="absolute -right-0.5 -top-0.5 h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-[#0B7C8E] bg-[#F03E4E] px-1">
                <Text className="text-[10px] font-bold text-white">{nuevas}</Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* Resumen a lo largo (como la ruta del promotor): metas (estatico por ahora) + promotores en ruta (BD) */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Metas del equipo 78 por ciento, ${activosPromotores} de ${totalPromotores} promotores en ruta`}
          className="flex-row items-center justify-between rounded-[20px] border border-[#FFFFFF33] bg-[#FFFFFF1F] px-5 py-4"
          onPress={() => router.push("/desempeno")}
        >
          <View>
            <Text className="text-[15px] font-semibold text-[#D4F5F4]">Metas del equipo</Text>
            <Text className="text-[32px] font-extrabold text-white">78%</Text>
            <View className="mt-1 flex-row items-center gap-1.5">
              <Ionicons name="location-outline" size={16} color="#E6FAF9" />
              <Text className="text-sm text-[#E6FAF9]">
                {activosPromotores} de {totalPromotores} promotores en ruta
              </Text>
            </View>
          </View>
          <View className="h-16 w-16 rounded-full border-[7px] border-[#FFFFFF40] border-t-[#8B7CFF] border-r-[#4FC8E8] border-b-[#6EDC9E]" />
        </Pressable>
      </LinearGradient>

      <View className="-mt-9 gap-6 px-4 pb-10">
        {/* Precios y promos de hoy: lo principal del supervisor */}
        <View
          className="gap-4 rounded-3xl border border-[#DCEBEE] bg-white p-5"
          style={{ boxShadow: "0 10px 24px rgba(10, 85, 104, 0.14)" }}
        >
          <View className="flex-row items-center gap-3">
            <LinearGradient
              colors={["#8B6CFF", "#4FB8F0", "#19C2B0"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[{ width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" }, sombraIcono("79, 120, 240")]}
            >
              <Feather name="tag" size={24} color="white" />
            </LinearGradient>
            <View className="flex-1">
              <Text className="text-lg font-bold text-[#10262E]">Precios y promos de hoy</Text>
              <Text className="text-sm text-[#3B5760]">4 envíos a tu equipo</Text>
            </View>
          </View>

          <View className="gap-2">
            <View className="flex-row items-baseline justify-between">
              <Text className="text-[15px] font-bold text-[#10262E]">Aplicados en tienda</Text>
              <Text className="text-2xl font-bold text-[#0A6D7D]">
                {aplicados}
                <Text className="text-sm font-normal text-[#3B5760]"> de {asignados}</Text>
              </Text>
            </View>
            {/* Barra continua: se llena según el % aplicado (funciona igual con 2 o con 50 tareas) */}
            <View
              accessible
              accessibilityLabel={`${aplicados} de ${asignados} tareas aplicadas`}
              className="h-3 overflow-hidden rounded-full bg-[#E2ECEE]"
            >
              {aplicados > 0 && (
                <LinearGradient
                  colors={coloresBarra}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ height: "100%", width: `${(aplicados / asignados) * 100}%`, borderRadius: 999 }}
                />
              )}
            </View>
            {faltan.length > 0 && (
              <Text className="text-sm text-[#3B5760]">
                Faltan {faltan.length}:{" "}
                {faltan.length === 1
                  ? faltan[0]
                  : `${faltan.slice(0, -1).join(", ")} y ${faltan[faltan.length - 1]}`}
              </Text>
            )}
          </View>

          <View className="flex-row gap-3">
            <Pressable
              accessibilityRole="button"
              className="flex-1 overflow-hidden rounded-full"
              style={sombraIcono("11, 124, 142")}
              onPress={() => router.push("/promos" as any)}
            >
              <LinearGradient
                colors={["#0B7C8E", "#0EA5B0"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ height: 48, alignItems: "center", justifyContent: "center", paddingHorizontal: 8 }}
              >
                <Text className="text-[15px] font-bold text-white">Gestionar promos</Text>
              </LinearGradient>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              className="h-12 flex-1 items-center justify-center rounded-full border border-[#A9DCDD] bg-[#E3F5F5]"
              onPress={() => router.push("/verPromos")}
            >
              <Text className="text-[15px] font-bold text-[#0A5568]">Ver promociones</Text>
            </Pressable>
          </View>
        </View>

        {/* Accesos directos: 3 en fila, igual que las acciones rapidas del promotor */}
        <View className="gap-3">
          <Text className="text-base font-bold text-[#10262E]">Accesos directos</Text>
          <View className="flex-row gap-3">
            {[
              { texto: "Mi equipo", ruta: "/equipo", colores: ["#14C2C0", "#0A7A8C"], rgb: "10, 122, 140", icono: <Feather name="users" size={26} color="white" /> },
              { texto: "Seguimiento de carga", ruta: "/cargas", colores: ["#38BDF8", "#0284C7"], rgb: "2, 132, 199", icono: <MaterialCommunityIcons name="truck-fast-outline" size={28} color="white" /> },
              { texto: "Documentos", ruta: "/documentos", colores: ["#4ADE80", "#16A34A"], rgb: "22, 163, 74", icono: <MaterialCommunityIcons name="file-table-outline" size={28} color="white" /> },
            ].map((acceso) => (
              <Pressable
                key={acceso.texto}
                accessibilityRole="button"
                className="flex-1 items-center rounded-2xl border border-[#DCEBEE] bg-white px-2 py-4"
                style={sombraTarjeta}
                onPress={() => router.push(acceso.ruta as any)}
              >
                <LinearGradient
                  colors={acceso.colores as [string, string]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[{ marginBottom: 8, width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center" }, sombraIcono(acceso.rgb)]}
                >
                  {acceso.icono}
                </LinearGradient>
                <Text className="text-center text-[15px] font-bold leading-5 text-[#10262E]">{acceso.texto}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Alertas: al final y discretas (las del AlertaProvider) */}
        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-bold text-[#10262E]">Alertas</Text>
            <Pressable accessibilityRole="link" hitSlop={10} onPress={() => router.push("/alertas")}>
              <Text className="text-[15px] font-bold text-[#0A6D7D]">Ver todas ({alertas.length})</Text>
            </Pressable>
          </View>

          <View className="rounded-2xl border border-[#DCEBEE] bg-white pl-4" style={sombraTarjeta}>
            {alertasInicio.length === 0 ? (
              <Text className="py-5 text-center text-[15px] text-[#3B5760]">Sin alertas por ahora</Text>
            ) : (
              alertasInicio.map((a, i) => {
                const estilo = estiloAlerta[a.nivel];
                return (
                  <Pressable
                    key={a.id}
                    accessibilityRole="button"
                    className={`min-h-[64px] flex-row items-center gap-3 py-3 pr-4 ${i < alertasInicio.length - 1 ? "border-b border-[#E3EEF0]" : ""}`}
                    onPress={() => router.push("/alertas")}
                  >
                    <View className="h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: estilo.fondo }}>
                      <IconoAlerta nivel={a.nivel} color={estilo.color} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[15px] font-bold text-[#10262E]" numberOfLines={1}>{a.titulo}</Text>
                      <Text className="text-sm text-[#3B5760]" numberOfLines={1}>{a.detalle}</Text>
                    </View>
                    <Feather name="chevron-right" size={20} color="#6E8C94" />
                  </Pressable>
                );
              })
            )}
          </View>
        </View>

        {/* Botón Cerrar Sesión */}
        <Pressable
          accessibilityRole="button"
          className="items-center rounded-xl bg-[#0A5568] py-3"
          onPress={signOut}
        >
          <Text className="font-semibold text-white">Cerrar sesión</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
