import { API_URL } from "@/config/api";
import { useAuthSession } from "@/providers/AuthProvider";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const sombraTarjeta = { boxShadow: "0 4px 12px rgba(70, 54, 168, 0.08)" };
const sombraIcono = (rgb: string) => ({
  boxShadow: `0 4px 10px rgba(${rgb}, 0.3)`,
});

type Conteo = { precio: number; promo: number; stock: number };

const filasResumen = [
  { clave: "precio", etiqueta: "Precio", texto: "Cambios de precio aplicados", fondo: "#EDE9FE", color: "#5B3FE0" },
  { clave: "promo", etiqueta: "Promo", texto: "Promociones aplicadas", fondo: "#FEF3C7", color: "#B45309" },
  { clave: "stock", etiqueta: "Stock", texto: "Productos en estado crítico", fondo: "#FEE2E2", color: "#B91C1C" },
] as const;

type Jornada = "sin" | "problema";

export default function Reporte() {
  const insets = useSafeAreaInsets();
  const [jornada, setJornada] = useState<Jornada | null>(null);
  const { token } = useAuthSession();
  const [tienda, setTienda] = useState("Cargando...");
  const [conteo, setConteo] = useState<Conteo>({ precio: 0, promo: 0, stock: 0 });

  useFocusEffect(
    useCallback(() => {
      if (!token) return;
      const leer = (ruta: string) =>
        fetch(`${API_URL}${ruta}`, { headers: { Authorization: token } })
          .then((r) => (r.ok ? r.json() : []))
          .catch(() => []);

      Promise.all([leer("/api/asignaciones/mias"), leer("/api/tareas/mio")]).then(async ([asignaciones, tareas]) => {
        const misTiendas = asignaciones.map((a: any) => a.tienda);
        setTienda(
          misTiendas.length
            ? misTiendas.map((t: any) => `${t.nombre} · ${t.ubicacion}`).join(", ")
            : "Sin tienda asignada"
        );

        const criticos = await Promise.all(
          misTiendas.map((t: any) => leer(`/api/stock/tienda/${t.idTienda}/criticos`))
        );

        setConteo({
          precio: tareas.filter((t: any) => t.tipo === "precio" && t.checkTarea).length,
          promo: tareas.filter((t: any) => t.tipo === "promo" && t.checkTarea).length,
          stock: criticos.flat().length,
        });
      });
    }, [token])
  );

  const horaSalida = new Date().toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const continuar = () => {
    if (jornada === "sin") router.push({ pathname: "/reporteSin", params: { tienda } });
    if (jornada === "problema") router.push({ pathname: "/reporteProb", params: { tienda } });
  };

  return (
    <ScrollView
      className="flex-1 bg-[#F5F4FB]"
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
    >
      <StatusBar style="light" />

      {/* Header */}
      <LinearGradient
        colors={["#4636A8", "#5743C2", "#4F6FD0", "#3F96C4"]}
        locations={[0, 0.45, 0.8, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingHorizontal: 20,
          paddingTop: insets.top + 16,
          paddingBottom: 56,
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
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
          <View className="ml-4">
            <Text className="text-2xl font-bold text-white">
              Fin de jornada
            </Text>
            <Text className="text-sm text-[#E2DDFB]">
              Paso 1 de 2 · Resumen
            </Text>
          </View>
        </View>

        <View className="mt-5 flex-row gap-2">
          <View className="h-1.5 flex-1 rounded-full bg-white" />
          <View className="h-1.5 flex-1 rounded-full bg-[#FFFFFF40]" />
        </View>
      </LinearGradient>

      <View className="-mt-6 gap-4 px-5">
        {/* Punto de venta */}
        <View
          className="flex-row items-center rounded-3xl border border-[#E4E2EE] bg-white p-4"
          style={sombraTarjeta}
        >
          <LinearGradient
            colors={["#2DD4BF", "#0D9488"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[{ borderRadius: 14, padding: 10 }, sombraIcono("13, 148, 136")]}
          >
            <MaterialCommunityIcons name="storefront-outline" size={26} color="white" />
          </LinearGradient>
          <View className="ml-3 flex-1">
            <Text className="text-[13px] text-[#6B6787]">Punto de venta</Text>
            <Text className="text-base font-bold text-[#1B1733]">{tienda}</Text>
          </View>
          <View className="ml-2 items-end">
            <Text className="text-[13px] text-[#6B6787]">Salida</Text>
            <Text className="text-base font-bold text-[#4636A8]">{horaSalida}</Text>
          </View>
        </View>

        {/* Resumen de la tienda */}
        <Text className="mt-1 text-base font-bold text-[#1B1733]">
          Resumen de la tienda
        </Text>
        <View
          className="rounded-3xl border border-[#E4E2EE] bg-white px-4"
          style={sombraTarjeta}
        >
          {filasResumen.map((item, i) => (
            <View
              key={item.etiqueta}
              className={`flex-row items-center py-3.5 ${
                i > 0 ? "border-t border-[#EFEDF5]" : ""
              }`}
            >
              <View className="flex-1">
                <View
                  className="self-start rounded-full px-2.5 py-0.5"
                  style={{ backgroundColor: item.fondo }}
                >
                  <Text className="text-xs font-semibold" style={{ color: item.color }}>
                    {item.etiqueta}
                  </Text>
                </View>
                <Text className="mt-1 text-[15px] font-semibold text-[#1B1733]">
                  {item.texto}
                </Text>
              </View>
              <Text className="text-xl font-bold" style={{ color: item.color }}>
                {conteo[item.clave]}
              </Text>
            </View>
          ))}
        </View>

        {/* ¿Cómo estuvo la jornada? */}
        <Text className="mt-1 text-base font-bold text-[#1B1733]">
          ¿Cómo estuvo la jornada?
        </Text>
        <View className="flex-row gap-3">
          <OpcionJornada
            titulo="Sin problemas"
            icono="smile"
            colores={["#8B6CFF", "#5B3FE0"]}
            sombra="91, 63, 224"
            seleccionada={jornada === "sin"}
            onPress={() => setJornada("sin")}
          />
          <OpcionJornada
            titulo="Hubo un problema"
            icono="alert-triangle"
            colores={["#FBBF24", "#F97316"]}
            sombra="249, 115, 22"
            seleccionada={jornada === "problema"}
            onPress={() => setJornada("problema")}
          />
        </View>

        {/* Continuar */}
        <Pressable
          onPress={continuar}
          disabled={!jornada}
          accessibilityRole="button"
          accessibilityState={{ disabled: !jornada }}
          style={{ opacity: jornada ? 1 : 0.45 }}
        >
          <LinearGradient
            colors={["#5B3FE0", "#4636A8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              {
                borderRadius: 16,
                paddingVertical: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              },
              sombraIcono("70, 54, 168"),
            ]}
          >
            <Text className="text-base font-bold text-white">Continuar</Text>
            <Feather name="arrow-right" size={18} color="white" />
          </LinearGradient>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function OpcionJornada({
  titulo,
  icono,
  colores,
  sombra,
  seleccionada,
  onPress,
}: {
  titulo: string;
  icono: keyof typeof Feather.glyphMap;
  colores: [string, string];
  sombra: string;
  seleccionada: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected: seleccionada }}
      accessibilityLabel={titulo}
      className={`flex-1 items-center rounded-3xl border-2 px-3 py-5 ${
        seleccionada ? "border-[#5B3FE0] bg-[#F1EEFF]" : "border-[#E4E2EE] bg-white"
      }`}
      style={sombraTarjeta}
    >
      <LinearGradient
        colors={colores}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[{ borderRadius: 14, padding: 10, marginBottom: 10 }, sombraIcono(sombra)]}
      >
        <Feather name={icono} size={24} color="white" />
      </LinearGradient>
      <Text
        className={`text-center text-[15px] font-bold ${
          seleccionada ? "text-[#4636A8]" : "text-[#1B1733]"
        }`}
      >
        {titulo}
      </Text>
    </Pressable>
  );
}
