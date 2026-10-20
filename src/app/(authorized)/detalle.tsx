import { Feather, FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
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
      <View className="flex-1 items-center justify-center bg-white px-4">
        <Text className="text-gray-400">Selecciona una tienda desde la lista</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white px-4 pt-12">
      <View className="mb-6 flex-row items-center space-x-3">
        <View className="flex-1 flex-row items-center rounded-full border border-gray-200 bg-white px-4 py-2 shadow-sm">
          <Feather name="search" size={20} color={"#9ca3af"}/>
          <TextInput
          placeholder="Buscar..."
          placeholderTextColor={"#9ca3af"}
          className="ml-2 flex-1 text-base text-gray-800"/>
        </View>
        <Pressable className="rounded-2xl bg-sky-700 p-3 items-center justify-center">
          <Ionicons name="filter" size={22} color={"white"}/>
        </Pressable>
      </View>

      <Text className="mb-3 text-xl font-bold text-sky-950">
        Gestion de tienda
      </Text>

      {error && <Text className="mb-3 text-red-600">{error}</Text>}

      <View className="relative mb-6 rounded-2xl bg-white p-5 border border-gray-100 shadow-sm">
        {/* ESTÁTICO por ahora */}
        <View className="absolute right-0 top-0 rounded-bl-xl rounded-tr-2xl bg-sky-100 px-3 py-1">
          <Text className="text-xs font-medium text-sky-800">En ruta</Text>
        </View>
        <View className="mb-4 flex-row items-center space-x-3">
          <View className="rounded-xl bg-blue-900 p-3">
            <FontAwesome5 name="store" size={24} color="white" />
          </View>
          <Text className="text-lg font-bold text-sky-900 flex-1">
            {tienda?.nombre ?? (tienda ? `${tienda.departamento} - ${tienda.ubicacion}` : "Cargando...")}
          </Text>
        </View>

        {/* Detalle de Información */}
        <View className="space-y-3 mb-5">
          <View className="flex-row items-center">
            <Feather name="user" size={18} color="#6b7280" />
            <View className="ml-3">
              <Text className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                ADMINISTRADOR
              </Text>
              <Text className="text-sm font-medium text-gray-700">
                {tienda?.adminis ?? "—"}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <Feather name="phone" size={18} color="#6b7280" />
            <View className="ml-3">
              <Text className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                TELÉFONO
              </Text>
              <Text className="text-sm font-medium text-gray-700">
                {tienda?.fono ?? "—"}
              </Text>
            </View>
          </View>

          <View className="flex-row items-start">
            <Ionicons name="location-outline" size={20} color="#6b7280" />
            <View className="ml-3 flex-1">
              <Text className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                DIRECCIÓN
              </Text>
              <Text className="text-sm font-medium text-gray-700">
                {tienda?.direccion ?? "—"}
              </Text>
            </View>
          </View>
        </View>

        {/* Botón Ver en el Mapa */}
        <Pressable
          className="flex-row items-center justify-center rounded-xl bg-sky-100 py-3"
          onPress={abrirMapa}
        >
          <MaterialIcons name="map" size={20} color="#0369a1" />
          <Text className="ml-2 text-sm font-semibold text-sky-700">
            Ver en el Mapa
          </Text>
        </Pressable>
      </View>

      {/* Título Estadística */}
      <Text className="mb-3 text-xl font-bold text-sky-950">
        Estadística de zona
      </Text>

      {/* Tarjeta Cumplimiento de tareas: ESTÁTICO por ahora */}
      <View className="relative mb-4 overflow-hidden rounded-2xl bg-blue-900 p-5 shadow-sm">
        <Text className="text-base font-semibold text-white">
          Cumplimiento de tareas
        </Text>
        <Text className="mt-2 text-5xl font-extrabold text-white">95%</Text>
        
        {/* Marca de agua / Icono de Check */}
        <View className="absolute -right-4 -bottom-4 opacity-20">
          <Ionicons name="checkmark-circle" size={120} color="white" />
        </View>
      </View>

      {/* Tarjeta Alertas stock crítico: el número es REAL */}
      <View className="mb-8 rounded-2xl bg-green-300 p-5 shadow-sm">
        <Text className="text-base font-semibold text-emerald-950">
          Alertas stock crítico
        </Text>
        <Text className="mt-1 text-5xl font-extrabold text-emerald-950">
          {String(tienda?.alertasCriticas ?? 0).padStart(2, "0")}
        </Text>
        
        {/* Comparación con ayer: ESTÁTICO por ahora */}
        <View className="mt-3 flex-row items-center">
          <Feather name="trending-down" size={20} color="#064e3b" />
          <Text className="ml-2 text-xs font-semibold text-emerald-900">
            Reduccion de 5% en comparacion a ayer
          </Text>
        </View>
        
      </View>
    </ScrollView>
  );
}