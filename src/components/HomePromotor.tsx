import { Feather, FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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
    <ScrollView className="flex-1 bg-gray-50 px-4 pt-12">
      {/* Navbar Superior con menú */}
      <View className="mb-4 flex-row items-center justify-between">
        
      </View>

      {/* Tarjeta de Perfil */}
      <View className="mb-4 flex-row items-center rounded-2xl bg-white p-4 shadow-sm">
        <View className="mr-4 rounded-full bg-sky-600 p-3">
          <Ionicons name="person" size={36} color="white" />
        </View>
        <View>
          <Text className="text-lg font-bold text-gray-800">
            {nombre ?? "Cargando..."}
          </Text>
          <Text className="text-xs text-gray-400">Promotor Ruta</Text>
        </View>
      </View>

      {/* Estaticos por ahora */}
      <View className="mb-4 flex-row items-center justify-between rounded-2xl bg-white p-5 shadow-sm">
        <View>
          <Text className="text-sm font-semibold text-gray-400">Ruta Diaria</Text>
          <Text className="text-3xl font-extrabold text-gray-800">83%</Text>
          <Text className="text-xs text-gray-500">Tiendas visitadas : 2</Text>
        </View>
        
        <View className="h-16 w-16 items-center justify-center rounded-full border-8 border-sky-200 border-t-sky-400">
        </View>
      </View>

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
      <Text className="mb-3 text-base font-semibold text-gray-400">
        Acciones Rapidas
      </Text>
      <View className="mb-6 flex-row justify-between space-x-3">
        {/* Reoporte diario  */}
        <Pressable className="flex-1 items-center rounded-2xl bg-white p-4 shadow-sm">
          <View className="mb-2 rounded-xl bg-sky-100 p-3">
            <Feather name="camera" size={28} color="#0284c7" />
          </View>
          <Text className="font-bold text-gray-800">Reporte Diario</Text>
          <Text className="text-xs text-gray-400">Documentar dia</Text>
        </Pressable>
        

        {/* Boton de scaner*/}
        <Pressable
          className="flex-1 items-center rounded-2xl bg-white p-4 shadow-sm"
          onPress={() => setEscanerAbierto(true)}
        >
          <View className="mb-2 rounded-xl bg-sky-100 p-3">
            <MaterialCommunityIcons name="barcode-scan" size={28} color="#0284c7" />
          </View>
          <Text className="font-bold text-gray-800">Escanear Sku</Text>
          <Text className="text-xs text-gray-400">Escanear mercaderia</Text>
        </Pressable>

        {/* Boton Tiendas: lleva a la lista y de ahi al detalle */}
        <Pressable
          className="flex-1 items-center rounded-2xl bg-white p-4 shadow-sm"
          onPress={() => router.push("/tiendas")}
        >
          <View className="mb-2 rounded-xl bg-sky-100 p-3">
            <FontAwesome5 name="store" size={26} color="#0284c7" />
          </View>
          <Text className="font-bold text-gray-800">Tiendas</Text>
          <Text className="text-xs text-gray-400">Ver informacion</Text>
        </Pressable>
      </View>

      {/* aLERtas  */}
      <Pressable
        className="mb-6 flex-row items-center justify-between rounded-2xl bg-gray-900 px-5 py-4"
        onPress={() => router.push("/alertas")}
      >
        <View className="flex-row items-center">
          <Ionicons name="megaphone-outline" size={20} color="white" />
          <Text className="ml-2 font-bold text-white">Canal de Alertas</Text>
        </View>
        {nuevas > 0 && (
          <View className="rounded-full bg-sky-500 px-3 py-1">
            <Text className="text-xs font-bold text-white">
              {nuevas} {nuevas === 1 ? "NUEVA" : "NUEVAS"}
            </Text>
          </View>
        )}
      </Pressable>

      

      {/* Tareas estaticas por ahora  */}
      <Text className="mb-3 text-base font-semibold text-gray-400">
        Proximas Tareas
      </Text>

      {/*Ej 1 */}
      <View className="mb-3 flex-row rounded-2xl bg-white p-4 shadow-sm border-l-4 border-sky-400">
        <View className="items-center mr-3 pr-3 border-r border-gray-100">
          <Text className="font-bold text-sky-600">12:00</Text>
          <View className="mt-2 h-3 w-3 rounded-full border-2 border-sky-400 bg-white" />
        </View>
        <View className="flex-1 justify-between">
          <View>
            <Text className="font-bold text-gray-800">
              Tienda • FALABELLA Mall Plaza Trebol
            </Text>
            <Text className="text-xs text-gray-400">
              Reposicion zona Infantil / Juvenil
            </Text>
          </View>
          <View className="mt-2 self-start rounded-md bg-sky-400 px-3 py-1">
            <Text className="text-[10px] font-bold text-white">COMPLETA</Text>
          </View>
        </View>
      </View>

      {/* Ej 2 */}
      <View className="mb-8 flex-row rounded-2xl bg-white p-4 shadow-sm">
        <View className="items-center mr-3 pr-3 border-r border-gray-100">
          <Text className="font-bold text-gray-400">13:00</Text>
          <View className="mt-2 h-3 w-3 rounded-full border-2 border-gray-300 bg-white" />
        </View>
        <View className="flex-1">
          <Text className="font-bold text-gray-800">
            Tienda PARIS Mall Plaza Trebol
          </Text>
          <Text className="text-xs text-gray-400">
            Reposicion zona Infantil / Juvenil
          </Text>
        </View>
      </View>

      {/* cERrar sesion */}
      <Pressable
        className="mb-10 items-center rounded-xl bg-gray-800 py-3"
        onPress={signOut}
      >
        <Text className="font-semibold text-white">Cerrar sesión</Text>
      </Pressable>

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