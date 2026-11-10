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
import ProductoEscaneadoModal, { ProductoEscaneado } from "./ProductoEscaneadoModal";

// TAREAS 
type TipoTarea = "precio" | "repo" | "promo";

const estiloTipo: Record<TipoTarea, { texto: string; fondo: string; color: string }> = {
  precio: { texto: "Cambio de precio", fondo: "#E1EBFF", color: "#1F47A8" },
  repo: { texto: "Reposición", fondo: "#ECE8FF", color: "#3A2B96" },
  promo: { texto: "Promoción", fondo: "#DDF5F3", color: "#075A66" },
};

function IconoTipo({ tipo, color }: { tipo: TipoTarea; color: string }) {
  if (tipo === "precio") return <Feather name="dollar-sign" size={12} color={color} />;
  if (tipo === "promo") return <Feather name="tag" size={12} color={color} />;
  return <MaterialCommunityIcons name="package-variant-closed" size={13} color={color} />;
}

// Sombras
const sombraTarjeta = { boxShadow: "0 4px 12px rgba(70, 54, 168, 0.08)" };
const sombraIcono = (rgb: string) => ({ boxShadow: `0 4px 10px rgba(${rgb}, 0.3)` });

export default function HomePromotor() {
  const { signOut, token } = useAuthSession();
  const router = useRouter();
  const { alertas } = useAlertas();


  const [escanerAbierto, setEscanerAbierto] = useState(false);
  const [producto, setProducto] = useState<ProductoEscaneado | null>(null);

  // Tareas estaticas por ahora
  const [tareas, setTareas] = useState([
    { id: 1, tipo: "precio" as TipoTarea, titulo: "Polera infantil mangb larga a $10.490", tienda: "Paris Concepción", lista: false },
    { id: 2, tipo: "repo" as TipoTarea, titulo: "Zona infantil y juvenil", tienda: "Paris Mall Plaza Trébol", lista: false },
    { id: 3, tipo: "promo" as TipoTarea, titulo: "30% en zona infantil", tienda: "Paris Mall Plaza Trébol", lista: false },
    { id: 4, tipo: "repo" as TipoTarea, titulo: "Zona infantil y juvenil", tienda: "Falabella Mall Plaza Trébol", lista: true },
  ]);

  // Nombre de registro para el usuario
  const [nombre, setNombre] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/api/me`, { headers: { Authorization: token } })
      .then((res) => (res.ok ? res.json() : null))
      .then((me) => setNombre(me?.nombre ?? null))
      .catch(() => {});
  }, [token]);

  const buscarProducto = async (sku: string) => {
  try {
    const res = await fetch(
      `${API_URL}/api/productos/sku/${encodeURIComponent(sku)}`,
      { headers: { Authorization: token ?? "" } }
    );

    if (res.status === 404) {
      Alert.alert("No encontrado", `No hay ningún producto con el SKU ${sku}`);
      return;
    }
    if (!res.ok) {
      Alert.alert("Error", "No se pudo buscar el producto");
      return;
    }

    const data: ProductoEscaneado = await res.json();
    setProducto(data);
  } catch {
    Alert.alert("Sin conexión", "No se pudo conectar con el servidor");
  }
};


  const criticas = alertas.filter((a) => a.nivel === "critico");
  const nuevas = alertas.filter((a) => a.nueva).length;

  const primerNombre = nombre?.split(" ")[0];
  const iniciales = nombre
    ? nombre.split(" ").filter(Boolean).map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "";

  const fechaHoy = new Date().toLocaleDateString("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // Primero lo pendiente 
  const proximas = [...tareas].sort((a, b) => Number(a.lista) - Number(b.lista)).slice(0, 3);

  const marcarTarea = (id: number) =>
    setTareas((prev) => prev.map((t) => (t.id === id ? { ...t, lista: !t.lista } : t)));

  return (
    <ScrollView className="flex-1 bg-[#F3F2FB]">
      <StatusBar style="light" />

      {/* Header iridiscente:Todavia no le entiendo mucho al gradient */}
      <LinearGradient
        colors={["#4636A8", "#5743C2", "#4F6FD0", "#3F96C4"]}
        locations={[0, 0.45, 0.8, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingHorizontal: 18,
          paddingTop: 58,
          paddingBottom: 64,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
          gap: 22,
        }}
      >
        {/* Perfil + campana */}
        <View className="flex-row items-center justify-between">
          <View className="flex-1 flex-row items-center gap-3">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-white">
              {iniciales ? (
                <Text className="text-lg font-bold text-[#4636A8]">{iniciales}</Text>
              ) : (
                <Ionicons name="person" size={24} color="#4636A8" />
              )}
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-white">
                {primerNombre ? `Hola, ${primerNombre}` : "Cargando..."}
              </Text>
              <Text className="text-sm text-[#E2DDFB]">Promotor de ruta, {fechaHoy}</Text>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Notificaciones, ${nuevas} nuevas`}
            className="h-11 w-11 items-center justify-center rounded-full border border-[#FFFFFF59] bg-[#FFFFFF29]"
            onPress={() => router.push("/alertas")}
          >
            <Ionicons name="notifications-outline" size={22} color="white" />
            {nuevas > 0 && (
              <View className="absolute -right-0.5 -top-0.5 h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-[#5743C2] bg-[#F03E4E] px-1">
                <Text className="text-[10px] font-bold text-white">{nuevas}</Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* Ruta del dia (estatico por ahora) */}
        <View className="flex-row items-center justify-between rounded-[20px] border border-[#FFFFFF33] bg-[#FFFFFF1F] px-5 py-4">
          <View>
            <Text className="text-[15px] font-semibold text-[#E2DDFB]">Ruta del día</Text>
            <Text className="text-[32px] font-extrabold text-white">83%</Text>
          </View>
          <View className="h-16 w-16 rounded-full border-[7px] border-[#FFFFFF33] border-t-[#8B7CFF] border-r-[#4FC8E8] border-b-[#6EDC9E]" />
        </View>
      </LinearGradient>

      <View className="-mt-9 gap-6 px-4 pb-10">
        {/* Solo sale si hay alertas criticas Prioridad */}
        {criticas.length > 0 && (
          <Pressable
            accessibilityRole="button"
            className="flex-row items-center gap-3 rounded-2xl border-2 border-[#F5A3A3] bg-white p-3.5"
            style={{ boxShadow: "0 8px 20px rgba(196, 32, 47, 0.16)" }}
            onPress={() => router.push("/alertas")}
          >
            <LinearGradient
              colors={["#FF6B6B", "#E02F3F"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" }}
            >
              <Ionicons name="warning-outline" size={24} color="white" />
            </LinearGradient>
            <View className="flex-1">
              <Text className="font-bold text-[#A3161F]">Stock crítico</Text>
              <Text className="text-xs text-[#1B1733]">
                {criticas.length} {criticas.length === 1 ? "producto" : "productos"} en {criticas[0].detalle}
              </Text>
            </View>
            <Feather name="chevron-right" size={22} color="#A3161F" />
          </Pressable>
        )}

        {/* Acciones rapidas */}
        <View className="gap-3">
          <Text className="text-base font-bold text-[#1B1733]">Acciones rápidas</Text>
          <View className="flex-row gap-3">
            {/* Reporte diario */}
            <Pressable
              accessibilityRole="button"
              className="flex-1 items-center rounded-2xl border border-[#E4E2EE] bg-white px-2 py-4"
              style={sombraTarjeta}
              onPress={() => router.push("/reporteSin")}
            >
              <LinearGradient
                colors={["#8B6CFF", "#5B3FE0"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[{ marginBottom: 8, borderRadius: 14, padding: 12 }, sombraIcono("91, 63, 224")]}
              >
                <Feather name="camera" size={28} color="white" />
              </LinearGradient>
              <Text className="text-center text-[15px] font-bold text-[#1B1733]">Reporte diario</Text>
              <Text className="mt-0.5 text-center text-[13px] text-[#6B6787]">Documentar el día</Text>
            </Pressable>

            {/* Boton de scaner */}
            <Pressable
              accessibilityRole="button"
              className="flex-1 items-center rounded-2xl border border-[#E4E2EE] bg-white px-2 py-4"
              style={sombraTarjeta}
              onPress={() => setEscanerAbierto(true)}
            >
              <LinearGradient
                colors={["#38BDF8", "#0284C7"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[{ marginBottom: 8, borderRadius: 14, padding: 12 }, sombraIcono("2, 132, 199")]}
              >
                <MaterialCommunityIcons name="barcode-scan" size={28} color="white" />
              </LinearGradient>
              <Text className="text-center text-[15px] font-bold text-[#1B1733]">Escanear SKU</Text>
              <Text className="mt-0.5 text-center text-[13px] text-[#6B6787]">Escanear mercadería</Text>
            </Pressable>

            {/* Boton Tiendas */}
            <Pressable
              accessibilityRole="button"
              className="flex-1 items-center rounded-2xl border border-[#E4E2EE] bg-white px-2 py-4"
              style={sombraTarjeta}
              onPress={() => router.push("/tiendas")}
            >
              <LinearGradient
                colors={["#2DD4BF", "#0D9488"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[{ marginBottom: 8, borderRadius: 14, padding: 12 }, sombraIcono("13, 148, 136")]}
              >
                <FontAwesome5 name="store" size={26} color="white" />
              </LinearGradient>
              <Text className="text-center text-[15px] font-bold text-[#1B1733]">Tiendas</Text>
              <Text className="mt-0.5 text-center text-[13px] text-[#6B6787]">Ver información</Text>
            </Pressable>
          </View>
        </View>

        {/* Canal de alertas */}
        <Pressable
          accessibilityRole="button"
          className="flex-row items-center justify-between rounded-2xl border border-[#E4E2EE] bg-white px-5 py-4"
          style={sombraTarjeta}
          onPress={() => router.push("/alertas")}
        >
          <View className="flex-row items-center">
            <LinearGradient
              colors={["#FFB547", "#F07C00"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[{ borderRadius: 12, padding: 8 }, sombraIcono("240, 124, 0")]}
            >
              <Ionicons name="megaphone-outline" size={20} color="white" />
            </LinearGradient>
            <Text className="ml-3 text-[15px] font-bold text-[#1B1733]">Canal de alertas</Text>
          </View>
          {nuevas > 0 && (
            <View className="rounded-full border border-[#FCD34D] bg-[#FEF3C7] px-3 py-1">
              <Text className="text-xs font-bold text-[#B45309]">
                {nuevas} {nuevas === 1 ? "nueva" : "nuevas"}
              </Text>
            </View>
          )}
        </Pressable>

        {/* Proximas tareas etiqueta suave por tipo + circulo para marcar */}
        <View className="gap-3">
          <Text className="text-base font-bold text-[#1B1733]">Próximas tareas</Text>
          <View className="rounded-2xl border border-[#E4E2EE] bg-white px-4" style={sombraTarjeta}>
            {proximas.map((t, i) => {
              const estilo = estiloTipo[t.tipo];
              return (
                <View
                  key={t.id}
                  className={`flex-row items-center gap-3 py-3.5 ${i < proximas.length - 1 ? "border-b border-[#ECEAF4]" : ""}`}
                >
                  <View className="flex-1 gap-1">
                    <View
                      className="flex-row items-center gap-1 self-start rounded-lg px-2 py-0.5"
                      style={{ backgroundColor: t.lista ? "#DCF7E5" : estilo.fondo }}
                    >
                      {t.lista ? (
                        <Feather name="check" size={12} color="#11602F" />
                      ) : (
                        <IconoTipo tipo={t.tipo} color={estilo.color} />
                      )}
                      <Text className="text-xs font-bold" style={{ color: t.lista ? "#11602F" : estilo.color }}>
                        {t.lista ? `${estilo.texto}, lista` : estilo.texto}
                      </Text>
                    </View>
                    <Text
                      className={`font-bold ${t.lista ? "text-[#6B6787] line-through" : "text-[#1B1733]"}`}
                    >
                      {t.titulo}
                    </Text>
                    <Text className="text-sm text-[#6B6787]">{t.tienda}</Text>
                  </View>

                  <Pressable
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: t.lista }}
                    accessibilityLabel={`Marcar ${t.titulo} como lista`}
                    hitSlop={8}
                    className={`h-9 w-9 items-center justify-center rounded-full ${
                      t.lista ? "bg-[#1F9D55]" : "border-2 border-[#8C86A8] bg-white"
                    }`}
                    onPress={() => marcarTarea(t.id)}
                  >
                    {t.lista && <Feather name="check" size={20} color="white" />}
                  </Pressable>
                </View>
              );
            })}
          </View>
        </View>

        {/* Cerrar sesion */}
        <Pressable
          accessibilityRole="button"
          className="items-center rounded-xl bg-[#4636A8] py-3"
          onPress={signOut}
        >
          <Text className="font-semibold text-white">Cerrar sesión</Text>
        </Pressable>
      </View>

      {/* Scann */}
      <BarcodeScannerModal
        isVisible={escanerAbierto}
        onClose={() => setEscanerAbierto(false)}
        onScanSuccess={(data) => {
          setEscanerAbierto(false);
          buscarProducto(data.trim());
        }}
      />

      {/* Producto escaneado */}
      <ProductoEscaneadoModal
        producto={producto}
        onClose={() => setProducto(null)}
        onEscanearOtro={() => {
          setProducto(null);
          setEscanerAbierto(true);
        }}
        onVerProducto={(sku) => {
          setProducto(null);
          router.push(`/productos?sku=${encodeURIComponent(sku)}`);
        }}
      />
    </ScrollView>
  );
}
