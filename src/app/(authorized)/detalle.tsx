import { Feather, FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Linking, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { API_URL } from "../../config/api";
import { useAuthSession } from "../../providers/AuthProvider";

type TiendaDetalle = {
  idTienda: number;
  nombre: string | null;
  adminis: string | null;
  fono: string | null;
  direccion: string | null;
  departamento: string;
  ubicacion: string;
  alertasCriticas: number;
};

export default function Detalle() {
  const { token } = useAuthSession();
  // El id llega desde la lista de tiendas
  const { id } = useLocalSearchParams<{ id: string }>();

  const [tienda, setTienda] = useState<TiendaDetalle | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !id) return;
    fetch(`${API_URL}/api/tiendas/${id}`, { headers: { Authorization: token } })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setTienda(data);
        setError(null);
      })
      .catch(() => setError("No se pudo cargar la tienda"));
  }, [token, id]);

  const abrirMapa = () => {
    if (!tienda?.direccion) return;
    Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(tienda.direccion)}`
    );
  };

  if (!id) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F5F4FB] px-4">
        <Text className="text-[15px] text-[#6B6787]">Selecciona una tienda desde la lista</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-[#F5F4FB]">
      <StatusBar style="light" />

      {/* Header iridiscente: buscador + titulo (mismo degradado del inicio) */}
      <LinearGradient
        colors={["#4636A8", "#5743C2", "#4F6FD0", "#3F96C4"]}
        locations={[0, 0.45, 0.8, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingHorizontal: 16, paddingTop: 52, paddingBottom: 22 }}
      >
      <View className="mb-6 flex-row items-center space-x-3">
        <View className="flex-1 flex-row items-center rounded-full border border-[#FFFFFF40] bg-[#FFFFFF26] px-4 py-2">
          <Feather name="search" size={20} color={"#E2DDFB"}/>
          <TextInput
          placeholder="Buscar..."
          placeholderTextColor={"#E2DDFB"}
          className="ml-2 h-10 flex-1 text-[17px] text-white"/>
        </View>
        <Pressable className="rounded-2xl border border-[#FFFFFF40] bg-[#FFFFFF26] p-3 items-center justify-center">
          <Ionicons name="filter" size={22} color={"white"}/>
        </Pressable>
      </View>

      <Text className="text-2xl font-bold text-white">
        Gestion de tienda
      </Text>
      </LinearGradient>

      <View className="px-4 pt-6">

      {error && <Text className="mb-3 text-[15px] font-medium text-[#DC2626]">{error}</Text>}

      <View className="relative mb-6 rounded-2xl bg-white p-5 border border-[#E4E2EE] shadow-sm">
        {/* ESTÁTICO por ahora */}
        <View className="absolute right-0 top-0 rounded-bl-xl rounded-tr-2xl border-b border-l border-[#5EEAD4] bg-[#CCFBF1] px-3 py-1">
          <Text className="text-[13px] font-bold text-[#0F766E]">En ruta</Text>
        </View>
        <View className="mb-4 flex-row items-center space-x-3">
          <LinearGradient
            colors={["#2DD4BF", "#0D9488"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 14, padding: 12 }}
          >
            <FontAwesome5 name="store" size={24} color="white" />
          </LinearGradient>
          <Text className="text-lg font-bold text-[#1B1733] flex-1">
            {tienda?.nombre ?? (tienda ? `${tienda.departamento} - ${tienda.ubicacion}` : "Cargando...")}
          </Text>
        </View>

        {/* Detalle de Información */}
        <View className="space-y-4 mb-5">
          <View className="flex-row items-center">
            <Feather name="user" size={20} color="#6C4CF5" />
            <View className="ml-3">
              <Text className="text-[13px] font-medium text-[#6B6787]">
                Administrador
              </Text>
              <Text className="text-[15px] font-medium text-[#1B1733]">
                {tienda?.adminis ?? "—"}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <Feather name="phone" size={20} color="#0284C7" />
            <View className="ml-3">
              <Text className="text-[13px] font-medium text-[#6B6787]">
                Teléfono
              </Text>
              <Text className="text-[15px] font-medium text-[#1B1733]">
                {tienda?.fono ?? "—"}
              </Text>
            </View>
          </View>

          <View className="flex-row items-start">
            <Ionicons name="location-outline" size={22} color="#0D9488" />
            <View className="ml-3 flex-1">
              <Text className="text-[13px] font-medium text-[#6B6787]">
                Dirección
              </Text>
              <Text className="text-[15px] font-medium text-[#1B1733]">
                {tienda?.direccion ?? "—"}
              </Text>
            </View>
          </View>
        </View>

        {/* Botón Ver en el Mapa */}
        <Pressable
          className="flex-row items-center justify-center rounded-xl bg-[#0D9488] py-3.5"
          onPress={abrirMapa}
        >
          <MaterialIcons name="map" size={20} color="white" />
          <Text className="ml-2 text-[15px] font-semibold text-white">
            Ver en el Mapa
          </Text>
        </Pressable>
      </View>

      {/* Título Estadística */}
      <Text className="mb-3 text-lg font-bold text-[#1B1733]">
        Estadística de zona
      </Text>

      {/* Tarjeta Cumplimiento de tareas: ESTÁTICO por ahora */}
      <LinearGradient
        colors={["#5743C2", "#4F6FD0", "#3F96C4"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ marginBottom: 16, overflow: "hidden", borderRadius: 16, padding: 20 }}
      >
        <Text className="text-base font-semibold text-[#EEEBFF]">
          Cumplimiento de tareas
        </Text>
        <Text className="mt-2 text-5xl font-extrabold text-white">95%</Text>

        {/* Marca de agua / Icono de Check */}
        <View className="absolute -right-4 -bottom-4 opacity-20">
          <Ionicons name="checkmark-circle" size={120} color="white" />
        </View>
      </LinearGradient>

      {/* Tarjeta Alertas stock crítico: el número es REAL */}
      <View className="mb-8 rounded-2xl border border-[#FECACA] bg-[#FEF2F2] p-5">
        <Text className="text-base font-semibold text-[#991B1B]">
          Alertas stock crítico
        </Text>
        <Text className="mt-1 text-5xl font-extrabold text-[#DC2626]">
          {String(tienda?.alertasCriticas ?? 0).padStart(2, "0")}
        </Text>

        {/* Comparación con ayer: ESTÁTICO por ahora */}
        <View className="mt-3 flex-row items-center">
          <Feather name="trending-down" size={20} color="#22C55E" />
         </View>

      </View>
      </View>
    </ScrollView>
  );
}
