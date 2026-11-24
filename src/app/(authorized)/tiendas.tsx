import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { API_URL } from "../../config/api";
import { useAuthSession } from "../../providers/AuthProvider";

type Tienda = {
  idTienda: number;
  departamento: string;
  ubicacion: string;
  nombre: string | null;
};

export default function Tiendas() {
  const { token } = useAuthSession();
  const router = useRouter();
  const [tiendas, setTiendas] = useState<Tienda[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [misTiendas, setMisTiendas] = useState<number[]>([]);
  const [verTodas, setVerTodas] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/tiendas`, {
      headers: { Authorization: token ?? "" },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then((data) => setTiendas(data))
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));

    fetch(`${API_URL}/api/asignaciones/mias`, {
      headers: { Authorization: token ?? "" },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((asignaciones: { tienda: { idTienda: number } }[]) =>
        setMisTiendas(asignaciones.map((a) => a.tienda.idTienda))
      )
      .catch(() => {});
  }, [token]);

  
  const tengoTiendas = misTiendas.length > 0;
  const esMia = (t: Tienda) => misTiendas.includes(t.idTienda);
  const visibles = !tengoTiendas || verTodas
    ? [...tiendas].sort((a, b) => Number(esMia(b)) - Number(esMia(a))) // las mías arriba
    : tiendas.filter(esMia);

  if (cargando) return <ActivityIndicator style={{ flex: 1, backgroundColor: "#F5F4FB" }} color="#5743C2" size="large" />;
  if (error) return <Text style={{ padding: 20, fontSize: 15, fontWeight: "500", color: "#DC2626" }}>Falló: {error}</Text>;

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F4FB" }}>
      <StatusBar style="light" />

      <LinearGradient
        colors={["#4636A8", "#5743C2", "#4F6FD0", "#3F96C4"]}
        locations={[0, 0.45, 0.8, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 22 }}
      >
        <Text style={{ fontSize: 26, fontWeight: "700", color: "#fff" }}>Tiendas</Text>
        <Text style={{ fontSize: 15, color: "#E6E2FC", marginTop: 4 }}>
          {tengoTiendas
            ? `${misTiendas.length} ${misTiendas.length === 1 ? "tienda asignada" : "tiendas asignadas"}`
            : `${tiendas.length} ${tiendas.length === 1 ? "tienda" : "tiendas"}`}
        </Text>
      </LinearGradient>

      {tengoTiendas && (
        <View
          style={{
            flexDirection: "row",
            gap: 4,
            marginHorizontal: 16,
            marginTop: 16,
            padding: 5,
            backgroundColor: "#fff",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#E4E2EE",
          }}
        >
          {[
            { valor: false, texto: `Mis tiendas (${misTiendas.length})` },
            { valor: true, texto: `Todas (${tiendas.length})` },
          ].map((op) => {
            const activo = verTodas === op.valor;
            return (
              <Pressable
                key={op.texto}
                onPress={() => setVerTodas(op.valor)}
                accessibilityRole="tab"
                accessibilityState={{ selected: activo }}
                style={{
                  flex: 1,
                  alignItems: "center",
                  paddingVertical: 10,
                  borderRadius: 12,
                  backgroundColor: activo ? "#4636A8" : "transparent",
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: "700", color: activo ? "#fff" : "#6B6787" }}>
                  {op.texto}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      <FlatList
        data={visibles}
        contentContainerStyle={{ padding: 16 }}
        keyExtractor={(t) => String(t.idTienda)}
        ListEmptyComponent={
          <Text style={{ color: "#6B6787", fontSize: 15, textAlign: "center", marginTop: 40 }}>
            No hay tiendas todavía
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/detalle",
                params: { id: String(item.idTienda) },
              })
            }
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 16,
              marginBottom: 12,
              backgroundColor: "#fff",
              borderRadius: 18,
              borderWidth: 1,
              borderColor: "#E4E2EE",
            }}
          >
            <LinearGradient
              colors={["#0D9F94", "#0B93D6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ width: 52, height: 52, borderRadius: 15, alignItems: "center", justifyContent: "center", marginRight: 14 }}
            >
              <FontAwesome5 name="store" size={22} color="white" />
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>

                {esMia(item) && <Ionicons name="star" size={15} color="#5743C2" />}
                <Text style={{ flexShrink: 1, fontSize: 16, fontWeight: "700", color: "#1B1733" }}>
                  {item.nombre ?? `${item.departamento} — ${item.ubicacion}`}
                </Text>
              </View>
              {!!item.nombre && (
                <Text style={{ color: "#6B6787", fontSize: 14, marginTop: 2 }}>
                  {item.departamento} — {item.ubicacion}
                </Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={22} color="#6B6787" />
          </Pressable>
        )}
      />
    </View>
  );
}
