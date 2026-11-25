import { API_URL } from "@/config/api";
import { useAuthSession } from "@/providers/AuthProvider";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ZONAS = ["norte", "centro", "sur"];
const FILTROS = ["todas", "sin zona", ...ZONAS];

type Tienda = { idTienda: number; nombre: string; ubicacion: string | null; zona: string | null };

export default function ZonasTiendas() {
  const insets = useSafeAreaInsets();
  const { token } = useAuthSession();

  const [tiendas, setTiendas] = useState<Tienda[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState("todas");

  useFocusEffect(
    useCallback(() => {
      if (!token) return;
      fetch(`${API_URL}/api/tiendas`, { headers: { Authorization: token } })
        .then((res) => res.json())
        .then((lista) => setTiendas(lista))
        .catch(() => {})
        .finally(() => setCargando(false));
    }, [token])
  );

  const aviso = (mensaje: string) => {
    if (Platform.OS === "web") window.alert(mensaje);
    else Alert.alert("Atención", mensaje);
  };

  const cambiarZona = (tienda: Tienda, zona: string) => {
    if (!token) return;
    fetch(`${API_URL}/api/tiendas/${tienda.idTienda}/zona`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: token },
      body: JSON.stringify({ zona }),
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((actualizada: Tienda) => {
        setTiendas((prev) => prev.map((t) => (t.idTienda === actualizada.idTienda ? actualizada : t)));
      })
      .catch(() => aviso("No se pudo cambiar la zona"));
  };

  const filtradas = tiendas.filter((t) =>
    filtro === "todas" ? true : filtro === "sin zona" ? !t.zona : t.zona === filtro
  );
  const sinZona = tiendas.filter((t) => !t.zona).length;

  return (
    <ScrollView className="flex-1 bg-[#EEF2FA]" contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
      <StatusBar style="light" />

      <LinearGradient
        colors={["#0B1B3F", "#13285C", "#1E3A8A", "#2F5BB7"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingHorizontal: 20,
          paddingTop: insets.top + 16,
          paddingBottom: 48,
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
          <View className="ml-4 flex-1">
            <Text className="text-2xl font-bold text-white">Tiendas</Text>
            <Text className="text-sm text-[#E3EAF8]">Zona de cada tienda</Text>
          </View>
        </View>
      </LinearGradient>

      <View className="-mt-6 gap-3 px-5">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {FILTROS.map((f) => {
            const activo = filtro === f;
            return (
              <Pressable
                key={f}
                onPress={() => setFiltro(f)}
                accessibilityRole="tab"
                accessibilityState={{ selected: activo }}
                className={`rounded-full border px-4 py-2 ${activo ? "border-[#1E3A8A] bg-[#1E3A8A]" : "border-[#DCE3F0] bg-white"}`}
              >
                <Text className={`text-sm font-semibold capitalize ${activo ? "text-white" : "text-[#4A5878]"}`}>
                  {f}
                  {f === "sin zona" && sinZona > 0 ? ` (${sinZona})` : ""}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {cargando ? (
          <ActivityIndicator color="#1E3A8A" style={{ marginTop: 32 }} />
        ) : filtradas.length === 0 ? (
          <Text className="mt-6 text-center text-sm text-[#4A5878]">No hay tiendas con este filtro</Text>
        ) : (
          filtradas.map((tienda) => (
            <View key={tienda.idTienda} className="rounded-2xl border border-[#E3EAF8] bg-white p-4 shadow-md">
              <Text className="text-base font-bold text-[#0F1B33]">{tienda.nombre}</Text>
              {tienda.ubicacion ? <Text className="text-sm text-[#4A5878]">{tienda.ubicacion}</Text> : null}

              <View className="mt-3 flex-row gap-2">
                {ZONAS.map((z) => {
                  const activa = tienda.zona === z;
                  return (
                    <Pressable
                      key={z}
                      onPress={() => cambiarZona(tienda, activa ? "" : z)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: activa }}
                      className={`flex-1 items-center rounded-lg border py-1.5 ${activa ? "border-[#2F5BB7] bg-[#2F5BB7]" : "border-[#DCE3F0] bg-white"}`}
                    >
                      <Text className={`text-xs font-semibold capitalize ${activa ? "text-white" : "text-[#4A5878]"}`}>{z}</Text>
                    </Pressable>
                  );
                })}
              </View>
              {!tienda.zona && <Text className="mt-1 text-xs text-[#B45309]">Sin zona: sus envíos no le llegan a ningún supervisor</Text>}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}
