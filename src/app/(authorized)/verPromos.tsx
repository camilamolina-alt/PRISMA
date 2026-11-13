import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TipoPromo = "precio" | "promo" | "evento";

// ORDEN DEL EXCEL (tipo, sku, descripción, precios, cadena, fechas)
interface Promocion {
  id: number;
  tipo: TipoPromo;
  sku: string | null;
  descripcion: string;
  precioNormal: number | null;
  precioOferta: number | null;
  tienda: string; // cadena: aplica a todas sus sucursales
  desde: string; // "AAAA-MM-DD"
  hasta: string | null;
}

// Datos de ejemplo 
const promociones: Promocion[] = [
  { id: 1, tipo: "promo", sku: "12345", descripcion: "20% en polerones", precioNormal: 19990, precioOferta: 15990, tienda: "Ripley", desde: "2026-11-10", hasta: "2026-11-20" },
  { id: 2, tipo: "precio", sku: "55120", descripcion: "Jeans skinny mujer", precioNormal: 24990, precioOferta: 21990, tienda: "Ripley", desde: "2026-11-12", hasta: null },
  { id: 3, tipo: "evento", sku: null, descripcion: "Black Friday", precioNormal: null, precioOferta: null, tienda: "Ripley", desde: "2026-11-27", hasta: "2026-11-30" },
  { id: 4, tipo: "precio", sku: "67890", descripcion: "Polera manga larga infantil", precioNormal: 12990, precioOferta: 10490, tienda: "Paris", desde: "2026-11-11", hasta: null },
  { id: 5, tipo: "promo", sku: "34567", descripcion: "30% zona infantil", precioNormal: 14990, precioOferta: 10490, tienda: "Paris", desde: "2026-11-08", hasta: "2026-11-18" },
  { id: 6, tipo: "evento", sku: null, descripcion: "Cyber Day", precioNormal: null, precioOferta: null, tienda: "Falabella", desde: "2026-11-30", hasta: "2026-12-02" },
  { id: 7, tipo: "promo", sku: "78901", descripcion: "2x1 en calcetines", precioNormal: 4990, precioOferta: 2495, tienda: "Falabella", desde: "2026-11-12", hasta: "2026-11-16" },
];

const estiloTipo: Record<TipoPromo, { texto: string; fondo: string; color: string; icono: keyof typeof Feather.glyphMap }> = {
  precio: { texto: "Precio", fondo: "#E1EBFF", color: "#1F47A8", icono: "dollar-sign" },
  promo: { texto: "Promo", fondo: "#DDF5F3", color: "#075A66", icono: "percent" },
  evento: { texto: "Evento", fondo: "#FFF2DC", color: "#9A5300", icono: "calendar" },
};

const filtros: { valor: TipoPromo | "todas"; texto: string }[] = [
  { valor: "todas", texto: "Todas" },
  { valor: "precio", texto: "Precios" },
  { valor: "promo", texto: "Promos" },
  { valor: "evento", texto: "Eventos" },
];

const sombraTarjeta = { boxShadow: "0 4px 12px rgba(10, 85, 104, 0.08)" };

// 15990 → "$15.990"
const pesos = (n: number) => "$" + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
// "2026-11-20" → "20 nov"
const fechaCorta = (iso: string) => {
  const [, m, d] = iso.split("-");
  return `${Number(d)} ${meses[Number(m) - 1]}`;
};

