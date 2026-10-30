import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { API_URL } from "../../config/api";
import { useAuthSession } from "../../providers/AuthProvider";
import { colorMensajes as C, colorStock } from "../../theme/colores";
import {Image} from "expo-image";
import { Ionicons } from "@expo/vector-icons";

type Stock = {
  idStock: number;
  producto: { sku: string; nombre: string; tipo?: string, idProducto: number, imageUrl?: string };
  tienda: { departamento: string; ubicacion: string };
  cantidadSala: number | null;
  cantidadPlanilla: number | null;
  stockCritico: number | null;
};

type EstadoStock = keyof typeof colorStock;

// El mismo degradado iridiscente del inicio
const GRADIENTE_HEADER = ["#4636A8", "#5743C2", "#4F6FD0", "#3F96C4"] as const;

// TODO: estático por ahora, va rotando para ver los tres estados.
// Después se calcula con cantidadSala vs stockCritico.
const ESTADOS_DEMO: EstadoStock[] = ["optimo", "critico", "bajo"];

function StockItem({
  item,
  estado,
  esSupervisor,
  onGuardar,
}: {
  item: Stock;
  estado: EstadoStock;
  esSupervisor: boolean;
  onGuardar: (id: number, cantidad: number) => Promise<void>;
}) {
  // Cada quien edita su propia cantidad
  const actual = esSupervisor ? item.cantidadPlanilla : item.cantidadSala;
  const [valor, setValor] = useState(actual?.toString() ?? "");
  const [guardando, setGuardando] = useState(false);

  const hayDiferencia =
    item.cantidadSala != null &&
    item.cantidadPlanilla != null &&
    item.cantidadSala !== item.cantidadPlanilla;

  const color = colorStock[estado];

  const guardar = async () => {
    const n = parseInt(valor, 10);
    if (Number.isNaN(n) || n < 0) return;
    setGuardando(true);
    await onGuardar(item.idStock, n);
    setGuardando(false);
  };

  return (
    <View style={[styles.card, { borderLeftColor: color.fuerte }]}>
      <View style={styles.cabecera}>
        {item.producto.imageUrl ? (
          <Image
            source={{ uri: `${API_URL}${item.producto.imageUrl}` }}
            style={styles.foto}
            contentFit="cover"
          />
        ) : (
          <View style={styles.foto}>
            <Ionicons name="camera-outline" size={28} color={C.niebla} />
          </View>
        )}

        <View style={styles.info}>
          <Text style={styles.nombre} numberOfLines={2}>{item.producto.nombre}</Text>
          <Text style={styles.sku}>{item.producto.sku}</Text>
          <Text style={styles.sku}>{item.tienda.ubicacion}</Text>

          <View style={styles.unidades}>
            <Text style={styles.unidadesNumero}>{item.cantidadSala ?? "—"}</Text>
            <Text style={styles.unidadesTexto}>unidades en sala</Text>
          </View>

          <View style={[styles.badge, { backgroundColor: color.fondo }]}>
            <View style={[styles.badgePunto, { backgroundColor: color.fuerte }]} />
            <Text style={[styles.badgeTexto, { color: color.fuerte }]}>{color.texto}</Text>
          </View>
        </View>
      </View>

      {esSupervisor && hayDiferencia && (
        <Text style={styles.avisoDiferencia}>
          Planilla dice {item.cantidadPlanilla}, sala tiene {item.cantidadSala}
        </Text>
      )}

      <View style={styles.conteo}>
        <TextInput
          style={styles.input}
          value={valor}
          onChangeText={setValor}
          keyboardType="numeric"
          placeholder={esSupervisor ? "Cantidad planilla" : "Cantidad en sala"}
          placeholderTextColor={C.niebla}
        />
        <TouchableOpacity style={styles.boton} onPress={guardar} disabled={guardando}>
          <Text style={styles.botonTexto}>{guardando ? "Guardando..." : "Guardar"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function Productos() {
const { token, rol } = useAuthSession();
  const insets = useSafeAreaInsets();
  const esSupervisor = rol === "supervisor";

  const [datos, setDatos] = useState<Stock[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [buscadorActivo, setBuscadorActivo] = useState(false);

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

  // Busca por nombre o SKU, sin importar mayúsculas
  const texto = busqueda.trim().toLowerCase();
  const filtrados = texto
    ? datos.filter(
        (s) =>
          s.producto.nombre.toLowerCase().includes(texto) ||
          s.producto.sku.toLowerCase().includes(texto)
      )
    : datos;

  if (cargando) return <ActivityIndicator style={{ marginTop: 40 }} color={C.prisma} />;

  return (
    <View style={styles.contenedor}>
      <StatusBar style="light" />

      <LinearGradient
        colors={GRADIENTE_HEADER}
        locations={[0, 0.45, 0.8, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <Text style={styles.titulo}>Productos</Text>
        <Text style={styles.subtitulo}>
          {datos.length} {datos.length === 1 ? "producto" : "productos"} en sala
        </Text>
      </LinearGradient>

      {/* Buscador montado sobre el borde del header */}
      <View style={styles.barra}>
        <View style={[styles.buscador, buscadorActivo && styles.buscadorActivo]}>
          <Ionicons name="search" size={18} color={buscadorActivo ? C.prisma : C.niebla} />
          <TextInput
            style={styles.buscadorInput}
            value={busqueda}
            onChangeText={setBusqueda}
            onFocus={() => setBuscadorActivo(true)}
            onBlur={() => setBuscadorActivo(false)}
            placeholder="Buscar producto o SKU"
            placeholderTextColor={C.niebla}
            autoCorrect={false}
          />
          {busqueda.length > 0 && (
            <Pressable onPress={() => setBusqueda("")} hitSlop={10}>
              <Ionicons name="close-circle" size={18} color={C.niebla} />
            </Pressable>
          )}
        </View>

        {/* TODO: el filtro todavía no hace nada */}
        <TouchableOpacity style={styles.filtrar} activeOpacity={0.8} accessibilityLabel="Filtrar productos">
          <Ionicons name="options-outline" size={20} color={C.prisma} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtrados}
        keyExtractor={(s) => s.idStock.toString()}
        contentContainerStyle={styles.lista}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View>
            <Text style={styles.seccion}>Inventario en sala</Text>
            {error && <Text style={styles.error}>{error}</Text>}
          </View>
        }
        renderItem={({ item, index }) => (
          <StockItem
            item={item}
            estado={ESTADOS_DEMO[index % ESTADOS_DEMO.length]}
            esSupervisor={esSupervisor}
            onGuardar={guardar}
          />
        )}
        refreshControl={<RefreshControl refreshing={false} onRefresh={cargar} tintColor={C.prisma} />}
        ListEmptyComponent={
          <Text style={styles.vacio}>
            {texto ? `Ningún producto coincide con "${busqueda}"` : "Todavía no hay productos en sala"}
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: C.fondo },
  lista: { paddingHorizontal: 16, paddingBottom: 32 },

  // Más bajo que el del inicio: solo título y conteo, para que no le robe protagonismo a la lista
  header: {
    paddingHorizontal: 20,
    paddingBottom: 44,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  titulo: { fontSize: 26, fontWeight: "800", color: "#fff" },
  subtitulo: { fontSize: 14, color: C.lila, marginTop: 2 },

  barra: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    marginTop: -26,
  },

  buscador: {
    flex: 1,
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: C.borde,
    borderRadius: 999,
    paddingHorizontal: 14,
  },
  buscadorActivo: { borderColor: C.prisma },
  buscadorInput: { flex: 1, fontSize: 15, color: C.tinta, paddingVertical: 0 },

  filtrar: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: C.borde,
    alignItems: "center",
    justifyContent: "center",
  },

  seccion: { fontSize: 17, fontWeight: "700", color: C.tinta, marginTop: 20, marginBottom: 12 },
  error: { color: colorStock.critico.fuerte, marginBottom: 12 },
  vacio: { textAlign: "center", color: C.niebla, marginTop: 32 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.borde,
    borderLeftWidth: 5,
    padding: 12,
    marginBottom: 14,
  },
  cabecera: { flexDirection: "row", gap: 14 },
  foto: {
    width: 104,
    height: 136,
    borderRadius: 10,
    backgroundColor: C.lila,
    alignItems: "center",
    justifyContent: "center",
  },
  info: { flex: 1 },
  nombre: { fontSize: 16, fontWeight: "700", color: C.tinta, marginBottom: 4 },
  sku: { fontSize: 13, color: C.niebla, marginTop: 1 },

  unidades: { flexDirection: "row", alignItems: "baseline", gap: 6, marginTop: "auto" },
  unidadesNumero: { fontSize: 24, fontWeight: "800", color: C.tinta },
  unidadesTexto: { fontSize: 13, color: C.niebla },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 6,
  },
  badgePunto: { width: 7, height: 7, borderRadius: 4 },
  badgeTexto: { fontSize: 12, fontWeight: "700" },

  avisoDiferencia: { color: colorStock.bajo.fuerte, fontSize: 13, marginTop: 10 },

  conteo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: C.borde,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: C.borde,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: C.tinta,
    backgroundColor: C.fondo,
  },
  boton: { backgroundColor: C.prisma, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 9 },
  botonTexto: { color: "#fff", fontWeight: "600" },
});
