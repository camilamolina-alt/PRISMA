import {
  Feather, FontAwesome5, Ionicons, MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  Pressable, ScrollView, Text, TextInput, View
} from "react-native";
import BarcodeScannerModal from "../../components/BarcodeScannerModal";

export default function ProductsScreen() {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [escanerAbierto, setEscanerAbierto] = useState(false);
  const handleScanSuccess = (code: string, type: string) => {
    setEscanerAbierto(false);
    Alert.alert("SKU Detectado", `Código: ${code}\nTipo: ${type}`);
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-4 pt-12" showsVerticalScrollIndicator={false}>
        {/* Encabezado */}
        <Text className="mb-4 text-2xl font-bold text-sky-950">Productos</Text>

        {/* Card: Punto Actual en Ruta */}
        <View className="mb-4 flex-row items-center justify-between rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
          <View className="flex-row items-center flex-1 pr-2">
            <View className="rounded-xl bg-sky-50 p-2.5 mr-3">
              <FontAwesome5 name="store" size={18} color="#0284c7" />
            </View>
            <View>
              <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                PUNTO ACTUAL EN RUTA
              </Text>
              <Text className="text-sm font-bold text-gray-800">
                Falabella • Mall Plaza Trébol
              </Text>
            </View>
          </View>
          <View className="flex-row items-center rounded-full bg-emerald-50 px-3 py-1 border border-emerald-100">
            <View className="mr-1.5 h-2 w-2 rounded-full bg-emerald-500" />
            <Text className="text-xs font-semibold text-emerald-600">Activo</Text>
          </View>
        </View>

        {/* Acciones Rápidas Superior (2 Columnas) */}
        <View className="mb-4 flex-row space-x-3">
          {/* Card: Escanear SKU */}
          <Pressable
            onPress={() => setEscanerAbierto(true)}
            className="flex-1 rounded-2xl bg-sky-600 p-4 justify-between shadow-sm active:opacity-80"
          >
            <View className="mb-3 rounded-lg bg-sky-500/30 self-start p-2">
              <MaterialCommunityIcons name="barcode-scan" size={22} color="white" />
            </View>
            <View>
              <Text className="text-base font-bold text-white">Escanear SKU</Text>
              <View className="mt-2 flex-row items-center">
                <Text className="text-[10px] font-bold text-sky-100 uppercase mr-1">
                  ABRIR LECTOR
                </Text>
                <Feather name="arrow-right" size={12} color="white" />
              </View>
            </View>
          </Pressable>

          {/* Card: Ver Catálogo Sala */}
          <Pressable className="flex-1 rounded-2xl bg-sky-950 p-4 justify-between shadow-sm">
            <View className="mb-3 rounded-lg bg-sky-900/50 self-start p-2">
              <Ionicons name="grid-outline" size={22} color="white" />
            </View>
            <View>
              <Text className="text-base font-bold text-white">Ver Catalogo Sala</Text>
              <View className="mt-2 flex-row items-center">
                <Text className="text-[10px] font-bold text-sky-200 uppercase mr-1">
                  IR A CATALOGO
                </Text>
                <Feather name="arrow-right" size={12} color="white" />
              </View>
            </View>
          </Pressable>
        </View>

        {/* Resumen Total en Sala y Bodega */}
        <View className="mb-4 rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
          <View className="flex-row items-center justify-between mb-3">
            <View>
              <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                TOTAL EN SALA Y BODEGA
              </Text>
              <View className="flex-row items-baseline mt-1">
                <Text className="text-3xl font-black text-sky-950">1.248</Text>
                <Text className="ml-1.5 text-xs text-gray-500 font-medium">
                  unidades en local
                </Text>
              </View>
            </View>
            <View className="items-end">
              <View className="rounded-full bg-emerald-50 px-2.5 py-1 mb-1 border border-emerald-100">
                <Text className="text-[11px] font-bold text-emerald-600">
                  92% DISPONIBLE
                </Text>
              </View>
              <Text className="text-xs text-gray-400 font-medium">42 SKUs activos</Text>
            </View>
          </View>

          {/* Indicadores de Stock (Óptimo, Bajo, Crítico) */}
          <View className="flex-row justify-between space-x-2">
            {/* Óptimo */}
            <View className="flex-1 rounded-xl bg-emerald-50/60 p-3 items-center border border-emerald-100">
              <View className="flex-row items-center mb-1">
                <View className="mr-1.5 h-2 w-2 rounded-full bg-emerald-500" />
                <Text className="text-xs font-bold text-emerald-800">Óptimo</Text>
              </View>
              <Text className="text-xl font-extrabold text-emerald-700">1.080</Text>
              <Text className="text-[10px] text-emerald-600 font-medium">86% stock</Text>
            </View>

            {/* Stock Bajo */}
            <View className="flex-1 rounded-xl bg-amber-50/60 p-3 items-center border border-amber-100">
              <View className="flex-row items-center mb-1">
                <View className="mr-1.5 h-2 w-2 rounded-full bg-amber-500" />
                <Text className="text-xs font-bold text-amber-800">Stock Bajo</Text>
              </View>
              <Text className="text-xl font-extrabold text-amber-700">142</Text>
              <Text className="text-[10px] text-amber-600 font-medium">Reponer hoy</Text>
            </View>

            {/* Crítico */}
            <View className="flex-1 rounded-xl bg-rose-50/60 p-3 items-center border border-rose-100">
              <View className="flex-row items-center mb-1">
                <View className="mr-1.5 h-2 w-2 rounded-full bg-rose-500" />
                <Text className="text-xs font-bold text-rose-800">Crítico</Text>
              </View>
              <Text className="text-xl font-extrabold text-rose-700">26</Text>
              <Text className="text-[10px] text-rose-600 font-medium">3 Quiebres</Text>
            </View>
          </View>
        </View>

        {/* Explorar Productos en Sala */}
        <View className="mb-4">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              EXPLORAR PRODUCTOS EN SALA
            </Text>
            <Pressable>
              <Text className="text-xs font-bold text-sky-600">Ver catálogo {'>'}</Text>
            </Pressable>
          </View>

          {/* Input de Búsqueda y Filtro */}
          <View className="mb-3 flex-row items-center space-x-2">
            <View className="flex-1 flex-row items-center rounded-xl bg-white px-3 py-2.5 shadow-sm border border-gray-100">
              <Feather name="search" size={18} color="#9ca3af" />
              <TextInput
                placeholder="Buscar producto, SKU..."
                placeholderTextColor="#9ca3af"
                className="ml-2 flex-1 text-sm text-gray-800"
              />
            </View>
            <Pressable className="rounded-xl bg-gray-100 p-3 items-center justify-center border border-gray-200">
              <Ionicons name="options-outline" size={18} color="#4b5563" />
            </Pressable>
          </View>

          {/* Chips de Filtros */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row space-x-2">
            <Pressable
              onPress={() => setSelectedFilter("all")}
              className={`flex-row items-center rounded-xl px-3 py-1.5 ${
                selectedFilter === "all" ? "bg-sky-950" : "bg-white border border-gray-200"
              }`}
            >
              <Ionicons
                name="cube-outline"
                size={14}
                color={selectedFilter === "all" ? "white" : "#4b5563"}
              />
              <Text
                className={`ml-1.5 text-xs font-semibold ${
                  selectedFilter === "all" ? "text-white" : "text-gray-700"
                }`}
              >
                Todos
              </Text>
              <View
                className={`ml-1.5 rounded-full px-1.5 py-0.5 ${
                  selectedFilter === "all" ? "bg-sky-800" : "bg-gray-100"
                }`}
              >
                <Text
                  className={`text-[10px] font-bold ${
                    selectedFilter === "all" ? "text-white" : "text-gray-600"
                  }`}
                >
                  42
                </Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => setSelectedFilter("quiebres")}
              className={`flex-row items-center rounded-xl bg-white px-3 py-1.5 border border-gray-200`}
            >
              <View className="mr-1.5 h-2 w-2 rounded-full bg-rose-500" />
              <Text className="text-xs font-semibold text-gray-700">Quiebres</Text>
              <View className="ml-1.5 rounded-full bg-rose-50 px-1.5 py-0.5 border border-rose-100">
                <Text className="text-[10px] font-bold text-rose-600">3</Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => setSelectedFilter("low")}
              className={`flex-row items-center rounded-xl bg-white px-3 py-1.5 border border-gray-200`}
            >
              <View className="mr-1.5 h-2 w-2 rounded-full bg-amber-500" />
              <Text className="text-xs font-semibold text-gray-700">Stock Bajo</Text>
              <View className="ml-1.5 rounded-full bg-amber-50 px-1.5 py-0.5 border border-amber-100">
                <Text className="text-[10px] font-bold text-amber-600">6</Text>
              </View>
            </Pressable>
          </ScrollView>
        </View>

        {/* Vistas y Módulos de Productos */}
        <Text className="mb-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
          VISTAS Y MÓDULOS DE PRODUCTOS
        </Text>

        <View className="mb-12 space-y-3">
          {/* Módulo 1 */}
          <Pressable className="flex-row items-center justify-between rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
            <View className="flex-row items-center flex-1">
              <View className="rounded-xl bg-emerald-500 p-3 mr-3">
                <Ionicons name="grid" size={20} color="white" />
              </View>
              <View className="flex-1 pr-2">
                <View className="flex-row items-center">
                  <Text className="font-bold text-gray-800 text-sm">
                    Ver Productos en Sala
                  </Text>
                  <View className="ml-2 rounded-md bg-sky-100 px-1.5 py-0.5">
                    <Text className="text-[9px] font-bold text-sky-600">Principal</Text>
                  </View>
                </View>
                <Text className="text-xs text-gray-400 mt-0.5">
                  Inventario visual, percheros y SKUs
                </Text>
              </View>
            </View>
            <Feather name="chevron-right" size={20} color="#9ca3af" />
          </Pressable>

          {/* Módulo 2 */}
          <Pressable className="flex-row items-center justify-between rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
            <View className="flex-row items-center flex-1">
              <View className="rounded-xl bg-blue-700 p-3 mr-3">
                <Ionicons name="clipboard-outline" size={20} color="white" />
              </View>
              <View className="flex-1 pr-2">
                <Text className="font-bold text-gray-800 text-sm">
                  Auditoría y Conteo
                </Text>
                <Text className="text-xs text-gray-400 mt-0.5">
                  Verificar diferencias entre sistema y sala
                </Text>
              </View>
            </View>
            <Feather name="chevron-right" size={20} color="#9ca3af" />
          </Pressable>

          {/* Módulo 3 */}
          <Pressable className="flex-row items-center justify-between rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
            <View className="flex-row items-center flex-1">
              <View className="rounded-xl bg-purple-600 p-3 mr-3">
                <MaterialCommunityIcons name="truck-fast-outline" size={20} color="white" />
              </View>
              <View className="flex-1 pr-2">
                <Text className="font-bold text-gray-800 text-sm">
                  Alerta de Quiebre / Reposición
                </Text>
                <Text className="text-xs text-gray-400 mt-0.5">
                  Notificar al coordinador quiebres inminentes
                </Text>
              </View>
            </View>
            <Feather name="chevron-right" size={20} color="#9ca3af" />
          </Pressable>
        </View>
      </ScrollView>

      {/* Botón Flotante Inferior de Escaneo */}
      <View className="absolute bottom-6 right-6">
        <Pressable onPress={() => setEscanerAbierto(true)} className="h-14 w-14 items-center justify-center rounded-full bg-blue-700 shadow-lg active:opacity-80">
          <MaterialCommunityIcons name="barcode-scan" size={26} color="white" />
        </Pressable>
      </View>

      <BarcodeScannerModal
        isVisible={escanerAbierto}
        onClose={() => setEscanerAbierto(false)}
        onScanSuccess={handleScanSuccess}
        title="Alinea el código SKU o producto"
      />
    </View>
  );
}