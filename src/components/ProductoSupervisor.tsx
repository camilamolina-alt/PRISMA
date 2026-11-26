import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

// SOLO DISEÑO TODO ESTATICOO

type Vista = "stock" | "precios";
type Filtro = "diferencia" | "pendiente" | "todos";

const stockPrueba = [
  { id: 1, nombre: "pOlERON", sku: "77812", tienda: "Mall Plaza tREBOL", enviada: 24, sala: 18 as number | null },
  { id: 2, nombre: "Polera", sku: "66120", tienda: "Paris centro", enviada: 12, sala: 15 as number | null },
  { id: 3, nombre: "Traje de baño", sku: "50331", tienda: "Mall Plaza concepcion", enviada: 30, sala: null as number | null },
];

const promosPrueba = [
  { id: 1, titulo: "2x1invierno", detalle: "Promo · hasta el 20 nov", tipo: "promo", estado: "8/12" },
  { id: 2, titulo: "Cyber Day", detalle: "Evento · 25 al 27 nov", tipo: "evento", estado: "Programado" },
  { id: 3, titulo: "Nuevo precio POLERA SKU111000", detalle: "Cambio de precio · $3.990", tipo: "precio", estado: "12/12" },
];

// Colores 
const coloresPrisma = ["#8B7CFF", "#6E8CFF", "#4FA8F5", "#4FC8E8", "#2FCFC4", "#3FD6A0", "#6EDC9E", "#B5DE6A", "#FFC940", "#FF9F6E", "#FF7A9C", "#C77DFF"];

const estiloPill = {
  falta: { fondo: "#FDECEC", color: "#C4202F" },
  sobra: { fondo: "#FFF2DC", color: "#9A5300" },
  pendiente: { fondo: "#E6EEFF", color: "#2450C2" },
  ok: { fondo: "#E3F5F5", color: "#0A6D7D" },
};

const estiloPromo: Record<string, { fondo: string; color: string; icono: keyof typeof MaterialCommunityIcons.glyphMap }> = {
  promo: { fondo: "#ECE8FF", color: "#3A2B96", icono: "tag-outline" },
  evento: { fondo: "#FFF2DC", color: "#9A5300", icono: "calendar-star" },
  precio: { fondo: "#ECE8FF", color: "#3A2B96", icono: "percent-outline" },
};

const sombraTarjeta = { boxShadow: "0 4px 12px rgba(10, 85, 104, 0.08)" };
const sombraPrincipal = { boxShadow: "0 10px 24px rgba(10, 85, 104, 0.14)" };

