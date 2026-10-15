import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { API_URL } from "../../config/api";
import { useAuthSession } from "../../providers/AuthProvider";

type Tienda = {
  idTienda: number;
  departamento: string;
  ubicacion: string;
};

export default function Tiendas() {
  const { token } = useAuthSession();
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
        renderItem={({ item }) => (
          <Text style={{ paddingVertical: 8 }}>
            {item.departamento} — {item.ubicacion}
          </Text>
        )}
      />
    </View>
  );
}