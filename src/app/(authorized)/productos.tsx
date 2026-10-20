import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { API_URL } from "../../config/api";
import { useAuthSession } from "../../providers/AuthProvider";

type Stock = {
  idStock: number;
  producto: { sku: string; nombre: string; tipo?: string };
  tienda: { departamento: string; ubicacion: string };
  cantidadSala: number | null;
  cantidadPlanilla: number | null;
  stockCritico: number | null;
};

function StockItem({
  item,
  esSupervisor,
  onGuardar,
}: {
  item: Stock;
  esSupervisor: boolean;
  onGuardar: (id: number, cantidad: number) => Promise<void>;
}) {
  // Cada quien edita su propia cantidad
  const actual = esSupervisor ? item.cantidadPlanilla : item.cantidadSala;
  const [valor, setValor] = useState(actual?.toString() ?? "");
  const [guardando, setGuardando] = useState(false);

  const critico =
    item.cantidadSala != null &&
    item.stockCritico != null &&
    item.cantidadSala <= item.stockCritico;
  const hayDiferencia =
    item.cantidadSala != null &&
    item.cantidadPlanilla != null &&
    item.cantidadSala !== item.cantidadPlanilla;

  const guardar = async () => {
    const n = parseInt(valor, 10);
    if (Number.isNaN(n) || n < 0) return;
    setGuardando(true);
    await onGuardar(item.idStock, n);
    setGuardando(false);
  };

  return (
    <View style={[styles.card, critico && styles.cardCritico]}>
      <Text style={styles.nombre}>{item.producto.nombre}</Text>
      <Text style={styles.sub}>
        {item.producto.sku} · {item.tienda.ubicacion}
      </Text>

      <View style={styles.fila}>
        <Text style={styles.dato}>Sala: {item.cantidadSala ?? "—"}</Text>
        {esSupervisor && (
          <Text style={styles.dato}>Planilla: {item.cantidadPlanilla ?? "—"}</Text>
        )}
        <Text style={styles.dato}>Crítico: {item.stockCritico ?? "—"}</Text>
      </View>

      {critico && <Text style={styles.avisoRojo}>⚠️ Stock crítico</Text>}
      {esSupervisor && hayDiferencia && (
        <Text style={styles.avisoNaranja}>
          Diferencia entre sala y planilla:{" "}
          {Math.abs((item.cantidadSala ?? 0) - (item.cantidadPlanilla ?? 0))}
        </Text>
      )}

      <View style={styles.fila}>
        <TextInput
          style={styles.input}
          value={valor}
          onChangeText={setValor}
          keyboardType="numeric"
          placeholder={esSupervisor ? "Cantidad planilla" : "Cantidad en sala"}
        />
        <TouchableOpacity style={styles.boton} onPress={guardar} disabled={guardando}>
          <Text style={styles.botonTexto}>{guardando ? "..." : "Guardar"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function Productos() {
const { token, rol } = useAuthSession();
  const esSupervisor = rol === "supervisor";

  const [datos, setDatos] = useState<Stock[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(`${API_URL}/api/stock`, {
        headers: { Authorization: token ?? "" },
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setDatos(await res.json());
    } catch (e) {
      setError("No se pudo cargar el stock");
    } finally {
      setCargando(false);
    }
  }, [token]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const guardar = async (id: number, cantidad: number) => {
    const ruta = esSupervisor ? "planilla" : "sala";
    try {
      const res = await fetch(`${API_URL}/api/stock/${id}/${ruta}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ?? "",
        },
        body: JSON.stringify({ cantidad }),
      });
      if (!res.ok) throw new Error();
      const actualizado: Stock = await res.json();
      // Reemplazo solo esa fila en la lista
      setDatos((prev) => prev.map((s) => (s.idStock === id ? actualizado : s)));
    } catch {
      setError("No se pudo guardar el cambio");
    }
  };

  if (cargando) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>Productos</Text>
      {error && <Text style={styles.avisoRojo}>{error}</Text>}
      <FlatList
        data={datos}
        keyExtractor={(s) => s.idStock.toString()}
        renderItem={({ item }) => (
          <StockItem item={item} esSupervisor={esSupervisor} onGuardar={guardar} />
        )}
        refreshControl={<RefreshControl refreshing={false} onRefresh={cargar} />}
        ListEmptyComponent={<Text style={styles.sub}>No hay stock todavía</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, padding: 16 },
  titulo: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  cardCritico: { borderColor: "#d33" },
  nombre: { fontSize: 16, fontWeight: "600" },
  sub: { color: "#666", marginBottom: 8 },
  fila: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 6 },
  dato: { fontSize: 14 },
  avisoRojo: { color: "#d33", marginTop: 6 },
  avisoNaranja: { color: "#c70", marginTop: 6 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  boton: { backgroundColor: "#2563eb", borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
  botonTexto: { color: "#fff", fontWeight: "600" },
});