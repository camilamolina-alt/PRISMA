import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BarcodeScanningResult, CameraView, useCameraPermissions } from "expo-camera";
import { useState } from "react";
import { Alert, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useAuthSession } from "../../providers/AuthProvider";
export default function Home() {
  const { signOut } = useAuthSession();
  const [permiso, pedirPermiso] =useCameraPermissions();
  const [escaneado, setEscaneado] = useState(false);
  const [escanerAbierto, setEscanerAbierto] = useState(false);

  const handleAbrirEscaner = async () => {
    if (!permiso?.granted) {
      const { granted } = await pedirPermiso();
      if (!granted) {
        Alert.alert(
          "Permiso requerido",
          "Se necesita acceso a la camara para escanera codigos"
        );
        return;
      }
    }
    setEscaneado(false)
    setEscanerAbierto(true)
  };
  const handleEscaneado =({ type, data}: BarcodeScanningResult) => {
    if (escaneado) return;
    setEscaneado(true);
    setEscanerAbierto(false);

    Alert.alert(
      "codigo escaneado",
      `Tipo ${type}\ncodigo scc-14: ${data}`,
      [{ text: "Aceptar", onPress: () => setEscaneado(false)}]
    );
  };

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
            Sebastian Moreno Molina
          </Text>
          <Text className="text-xs text-gray-400">Promotor Ruta</Text>
        </View>
      </View>

      <View className="mb-4 flex-row items-center justify-between rounded-2xl bg-white p-5 shadow-sm">
        <View>
          <Text className="text-sm font-semibold text-gray-400">Ruta Diaria</Text>
          <Text className="text-3xl font-extrabold text-gray-800">83%</Text>
          <Text className="text-xs text-gray-500">Tiendas visitadas : 2</Text>
        </View>
        
        <View className="h-16 w-16 items-center justify-center rounded-full border-8 border-sky-200 border-t-sky-400">
        </View>
      </View>

      {/* Alerta Quiebre de Stock */}
      <Pressable className="mb-6 flex-row items-center justify-between rounded-2xl bg-red-100 p-4 border border-red-200">
        <View className="flex-row items-center space-x-3">
          <Ionicons name="warning" size={32} color="#dc2626" />
          <View className="ml-2">
            <Text className="font-bold text-red-700">Quiebre de Stock</Text>
            <Text className="text-xs text-red-600">Venta 0 en</Text>
          </View>
        </View>
        <Feather name="chevron-right" size={24} color="#dc2626" />
      </Pressable>

      {/* Acciones Rapidas */}
      <Text className="mb-3 text-base font-semibold text-gray-400">
        Acciones Rapidas
      </Text>
      <View className="mb-6 flex-row justify-between space-x-3">
        {/* Boton Reporte Diario */}
        <Pressable className="flex-1 items-center rounded-2xl bg-white p-4 shadow-sm">
          <View className="mb-2 rounded-xl bg-sky-100 p-3">
            <Feather name="camera" size={28} color="#0284c7" />
          </View>
          <Text className="font-bold text-gray-800">Reporte Diario</Text>
          <Text className="text-xs text-gray-400">Documentar dia</Text>
        </Pressable>

        {/* Boton Escanear SCC-14 */}
        <Pressable className="flex-1 items-center rounded-2xl bg-white p-4 shadow-sm" onPress={handleAbrirEscaner}>
          <View className="mb-2 rounded-xl bg-sky-100 p-3">
            <MaterialCommunityIcons name="barcode-scan" size={28} color="#0284c7" />
          </View>
          <Text className="font-bold text-gray-800">Escanear SCC-14</Text>
          <Text className="text-xs text-gray-400">Escanear mercaderia</Text>
        </Pressable>
      </View>

      {/* Banner Canal de Alertas */}
      <Pressable className="mb-6 flex-row items-center justify-between rounded-2xl bg-gray-900 px-5 py-4">
        <View className="flex-row items-center">
          <Ionicons name="megaphone-outline" size={20} color="white" />
          <Text className="ml-2 font-bold text-white">Canal de Alertas</Text>
        </View>
        <View className="rounded-full bg-sky-500 px-3 py-1">
          <Text className="text-xs font-bold text-white">NUEVA</Text>
        </View>
      </Pressable>

      {/* Proximas Tareas */}
      <Text className="mb-3 text-base font-semibold text-gray-400">
        Proximas Tareas
      </Text>

      {/* Tarea 1 - Completa */}
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

      {/* Tarea 2 - Pendiente */}
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

      {/* Botón de Cerrar Sesión */}
      <Pressable
        className="mb-10 items-center rounded-xl bg-gray-800 py-3"
        onPress={signOut}
      >
        <Text className="font-semibold text-white">Cerrar sesión</Text>
      </Pressable>
      <Modal visible={escanerAbierto} animationType="slide">
        <View className="flex-1 bg-black">
          <CameraView
            style={{ flex: 1 }}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: ["itf14", "ean13", "code128"],
            }}
            onBarcodeScanned={escaneado ? undefined : handleEscaneado}
          >
            {/* Overlay y Guía visual de escaneo */}
            <View className="flex-1 items-center justify-between py-12 px-6">
              <View className="w-full flex-row justify-end">
                <Pressable
                  className="rounded-full bg-gray-900/80 p-3"
                  onPress={() => setEscanerAbierto(false)}
                >
                  <Ionicons name="close" size={28} color="white" />
                </Pressable>
              </View>

              <View className="items-center">
                {/* Cuadro indicador de área de escaneo */}
                <View className="h-48 w-80 rounded-2xl border-2 border-dashed border-sky-400 bg-transparent" />
                <Text className="mt-4 font-semibold text-white">
                  Alinea el código SCC-14 dentro del recuadro
                </Text>
              </View>

              <Pressable
                className="rounded-xl bg-red-600 px-8 py-3"
                onPress={() => setEscanerAbierto(false)}
              >
                <Text className="font-bold text-white">Cancelar</Text>
              </Pressable>
            </View>
          </CameraView>
        </View>
      </Modal>
    </ScrollView>
  );
}