export default function ProductoSupervisor() {
  const [vista, setVista] = useState<Vista>("stock");
  const [filtro, setFiltro] = useState<Filtro>("diferencia");

  // Datos estaticos "
  const aplicados = 9;
  const asignados = 12;
  const faltan = ["Janio", "Rocío", "Matías"];

  return (
    <ScrollView className="flex-1 bg-[#EEF6F7]">
      <StatusBar style="light" />

      {/* Header */}
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
          gap: 16,
        }}
      >
        <View>
          <Text className="text-[26px] font-extrabold text-white">Productos</Text>
          <Text className="text-sm text-[#D4F5F4]">
            {vista === "stock" ? "Sala y planilla " : "Promociones y eventos"}
          </Text>
        </View>

        <View className="flex-row rounded-full border border-[#FFFFFF33] bg-[#FFFFFF1F] p-1">
          {(["stock", "precios"] as Vista[]).map((v) => (
            <Pressable
              key={v}
              accessibilityRole="tab"
              accessibilityState={{ selected: vista === v }}
              onPress={() => setVista(v)}
              className={`h-10 flex-1 items-center justify-center rounded-full ${vista === v ? "bg-white" : ""}`}
            >
              <Text className={`text-[15px] ${vista === v ? "font-bold text-[#0A5568]" : "font-semibold text-white"}`}>
                {v === "stock" ? "Stock" : "Precios"}
              </Text>
            </Pressable>
          ))}
        </View>
      </LinearGradient>

      {vista === "stock" ? (
        <View className="-mt-9 gap-4 px-4 pb-10">
          {/* Resumen*/}
          <View className="flex-row rounded-3xl border border-[#DCEBEE] bg-white p-4" style={sombraPrincipal}>
            {[
              { valor: 5, texto: "Con diferencia", color: "#C4202F" },
              { valor: 3, texto: "Sin registrar", color: "#9A5300" },
              { valor: 42, texto: "Cuadrados", color: "#0A6D7D" },
            ].map((r) => (
              <View key={r.texto} className="flex-1 items-center">
                <Text className="text-2xl font-extrabold" style={{ color: r.color }}>{r.valor}</Text>
                <Text className="text-xs text-[#3B5760]">{r.texto}</Text>
              </View>
            ))}
          </View>

          {/* Buscador */}
          <View className="h-12 flex-row items-center gap-2 rounded-2xl border border-[#DCEBEE] bg-white px-4" style={sombraTarjeta}>
            <Feather name="search" size={18} color="#6E8C94" />
            <TextInput
              className="flex-1 text-[15px] text-[#10262E]"
              placeholder="Buscar por nombre o SKU"
              placeholderTextColor="#6E8C94"
            />
          </View>

          {/* Filtros */}
          <View className="flex-row gap-2">
            {([
              { id: "diferencia", texto: "Con diferencia" },
              { id: "pendiente", texto: "Sin registrar" },
              { id: "todos", texto: "Todos" },
            ] as { id: Filtro; texto: string }[]).map((f) => (
              <Pressable
                key={f.id}
                accessibilityRole="button"
                accessibilityState={{ selected: filtro === f.id }}
                onPress={() => setFiltro(f.id)}
                className={`rounded-full border px-4 py-2 ${
                  filtro === f.id ? "border-[#0B7C8E] bg-[#0B7C8E]" : "border-[#DCEBEE] bg-white"
                }`}
              >
                <Text className={`text-sm ${filtro === f.id ? "font-bold text-white" : "font-semibold text-[#10262E]"}`}>
                  {f.texto}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Lista de productos */}
          <View className="rounded-2xl border border-[#DCEBEE] bg-white pl-4" style={sombraTarjeta}>
            {stockPrueba.map((p, i) => {
              const diferencia = p.sala == null ? null : p.sala - p.enviada;
              const pill =
                diferencia == null ? estiloPill.pendiente
                : diferencia < 0 ? estiloPill.falta
                : diferencia > 0 ? estiloPill.sobra
                : estiloPill.ok;
              const textoPill =
                diferencia == null ? "Pendiente"
                : diferencia === 0 ? "OK"
                : diferencia > 0 ? `+${diferencia}` : `${diferencia}`;

              return (
                <Pressable
                  key={p.id}
                  accessibilityRole="button"
                  className={`min-h-[72px] flex-row items-center gap-3 py-3 pr-4 ${
                    i < stockPrueba.length - 1 ? "border-b border-[#E3EEF0]" : ""
                  }`}
                >
                  <View className="h-11 w-11 items-center justify-center rounded-xl bg-[#E3F5F5]">
                    <Feather name="package" size={22} color="#0A6D7D" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[15px] font-bold text-[#10262E]" numberOfLines={1}>{p.nombre}</Text>
                    <Text className="text-xs text-[#3B5760]">{p.tienda} · SKU {p.sku}</Text>
                    <Text className="mt-1 text-sm text-[#10262E]">
                      Enviado <Text className="font-bold">{p.enviada}</Text> · Sala{" "}
                      <Text className={p.sala == null ? "text-[#6E8C94]" : "font-bold"}>{p.sala ?? "—"}</Text>
                    </Text>
                  </View>
                  <View className="rounded-full px-2.5 py-1" style={{ backgroundColor: pill.fondo }}>
                    <Text className="text-xs font-bold" style={{ color: pill.color }}>{textoPill}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : (
        <View className="-mt-9 gap-4 px-4 pb-10">
          <View className="gap-2 rounded-3xl border border-[#DCEBEE] bg-white p-5" style={sombraPrincipal}>
            <View className="flex-row items-baseline justify-between">
              <Text className="text-[15px] font-bold text-[#10262E]">Aplicados en tienda</Text>
              <Text className="text-2xl font-bold text-[#0A6D7D]">
                {aplicados}
                <Text className="text-sm font-normal text-[#3B5760]"> de {asignados}</Text>
              </Text>
            </View>
            <View
              accessible
              accessibilityLabel={`${aplicados} de ${asignados} promotores aplicaron los cambios`}
              className="flex-row gap-1"
            >
              {Array.from({ length: asignados }, (_, i) => (
                <View
                  key={i}
                  className={`h-3 flex-1 rounded-full ${i < aplicados ? "" : "border border-dashed border-[#9DB6BC] bg-[#E2ECEE]"}`}
                  style={i < aplicados ? { backgroundColor: coloresPrisma[i % coloresPrisma.length] } : undefined}
                />
              ))}
            </View>
            <Text className="text-sm text-[#3B5760]">
              Faltan {faltan.length}: {faltan.slice(0, -1).join(", ")} y {faltan[faltan.length - 1]}
            </Text>
          </View>

          {/* Boton principal */}
          <Pressable
            accessibilityRole="button"
            className="overflow-hidden rounded-full"
            style={{ boxShadow: "0 4px 10px rgba(11, 124, 142, 0.3)" }}
          >
            <LinearGradient
              colors={["#0B7C8E", "#0EA5B0"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ height: 48, flexDirection: "row", gap: 6, alignItems: "center", justifyContent: "center" }}
            >
              <Feather name="plus" size={20} color="white" />
              <Text className="text-[15px] font-bold text-white">Nueva promo o evento</Text>
            </LinearGradient>
          </Pressable>

          {/* Promos activas */}
          <View className="gap-3">
            <Text className="text-base font-bold text-[#10262E]">Activas</Text>
            <View className="rounded-2xl border border-[#DCEBEE] bg-white pl-4" style={sombraTarjeta}>
              {promosPrueba.map((p, i) => {
                const estilo = estiloPromo[p.tipo];
                const programado = p.estado === "Programado";
                return (
                  <Pressable
                    key={p.id}
                    accessibilityRole="button"
                    className={`min-h-[64px] flex-row items-center gap-3 py-3 pr-4 ${
                      i < promosPrueba.length - 1 ? "border-b border-[#E3EEF0]" : ""
                    }`}
                  >
                    <View className="h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: estilo.fondo }}>
                      <MaterialCommunityIcons name={estilo.icono} size={22} color={estilo.color} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[15px] font-bold text-[#10262E]" numberOfLines={1}>{p.titulo}</Text>
                      <Text className="text-xs text-[#3B5760]">{p.detalle}</Text>
                    </View>
                    <View
                      className="rounded-full px-2.5 py-1"
                      style={{ backgroundColor: programado ? estiloPill.pendiente.fondo : estiloPill.ok.fondo }}
                    >
                      <Text
                        className="text-xs font-bold"
                        style={{ color: programado ? estiloPill.pendiente.color : estiloPill.ok.color }}
                      >
                        {p.estado}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}
