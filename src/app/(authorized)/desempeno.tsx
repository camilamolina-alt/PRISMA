import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
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

// Colores del prisma segun el cumplimiento (mismos tonos que el Inicio del supervisor)
function colorBarra(pct: number) {
  if (pct >= 80) return { barra: "#3FD6A0", texto: "#0A6D7D", fondo: "#E3F5F5" };
  if (pct >= 60) return { barra: "#FFC940", texto: "#9A5300", fondo: "#FFF2DC" };
  return { barra: "#FF7A9C", texto: "#C4202F", fondo: "#FDECEC" };
}

// Iniciales para el avatar (igual que el perfil del Inicio)
function iniciales(nombre: string) {
  return nombre
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// Sombras suaves (mismo valor que en las tarjetas del Inicio)
const sombraTarjeta = { boxShadow: "0 4px 12px rgba(10, 85, 104, 0.08)" };
const sombraPrincipal = { boxShadow: "0 10px 24px rgba(10, 85, 104, 0.14)" };

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
  const pctActual = cumplimiento(actual);

  return (
    <ScrollView className="flex-1 bg-[#EEF6F7]">
      <StatusBar style="light" />

      {/* Header turquesa: titulo + filtro por zonas */}
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
          gap: 18,
        }}
      >
        <View>
          <Text className="text-[26px] font-extrabold text-white">Mi equipo</Text>
          <Text className="text-sm text-[#D4F5F4]">
            {promotoresFiltrados.length} promotores · {actual.periodo}
          </Text>
        </View>

        {/* Filtro por Zonas */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
          {["Todas", "Norte", "Centro", "Sur"].map((zona) => (
            <Pressable
              key={zona}
              accessibilityRole="button"
              accessibilityState={{ selected: zonaSeleccionada === zona }}
              onPress={() => setZonaSeleccionada(zona)}
              className={`mr-2 rounded-full border px-4 py-2 ${
                zonaSeleccionada === zona
                  ? "border-white bg-white"
                  : "border-[#FFFFFF33] bg-[#FFFFFF1F]"
              }`}
            >
              <Text
                className={`text-sm ${
                  zonaSeleccionada === zona ? "font-bold text-[#0A5568]" : "font-semibold text-white"
                }`}
              >
                {zona}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </LinearGradient>

      <View className="-mt-9 gap-6 px-4 pb-10">
        {/* Selector de promotor (filtrados por zona) */}
        <View className="rounded-3xl border border-[#DCEBEE] bg-white pl-4" style={sombraPrincipal}>
          {promotoresFiltrados.length === 0 ? (
            <Text className="py-5 text-center text-[15px] text-[#3B5760]">Sin promotores en esta zona</Text>
          ) : (
            promotoresFiltrados.map((p, i) => {
              const pct = cumplimiento(p.historial[0]);
              const color = colorBarra(pct);
              const activo = p.id === promotor.id;
              return (
                <Pressable
                  key={p.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected: activo }}
                  accessibilityLabel={`${p.nombre}, zona ${p.zona}, ${pct} por ciento de cumplimiento`}
                  onPress={() => setSeleccionado(p.id)}
                  className={`flex-row items-center gap-3 py-3 pr-4 ${
                    i < promotoresFiltrados.length - 1 ? "border-b border-[#E3EEF0]" : ""
                  }`}
                >
                  <View
                    className={`h-11 w-11 items-center justify-center rounded-full ${activo ? "border-2 border-[#0B7C8E]" : ""}`}
                    style={{ backgroundColor: color.fondo }}
                  >
                    <Text className="text-[15px] font-bold" style={{ color: color.texto }}>
                      {iniciales(p.nombre)}
                    </Text>
                  </View>
                  <View className="flex-1 gap-1">
                    <View className="flex-row items-baseline justify-between">
                      <Text className={`text-[15px] font-bold ${activo ? "text-[#0A5568]" : "text-[#10262E]"}`}>
                        {p.nombre}
                      </Text>
                      <Text className="text-[15px] font-bold" style={{ color: color.texto }}>{pct}%</Text>
                    </View>
                    <Text className="text-xs text-[#3B5760]">
                      {p.zona} · {p.historial[0].tareasCumplidas} de {p.historial[0].tareasAsignadas} tareas
                    </Text>
                    <View className="h-1.5 overflow-hidden rounded-full bg-[#E2ECEE]">
                      <View className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: color.barra }} />
                    </View>
                  </View>
                </Pressable>
              );
            })
          )}
        </View>

        {/* Resumen del período actual */}
        <View className="gap-4 rounded-3xl border border-[#DCEBEE] bg-white p-5" style={sombraTarjeta}>
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-sm font-semibold text-[#3B5760]">
                Resumen {actual.periodo} · {promotor.nombre}
              </Text>
              <Text className="text-[32px] font-extrabold text-[#0A6D7D]">{pctActual}%</Text>
              <Text className="text-sm text-[#3B5760]">de cumplimiento</Text>
            </View>
            <View className="h-16 w-16 rounded-full border-[7px] border-[#E2ECEE] border-t-[#8B7CFF] border-r-[#4FC8E8] border-b-[#6EDC9E]" />
          </View>

          <View className="flex-row gap-2">
            <View className="flex-1 items-center rounded-2xl bg-[#EEF6F7] px-2 py-3">
              <Text className="text-base font-bold text-[#10262E]">{formatearPesos(actual.ventas)}</Text>
              <Text className="text-xs text-[#3B5760]">Ventas</Text>
            </View>
            <View className="flex-1 items-center rounded-2xl bg-[#EEF6F7] px-2 py-3">
              <Text className="text-base font-bold text-[#10262E]">{actual.reposiciones}</Text>
              <Text className="text-xs text-[#3B5760]">Reposiciones</Text>
            </View>
            <View className="flex-1 items-center rounded-2xl bg-[#EEF6F7] px-2 py-3">
              <Text className="text-base font-bold text-[#10262E]">
                {actual.tareasCumplidas}/{actual.tareasAsignadas}
              </Text>
              <Text className="text-xs text-[#3B5760]">Tareas</Text>
            </View>
          </View>
        </View>

        {/* Historial por período */}
        <View className="gap-3">
          <View className="flex-row items-center gap-2">
            <Ionicons name="trending-up" size={18} color="#0A6D7D" />
            <Text className="text-base font-bold text-[#10262E]">Historial</Text>
          </View>

          <View className="rounded-2xl border border-[#DCEBEE] bg-white pl-4" style={sombraTarjeta}>
            {promotor.historial.map((r, i) => {
              const pct = cumplimiento(r);
              const color = colorBarra(pct);
              return (
                <View
                  key={r.periodo}
                  className={`gap-2 py-4 pr-4 ${i < promotor.historial.length - 1 ? "border-b border-[#E3EEF0]" : ""}`}
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="text-[15px] font-bold text-[#10262E]">{r.periodo}</Text>
                    <View className="rounded-full px-2.5 py-0.5" style={{ backgroundColor: color.fondo }}>
                      <Text className="text-xs font-bold" style={{ color: color.texto }}>{pct}%</Text>
                    </View>
                  </View>

                  <View className="flex-row justify-between">
                    <View className="flex-row items-center gap-1.5">
                      <Feather name="dollar-sign" size={14} color="#6E8C94" />
                      <Text className="text-sm text-[#3B5760]">{formatearPesos(r.ventas)}</Text>
                    </View>
                    <View className="flex-row items-center gap-1.5">
                      <Feather name="package" size={14} color="#6E8C94" />
                      <Text className="text-sm text-[#3B5760]">{r.reposiciones} repos.</Text>
                    </View>
                    <View className="flex-row items-center gap-1.5">
                      <Feather name="check-square" size={14} color="#6E8C94" />
                      <Text className="text-sm text-[#3B5760]">
                        {r.tareasCumplidas}/{r.tareasAsignadas}
                      </Text>
                    </View>
                  </View>

                  {/* Barra de progreso */}
                  <View className="h-2 overflow-hidden rounded-full bg-[#E2ECEE]">
                    <View className="h-2 rounded-full" style={{ width: `${pct}%`, backgroundColor: color.barra }} />
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