export default function VerPromos() {
  const insets = useSafeAreaInsets();
  const [filtro, setFiltro] = useState<TipoPromo | "todas">("todas");

  const hoy = new Date().toISOString().slice(0, 10);
  const visibles = promociones.filter((p) => filtro === "todas" || p.tipo === filtro);

  const porCadena = visibles.reduce<Record<string, Promocion[]>>((grupos, p) => {
    (grupos[p.tienda] ??= []).push(p);
    return grupos;
  }, {});

  const vigentes = promociones.filter((p) => p.desde <= hoy && (!p.hasta || p.hasta >= hoy)).length;
  const proximas = promociones.filter((p) => p.desde > hoy).length;

  return (
    <ScrollView className="flex-1 bg-[#EEF6F7]" contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
      <StatusBar style="light" />

      {/* Header */}
      <LinearGradient
        colors={["#0A5568", "#0B7C8E", "#0EA5B0", "#3BCBC3"]}
        locations={[0, 0.42, 0.78, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingHorizontal: 20,
          paddingTop: insets.top + 16,
          paddingBottom: 56,
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
          gap: 18,
        }}
      >
        <View className="flex-row items-center">
          <Pressable
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
            accessibilityRole="button"
            accessibilityLabel="Volver"
            className="h-11 w-11 items-center justify-center rounded-full border border-[#FFFFFF40] bg-[#FFFFFF26]"
          >
            <Feather name="chevron-left" size={24} color="white" />
          </Pressable>
          <View className="ml-4 flex-1">
            <Text className="text-2xl font-bold text-white">Promociones</Text>
            <Text className="text-sm text-[#D4F5F4]">Precios, promos y eventos por cadena</Text>
          </View>
        </View>

        {/* Resumen */}
        <View className="flex-row gap-3">
          <Resumen numero={vigentes} texto="Vigentes" />
          <Resumen numero={proximas} texto="Próximas" />
          <Resumen numero={Object.keys(promociones.reduce((s, p) => ({ ...s, [p.tienda]: 1 }), {})).length} texto="Cadenas" />
        </View>
      </LinearGradient>

      {/* Filtros por tipo */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="-mt-6"
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
      >
        {filtros.map((f) => {
          const activo = filtro === f.valor;
          return (
            <Pressable
              key={f.valor}
              onPress={() => setFiltro(f.valor)}
              accessibilityRole="radio"
              accessibilityState={{ selected: activo }}
              className={`rounded-full border px-4 py-2.5 ${activo ? "border-[#0B7C8E] bg-[#0B7C8E]" : "border-[#CFE3E6] bg-white"}`}
              style={sombraTarjeta}
            >
              <Text className={`text-[15px] font-semibold ${activo ? "text-white" : "text-[#0A5568]"}`}>{f.texto}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View className="mt-5 gap-6 px-5">
        {Object.keys(porCadena).length === 0 && (
          <Text className="py-8 text-center text-[15px] text-[#3B5760]">No hay promociones de este tipo</Text>
        )}

        {Object.entries(porCadena).map(([cadena, lista]) => (
          <View key={cadena} className="gap-3">
            {/* Encabezado de la cadena */}
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#0B7C8E]">
                <MaterialCommunityIcons name="storefront-outline" size={22} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-[#10262E]">{cadena}</Text>
                <Text className="text-sm text-[#3B5760]">Todas las sucursales · {lista.length} {lista.length === 1 ? "publicación" : "publicaciones"}</Text>
              </View>
            </View>

            {lista.map((p) => (
              <TarjetaPromo key={p.id} promo={p} hoy={hoy} />
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function Resumen({ numero, texto }: { numero: number; texto: string }) {
  return (
    <View className="flex-1 rounded-2xl border border-[#FFFFFF33] bg-[#FFFFFF1F] px-3 py-3">
      <Text className="text-2xl font-extrabold text-white">{numero}</Text>
      <Text className="text-sm text-[#D4F5F4]">{texto}</Text>
    </View>
  );
}

function TarjetaPromo({ promo, hoy }: { promo: Promocion; hoy: string }) {
  const estilo = estiloTipo[promo.tipo];
  const proxima = promo.desde > hoy;
  const descuento =
    promo.precioNormal && promo.precioOferta
      ? Math.round((1 - promo.precioOferta / promo.precioNormal) * 100)
      : null;

  const vigencia = promo.hasta
    ? `${fechaCorta(promo.desde)} – ${fechaCorta(promo.hasta)}`
    : `Desde el ${fechaCorta(promo.desde)}`;

  return (
    <View className="gap-3 rounded-3xl border border-[#DCEBEE] bg-white p-4" style={sombraTarjeta}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-1 rounded-lg px-2 py-0.5" style={{ backgroundColor: estilo.fondo }}>
          <Feather name={estilo.icono} size={12} color={estilo.color} />
          <Text className="text-xs font-bold" style={{ color: estilo.color }}>{estilo.texto}</Text>
        </View>
        {proxima ? (
          <Text className="text-xs font-bold text-[#9A5300]">Próximamente</Text>
        ) : (
          <View className="flex-row items-center gap-1">
            <View className="h-2 w-2 rounded-full bg-[#1F9D55]" />
            <Text className="text-xs font-bold text-[#11602F]">Vigente</Text>
          </View>
        )}
      </View>

      <View className="flex-row items-end justify-between gap-3">
        <View className="flex-1 gap-0.5">
          <Text className="text-base font-bold text-[#10262E]">{promo.descripcion}</Text>
          {promo.sku && <Text className="text-sm text-[#3B5760]">SKU {promo.sku}</Text>}
        </View>

        {promo.precioOferta !== null && (
          <View className="items-end">
            {promo.precioNormal !== null && (
              <Text className="text-sm text-[#6E8C94] line-through">{pesos(promo.precioNormal)}</Text>
            )}
            <Text className="text-xl font-extrabold text-[#0A6D7D]">{pesos(promo.precioOferta)}</Text>
          </View>
        )}
      </View>

      <View className="flex-row items-center justify-between border-t border-[#E3EEF0] pt-3">
        <View className="flex-row items-center gap-1.5">
          <Feather name="calendar" size={14} color="#3B5760" />
          <Text className="text-sm text-[#3B5760]">{vigencia}</Text>
        </View>
        {descuento !== null && descuento > 0 && (
          <View className="rounded-full bg-[#FDECEC] px-2.5 py-0.5">
            <Text className="text-xs font-bold text-[#C4202F]">-{descuento}%</Text>
          </View>
        )}
      </View>
    </View>
  );
}
