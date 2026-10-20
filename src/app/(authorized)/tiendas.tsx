import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { API_URL } from "../../config/api";
import { useAuthSession } from "../../providers/AuthProvider";

type Tienda = {
  idTienda: number;
  departamento: string;
  ubicacion: string;
  nombre: string | null; // nuevo: puede venir vacío en tiendas antiguas
};

export default function Tiendas() {
  const { token } = useAuthSession();
  const router = useRouter();
  const [tiendas, setTiendas] = useState<Tienda[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  }, [token]);

  if (cargando) return <ActivityIndicator style={{ flex: 1 }} />;
  if (error) return <Text style={{ padding: 20 }}>Falló: {error}</Text>;

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <FlatList
        data={tiendas}
        keyExtractor={(t) => String(t.idTienda)}
        ListEmptyComponent={
          <Text style={{ color: "#6b7280", textAlign: "center", marginTop: 40 }}>
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
              paddingVertical: 14,
              paddingHorizontal: 16,
              marginBottom: 10,
              backgroundColor: "#fff",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#e5e7eb",
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "600", color: "#1f2937" }}>
                {item.nombre ?? `${item.departamento} — ${item.ubicacion}`}
              </Text>
              {item.nombre && (
                <Text style={{ color: "#6b7280", fontSize: 12, marginTop: 2 }}>
                  {item.departamento} — {item.ubicacion}
                </Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </Pressable>
        )}
      />
    </View>
  );
}