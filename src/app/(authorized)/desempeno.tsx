import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { promotores, RegistroDesempeno } from "../../data/promotores";

function formatearPesos(valor: number) {
  return "$" + valor.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function cumplimiento(r: RegistroDesempeno) {
  if (r.tareasAsignadas === 0) return 0;
  return Math.round((r.tareasCumplidas / r.tareasAsignadas) * 100);
}

function colorBarra(pct: number) {
  if (pct >= 80) return "bg-green-500";
  if (pct >= 60) return "bg-yellow-500";
  return "bg-red-500";
}

export default function Desempeno() {
  // 1. PRIMERO declaramos los estados para que existan en memoria
  const [zonaSeleccionada, setZonaSeleccionada] = useState<string>("Todas");
  const [seleccionado, setSeleccionado] = useState(promotores[0].id);

  // 2. DESPUÉS filtramos y validamos usando esos estados
  const promotoresFiltrados = zonaSeleccionada === "Todas"
    ? promotores
    : promotores.filter((p) => p.zona === zonaSeleccionada);

  const promotor =
    promotoresFiltrados.find((p) => p.id === seleccionado) ?? promotoresFiltrados[0] ?? promotores[0];
  
  const actual = promotor.historial[0];

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ padding: 16 }}
    >
      {/* Filtro por Zonas */}
      <Text className="mb-2 text-sm font-semibold text-gray-500">Filtrar por Zona</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        className="mb-4"
      >
        {["Todas", "Norte", "Centro", "Sur"].map((zona) => (
          <Pressable
            key={zona}
            onPress={() => setZonaSeleccionada(zona)}
            className={`mr-2 rounded-xl px-4 py-2 border ${
              zonaSeleccionada === zona
                ? "bg-sky-800 border-sky-800"
                : "bg-white border-slate-200"
            }`}
          >
            <Text
              className={`font-semibold ${
                zonaSeleccionada === zona ? "text-white" : "text-gray-700"
              }`}
            >
              {zona}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Selector de promotor (filtrados por zona) */}
      <Text className="mb-2 text-sm font-semibold text-gray-500">Promotor</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        className="mb-5"
      >
        {promotoresFiltrados.map((p) => (
          <Pressable
            key={p.id}
            onPress={() => setSeleccionado(p.id)}
            className={`mr-2 rounded-full px-4 py-2 ${
              p.id === seleccionado ? "bg-blue-500" : "bg-white"
            }`}
          >
            <Text
              className={`font-semibold ${
                p.id === seleccionado ? "text-white" : "text-gray-700"
              }`}
            >
              {p.nombre}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Resumen del período actual */}
      <Text className="mb-2 text-lg font-bold text-gray-800">
        Resumen {actual.periodo}
      </Text>
      <View className="mb-6 flex-row">
        <View className="mr-2 flex-1 rounded-2xl bg-white p-3">
          <Text className="text-xs text-gray-500">Ventas</Text>
          <Text className="mt-1 text-base font-bold text-blue-500">
            {formatearPesos(actual.ventas)}
          </Text>
        </View>
        <View className="mr-2 flex-1 rounded-2xl bg-white p-3">
          <Text className="text-xs text-gray-500">Reposiciones</Text>
          <Text className="mt-1 text-base font-bold text-blue-500">
            {actual.reposiciones}
          </Text>
        </View>
        <View className="flex-1 rounded-2xl bg-white p-3">
          <Text className="text-xs text-gray-500">Cumplimiento</Text>
          <Text className="mt-1 text-base font-bold text-blue-500">
            {cumplimiento(actual)}%
          </Text>
        </View>
      </View>

      {/* Historial por período */}
      <Text className="mb-2 text-lg font-bold text-gray-800">Historial</Text>
      {promotor.historial.map((r) => {
        const pct = cumplimiento(r);
        return (
          <View key={r.periodo} className="mb-3 rounded-2xl bg-white p-4">
            <Text className="mb-2 font-bold text-gray-800">{r.periodo}</Text>

            <View className="mb-1 flex-row justify-between">
              <Text className="text-gray-500">Ventas</Text>
              <Text className="font-semibold text-gray-800">
                {formatearPesos(r.ventas)}
              </Text>
            </View>
            <View className="mb-1 flex-row justify-between">
              <Text className="text-gray-500">Reposiciones</Text>
              <Text className="font-semibold text-gray-800">
                {r.reposiciones}
              </Text>
            </View>
            <View className="mb-2 flex-row justify-between">
              <Text className="text-gray-500">Tareas cumplidas</Text>
              <Text className="font-semibold text-gray-800">
                {r.tareasCumplidas}/{r.tareasAsignadas} ({pct}%)
              </Text>
            </View>

            {/* Barra de progreso */}
            <View className="h-2 overflow-hidden rounded-full bg-gray-200">
              <View
                className={`h-2 rounded-full ${colorBarra(pct)}`}
                style={{ width: `${pct}%` }}
              />
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}