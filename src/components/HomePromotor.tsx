import { Feather, FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { API_URL } from "../config/api";
import { useAlertas } from "../providers/AlertaProvider";

import { useAuthSession } from "../providers/AuthProvider";
import BarcodeScannerModal from "./BarcodeScannerModal";

export default function HomePromotor() {
  const { signOut, token } = useAuthSession();
  const router = useRouter();
  const { alertas } = useAlertas();


  const [escanerAbierto, setEscanerAbierto] = useState(false);

  // Nombre de registro para el usuario
  const [nombre, setNombre] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/api/me`, { headers: { Authorization: token } })
      .then((res) => (res.ok ? res.json() : null))
      .then((me) => setNombre(me?.nombre ?? null))
      .catch(() => {});
  }, [token]);


  const criticas = alertas.filter((a) => a.nivel === "critico");
  const nuevas = alertas.filter((a) => a.nueva).length;

  return (
    <ScrollView className="flex-1 bg-[#F5F4FB]">
      <StatusBar style="light" />

      {/* Header iridiscente: perfil + ruta */}
      <LinearGradient
        colors={["#4636A8", "#5743C2", "#4F6FD0", "#3F96C4"]}
        locations={[0, 0.45, 0.8, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingHorizontal: 16, paddingTop: 52 }}
      >

      {/* Tarjeta de Perfil */}
      <View className="mb-4 flex-row items-center">
        <View className="mr-3 rounded-full bg-[#FFFFFF26] p-2.5">
          <Ionicons name="person" size={26} color="white" />
        </View>
        <View>
          <Text className="text-lg font-bold text-white">
            {nombre ?? "Cargando..."}
          </Text>
          <Text className="text-sm text-[#E2DDFB]">Promotor Ruta</Text>
        </View>
      </View>

      {/* Estaticos por ahora */}
      <View className="mb-5 flex-row items-center justify-between rounded-2xl bg-[#FFFFFF1F] border border-[#FFFFFF33] px-4 py-3">
        <View>
          <Text className="text-sm font-semibold text-[#E2DDFB]">Ruta Diaria</Text>
          <Text className="text-2xl font-extrabold text-white">83%</Text>
          <Text className="text-sm text-[#E2DDFB]">Tiendas visitadas : 2</Text>
        </View>

        <View className="h-14 w-14 items-center justify-center rounded-full border-[6px] border-[#FFFFFF33] border-t-[#8B7CFF] border-r-[#4FC8E8] border-b-[#6EDC9E]">
        </View>
      </View>
      </LinearGradient>

      <View className="px-4 pt-6">
      {/* Solo sale ssi el estado de la alerta es critic */}
      {criticas.length > 0 && (
        <Pressable
          className="mb-6 flex-row items-center justify-between rounded-2xl bg-red-100 p-4 border border-red-200"
          onPress={() => router.push("/alertas")}
        >
          <View className="flex-row items-center space-x-3">
            <Ionicons name="warning" size={32} color="#dc2626" />
            <View className="ml-2">
              <Text className="font-bold text-red-700">Stock crítico</Text>
              <Text className="text-xs text-red-600">
                {criticas.length} {criticas.length === 1 ? "producto" : "productos"} · {criticas[0].detalle}
              </Text>
            </View>
          </View>
          <Feather name="chevron-right" size={24} color="#dc2626" />
        </Pressable>
      )}

      {/* Quick Actions */}
      <Text className="mb-3 text-base font-bold text-[#1B1733]">
        Acciones Rapidas
      </Text>
      <View className="mb-6 flex-row gap-3">
        {/* Reoporte diario  */}
        <Pressable className="flex-1 items-center rounded-2xl border border-[#E4E2EE] bg-white px-2 py-4">
          <LinearGradient
            colors={["#8B6CFF", "#5B3FE0"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ marginBottom: 8, borderRadius: 14, padding: 12 }}
          >
            <Feather name="camera" size={28} color="white" />
          </LinearGradient>
          <Text className="text-center text-[15px] font-bold text-gray-800">Reporte Diario</Text>
          <Text className="mt-0.5 text-center text-[13px] text-[#6B6787]">Documentar dia</Text>
        </Pressable>


        {/* Boton de scaner*/}
        <Pressable
          className="flex-1 items-center rounded-2xl border border-[#E4E2EE] bg-white px-2 py-4"
          onPress={() => setEscanerAbierto(true)}
        >
          <LinearGradient
            colors={["#38BDF8", "#0284C7"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ marginBottom: 8, borderRadius: 14, padding: 12 }}
          >
            <MaterialCommunityIcons name="barcode-scan" size={28} color="white" />
          </LinearGradient>
          <Text className="text-center text-[15px] font-bold text-gray-800">Escanear Sku</Text>
          <Text className="mt-0.5 text-center text-[13px] text-[#6B6787]">Escanear mercaderia</Text>
        </Pressable>

        {/* Boton Tiendas: lleva a la lista y de ahi al detalle */}
        <Pressable
          className="flex-1 items-center rounded-2xl border border-[#E4E2EE] bg-white px-2 py-4"
        onPress={() => {
        console.log("Toqué Tiendas");
  router.push("/tiendas");
}}
        >
          <LinearGradient
            colors={["#2DD4BF", "#0D9488"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ marginBottom: 8, borderRadius: 14, padding: 12 }}
          >
            <FontAwesome5 name="store" size={26} color="white" />
          </LinearGradient>
          <Text className="text-center text-[15px] font-bold text-gray-800">Tiendas</Text>
          <Text className="mt-0.5 text-center text-[13px] text-[#6B6787]">Ver informacion</Text>
        </Pressable>
      </View>

      {/* aLERtas  */}
      <Pressable
        className="mb-6 flex-row items-center justify-between rounded-2xl border border-[#E4E2EE] bg-white px-5 py-4"
        onPress={() => router.push("/alertas")}
      >
        <View className="flex-row items-center">
          <View className="rounded-xl bg-[#F59E0B] p-2">
            <Ionicons name="megaphone-outline" size={20} color="white" />
          </View>
          <Text className="ml-3 text-[15px] font-bold text-[#1B1733]">Canal de Alertas</Text>
        </View>
        {nuevas > 0 && (
          <View className="rounded-full border border-[#FCD34D] bg-[#FEF3C7] px-3 py-1">
            <Text className="text-xs font-bold text-[#B45309]">
              {nuevas} {nuevas === 1 ? "NUEVA" : "NUEVAS"}
            </Text>
          </View>
        )}
      </Pressable>



      {/* Tareas estaticas por ahora  */}
      <Text className="mb-3 text-base font-bold text-[#1B1733]">
        Proximas Tareas
      </Text>

      {/*Ej 1 */}
      <View className="mb-3 flex-row rounded-2xl bg-white p-4 shadow-sm border-l-4 border-[#22C55E]">
        <View className="items-center mr-3 pr-3 border-r border-gray-100">
          <Text className="font-bold text-[#15803D]">12:00</Text>
          <View className="mt-2 h-3 w-3 rounded-full border-2 border-[#22C55E] bg-[#22C55E]" />
        </View>
        <View className="flex-1 justify-between">
          <View>
            <Text className="font-bold text-gray-800">
              Tienda • FALABELLA Mall Plaza Trebol
            </Text>
            <Text className="text-sm text-[#6B6787]">
              Reposicion zona Infantil / Juvenil
            </Text>
          </View>
          <View className="mt-2 self-start rounded-md border border-[#86EFAC] bg-[#DCFCE7] px-3 py-1">
            <Text className="text-xs font-bold text-[#15803D]">COMPLETA</Text>
          </View>
        </View>
      </View>

      {/* Ej 2 */}
      <View className="mb-8 flex-row rounded-2xl bg-white p-4 shadow-sm">
        <View className="items-center mr-3 pr-3 border-r border-gray-100">
          <Text className="font-bold text-[#6C4CF5]">13:00</Text>
          <View className="mt-2 h-3 w-3 rounded-full border-2 border-[#6C4CF5] bg-white" />
        </View>
        <View className="flex-1">
          <Text className="font-bold text-gray-800">
            Tienda PARIS Mall Plaza Trebol
          </Text>
          <Text className="text-sm text-[#6B6787]">
            Reposicion zona Infantil / Juvenil
          </Text>
        </View>
      </View>

      {/* cERrar sesion */}
      <Pressable
        className="mb-10 items-center rounded-xl bg-[#4636A8] py-3"
        onPress={signOut}
      >
        <Text className="font-semibold text-white">Cerrar sesión</Text>
      </Pressable>
      </View>

      {/* Scann */}
      <BarcodeScannerModal
        isVisible={escanerAbierto}
        onClose={() => setEscanerAbierto(false)}
        onScanSuccess={(data, type) => {
          setEscanerAbierto(false);
          Alert.alert(
            "codigo escaneado",
            `Tipo ${type}\ncodigo scc-14: ${data}`
          );
        }}
      />
    </ScrollView>
  );
}
