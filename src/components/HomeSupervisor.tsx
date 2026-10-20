import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { API_URL } from "../config/api";
import { useAuthSession } from "../providers/AuthProvider";

interface UsuarioDTO {
  id: string;
  name: string; 
  correo: string;
  rol: string;
}

export default function HomeSupervisor() {
  const { signOut, token } = useAuthSession();
  const router = useRouter();

  const [nombre, setNombre] = useState<string | null>(null);
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
      .catch(() => {});

    // Calculo de promotores
    fetch(`${API_URL}/usuarios`, { headers })
      .then((res) => (res.ok ? res.json() : []))
      .then((usuarios: UsuarioDTO[]) => {
   
        const promotores = usuarios.filter(
          (u) => u.rol?.toLowerCase() === "promotor"
        );
        setTotalPromotores(promotores.length);

        setActivosPromotores(promotores.length);
      })
      .catch((err) => console.error("Error al cargar promotores:", err));
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


  const fechaHoy = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const fechaCapitalizada = fechaHoy.charAt(0).toUpperCase() + fechaHoy.slice(1);

  return (
    <ScrollView className="flex-1 bg-slate-50 px-5 pt-12">
      {/* Navbar Superior */}
      <View className="mb-6 flex-row items-center justify-between">
        <Pressable className="p-1">
          <Feather name="menu" size={26} color="#1e3a8a" />
        </Pressable>

        <View className="flex-row items-center space-x-4">
          <Pressable className="relative mr-3 p-1">
            <Ionicons name="notifications-outline" size={24} color="#1e3a8a" />
            <View className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
          </Pressable>

          <View className="relative">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-slate-900 shadow-sm">
              <Text className="text-sm font-bold text-white">{iniciales}</Text>
            </View>
            <View className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
          </View>
        </View>
      </View>

      {/* Saludo y Fecha */}
      <View className="mb-6">
        <Text className="text-2xl font-black tracking-tight text-slate-900">
          Hola, {nombre ?? "Cargando..."}
        </Text>
        <Text className="text-xs font-semibold text-slate-400 capitalize">
          {fechaCapitalizada}
        </Text>
      </View>

      {/* Tarjeta: Promotores Activos (Conectado a la BD) */}
      <View className="mb-4 flex-row items-center justify-between rounded-2xl bg-white p-5 border-l-4 border-sky-400 shadow-sm">
        <View className="flex-1">
          <Text className="text-[10px] font-bold tracking-wider text-slate-400">
            PROMOTORES ACTIVOS
          </Text>
          <View className="my-1 flex-row items-baseline">
            <Text className="text-3xl font-black text-slate-900">
              {activosPromotores}
            </Text>
            <Text className="ml-1 text-base font-semibold text-slate-400">
              / {totalPromotores}
            </Text>
          </View>
          <View className="self-start rounded-full bg-emerald-50 px-2.5 py-1">
            <Text className="text-[11px] font-bold text-emerald-600">
              ↗ En ruta actualmente
            </Text>
          </View>
        </View>

        <View className="h-12 w-12 items-center justify-center rounded-2xl bg-sky-800">
          <Ionicons name="location-outline" size={24} color="white" />
        </View>
      </View>

      {/* Tarjeta: Cumplimiento Metas */}
      <View className="mb-6 rounded-2xl bg-white p-5 border-l-4 border-slate-900 shadow-sm">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-[10px] font-bold tracking-wider text-slate-400">
              CUMPLIMIENTO METAS
            </Text>
            <View className="flex-row items-baseline">
              <Text className="text-3xl font-black text-slate-900">78</Text>
              <Text className="ml-0.5 text-base font-bold text-sky-500">%</Text>
            </View>
          </View>
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-sky-500">
            <Ionicons name="flash" size={22} color="white" />
          </View>
        </View>

        <View className="mt-3 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
          <View className="h-full w-[78%] rounded-full bg-sky-800" />
        </View>

        <View className="mt-2.5 flex-row items-center justify-between">
          <Text className="text-xs font-semibold text-slate-400">
            Meta diaria: 85%
          </Text>
          <View className="rounded-full bg-emerald-50 px-2 py-0.5">
            <Text className="text-[10px] font-bold text-emerald-600">
              +4% vs ayer
            </Text>
          </View>
        </View>
      </View>

      {/* Alertas Críticas */}
      <View className="mb-6 rounded-3xl bg-white p-5 shadow-sm">
        <View className="mb-4 flex-row items-center justify-between">
          <View className="flex-row items-center space-x-2">
            <View className="h-7 w-7 items-center justify-center rounded-lg bg-red-50 mr-2">
              <Ionicons name="warning-outline" size={18} color="#ef4444" />
            </View>
            <Text className="text-base font-bold text-slate-800">
              Alertas Críticas
            </Text>
          </View>
          <View className="rounded-full bg-red-50 px-3 py-1">
            <Text className="text-[10px] font-bold text-red-500 tracking-wider">
              3 NUEVAS
            </Text>
          </View>
        </View>

        {/* Alerta 1 */}
        <Pressable
          className="mb-3 flex-row items-center justify-between rounded-xl bg-red-50/40 p-3.5 border-l-4 border-red-500"
          onPress={() => router.push("/alertas")}
        >
          <View className="flex-1 pr-2">
            <View className="flex-row items-center mb-1">
              <View className="h-2 w-2 rounded-full bg-red-500 mr-2" />
              <View className="rounded bg-red-100 px-1.5 py-0.5 mr-2">
                <Text className="text-[9px] font-black text-red-600">CRÍTICO</Text>
              </View>
              <Text className="text-xs font-bold text-slate-800 flex-1" numberOfLines={1}>
                Quiebre de stock en Paris Concepcion
              </Text>
            </View>
            <Text className="text-[11px] text-slate-400 pl-4">
              Sucursal #P-402 · <Text className="font-semibold text-red-500">Hace 15 min</Text>
            </Text>
          </View>
          <Feather name="chevron-right" size={18} color="#fca5a5" />
        </Pressable>

        {/* Alerta 2 */}
        <Pressable
          className="mb-3 flex-row items-center justify-between rounded-xl bg-amber-50/40 p-3.5 border-l-4 border-amber-400"
          onPress={() => router.push("/alertas")}
        >
          <View className="flex-1 pr-2">
            <View className="flex-row items-center mb-1">
              <View className="h-2 w-2 rounded-full bg-amber-400 mr-2" />
              <View className="rounded bg-amber-100 px-1.5 py-0.5 mr-2">
                <Text className="text-[9px] font-black text-amber-700">RETRASO</Text>
              </View>
              <Text className="text-xs font-bold text-slate-800 flex-1" numberOfLines={1}>
                Retraso de carga - Camión 04
              </Text>
            </View>
            <Text className="text-[11px] text-slate-400 pl-4">
              Ruta Portal Temuco · <Text className="font-semibold text-amber-600">Hace 42 min</Text>
            </Text>
          </View>
          <Feather name="chevron-right" size={18} color="#fcd34d" />
        </Pressable>

        {/* Alerta 3 */}
        <Pressable
          className="mb-4 flex-row items-center justify-between rounded-xl bg-sky-50/40 p-3.5 border-l-4 border-sky-400"
          onPress={() => router.push("/alertas")}
        >
          <View className="flex-1 pr-2">
            <View className="flex-row items-center mb-1">
              <View className="h-2 w-2 rounded-full bg-sky-400 mr-2" />
              <View className="rounded bg-sky-100 px-1.5 py-0.5 mr-2">
                <Text className="text-[9px] font-black text-sky-700">PENDIENTE</Text>
              </View>
              <Text className="text-xs font-bold text-slate-800 flex-1" numberOfLines={1}>
                Falta de Tarea: Janio Perez
              </Text>
            </View>
            <Text className="text-[11px] text-slate-400 pl-4">
              Zona Sur · <Text className="font-semibold text-sky-600">Hace 1 hora</Text>
            </Text>
          </View>
          <Feather name="chevron-right" size={18} color="#7dd3fc" />
        </Pressable>

        {/* Botón Ver todas */}
        <Pressable
          className="flex-row items-center justify-center rounded-xl bg-slate-900 py-3.5 active:bg-slate-800"
          onPress={() => router.push("/alertas")}
        >
          <Text className="mr-2 text-xs font-bold text-white">
            Ver todas las alertas
          </Text>
          <Feather name="external-link" size={14} color="white" />
        </Pressable>
      </View>

      {/* Accesos Directos */}
      <Text className="mb-3 text-base font-bold text-slate-800">
        Accesos Directos
      </Text>

      <View className="mb-8 flex-row justify-between space-x-4">
        <Pressable
          className="flex-1 items-center rounded-2xl bg-sky-50/60 p-5 mr-2 border border-sky-100"
          onPress={() => router.push("/cargas" as any)}
        >
          <View className="mb-3 h-14 w-14 items-center justify-center rounded-2xl bg-sky-500 shadow-sm">
            <MaterialCommunityIcons name="truck-fast-outline" size={28} color="white" />
          </View>
          <Text className="text-center text-xs font-bold text-slate-700 leading-tight">
            Seguimiento{"\n"}de Carga
          </Text>
        </Pressable>

        <Pressable
          className="flex-1 items-center rounded-2xl bg-slate-100/60 p-5 ml-2 border border-slate-200"
          onPress={() => router.push("/rrhh" as any)}
        >
          <View className="mb-3 h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 shadow-sm">
            <Ionicons name="chatbubbles-outline" size={26} color="white" />
          </View>
          <Text className="text-center text-xs font-bold text-slate-700 leading-tight">
            Comunicación{"\n"}con RRHH
          </Text>
        </Pressable>
      </View>

      {/* Botón Cerrar Sesión */}
      <Pressable
        className="mb-12 items-center rounded-xl bg-slate-200 py-3 active:bg-slate-300"
        onPress={signOut}
      >
        <Text className="text-xs font-bold text-slate-700">Cerrar sesión</Text>
      </Pressable>
    </ScrollView>
  );
}