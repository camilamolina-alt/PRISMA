import { API_URL } from "@/config/api";
import { useAuthSession } from "@/providers/AuthProvider";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TipoPromo = "precio" | "promo" | "evento";

interface Promocion {
  id: number;
  tipo: TipoPromo;
  sku: string | null;
  descripcion: string;
  precioNormal: number | null;
  precioOferta: number | null;
  tienda: string;
  desde: string;
  hasta: string | null;
}

// Datos de ejemplo 
// llega de get
type PromoBD = {
  idPromo: number;
  tipo: TipoPromo;
  tienda: string;
  sku: string | null;
  descrip: string;
  precioNorm: number | null;
  precioProm: number | null;
  desde: string;
  hasta: string | null;
};

const traducir = (p: PromoBD): Promocion => ({
  id: p.idPromo,
  tipo: p.tipo,
  sku: p.sku,
  descripcion: p.descrip,
  precioNormal: p.precioNorm,
  precioOferta: p.precioProm,
  tienda: p.tienda,
  desde: p.desde,
  hasta: p.hasta,
});

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

const pesos = (n: number) => "$" + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const fechaCorta = (iso: string) => {
  const [, m, d] = iso.split("-");
  return `${Number(d)} ${meses[Number(m) - 1]}`;
};

export default function VerPromos() {
  const insets = useSafeAreaInsets();
  const { token } = useAuthSession();
  const [filtro, setFiltro] = useState<TipoPromo | "todas">("todas");
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/promociones`, { headers: { Authorization: token } });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const datos: PromoBD[] = await res.json();
      setPromociones(datos.map(traducir));
      setError(null);
    } catch {
      setError("No se pudieron cargar las promociones");
    } finally {
      setCargando(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  const hoy = new Date().toISOString().slice(0, 10);
  const activas = promociones.filter((p) => !p.hasta || p.hasta >= hoy);
  const visibles = activas.filter((p) => filtro === "todas" || p.tipo === filtro);

  const porCadena = visibles.reduce<Record<string, Promocion[]>>((grupos, p) => {
    (grupos[p.tienda] ??= []).push(p);
    return grupos;
  }, {});

  const vigentes = activas.filter((p) => p.desde <= hoy).length;
  const proximas = activas.filter((p) => p.desde > hoy).length;
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
          <Resumen numero={Object.keys(activas.reduce((s, p) => ({ ...s, [p.tienda]: 1 }), {})).length} texto="Cadenas" />
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
        {cargando && <ActivityIndicator color="#0B7C8E" style={{ paddingVertical: 32 }} />}
        {error && <Text className="py-8 text-center text-[15px] text-[#C4202F]">{error}</Text>}
        {!cargando && !error && Object.keys(porCadena).length === 0 && (
          <Text className="py-8 text-center text-[15px] text-[#3B5760]">No hay promociones de este tipo</Text>
        )}

        {Object.entries(porCadena).map(([cadena, lista]) => (
          <View key={cadena} className="gap-3">
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
