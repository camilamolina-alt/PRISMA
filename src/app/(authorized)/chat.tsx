import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";
import { API_URL } from "../../config/api";
import { useAuthSession } from "../../providers/AuthProvider";
import { colorMensajes as C } from "../../theme/colores";


type Contacto = {
  correo: string;
  nombre: string;
  rol: string;
  ultimo: string | null;
  fecha: string | null;
  noleido: number;
};

// horas
function horaLista(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const hoy = new Date();
  const ayer = new Date();
  ayer.setDate(hoy.getDate() - 1);
  if (d.toDateString() === hoy.toDateString())
    return d.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });
  if (d.toDateString() === ayer.toDateString()) return "Ayer";
  return d.toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit" });
}


function estiloRol(rol: string) {
  const esSupervisor = rol?.toLowerCase() === "supervisor";
  return {
    gradiente: esSupervisor ? (["#8B6CFF", "#5B3FE0"] as const) : (["#2DD4BF", "#0D9488"] as const),
    sombra: esSupervisor ? "rgba(91, 63, 224, 0.3)" : "rgba(13, 148, 136, 0.3)",
    fondoPill: esSupervisor ? "#ECE8FF" : "#DDF5F3",
    textoPill: esSupervisor ? "#3A2B96" : "#075A66",
    etiqueta: rol ? rol[0].toUpperCase() + rol.slice(1).toLowerCase() : "Usuario",
  };
}

type Filtro = "todos" | "sinLeer";

export default function Chats() {
  const { token } = useAuthSession();
  const router = useRouter();
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [cargando, setCargando] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todos");

  const cargar = useCallback(async () => {
    if (!token) return;
    setCargando(true);
    try {
      const r = await fetch(`${API_URL}/api/chat/contactos`, {
        headers: { Authorization: token },
      });
      if (r.ok) {
        const data: Contacto[] = await r.json();
        
        data.sort((a, b) => (b.fecha ?? "").localeCompare(a.fecha ?? ""));
        setContactos(data);
      }
    } catch {
    } finally {
      setCargando(false);
    }
  }, [token]);

 
  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  // Totales sin leer
  const totalSinLeer = contactos.reduce((suma, c) => suma + (c.noleido ?? 0), 0);
  const chatsSinLeer = contactos.filter((c) => c.noleido > 0).length;

  // Busqueda por nombre (solo el cel por ahora)
  const texto = busqueda.trim().toLowerCase();
  const visibles = contactos.filter(
    (c) =>
      (filtro === "todos" || c.noleido > 0) &&
      (!texto || c.nombre?.toLowerCase().includes(texto))
  );

  return (
    <View style={s.pantalla}>
      <StatusBar style="light" />

      <FlatList
        data={visibles}
        keyExtractor={(c) => c.correo}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={cargando} onRefresh={cargar} tintColor={C.prisma} />}
        ListHeaderComponent={
          <>
            {/* Header  */}
            <LinearGradient
              colors={["#4636A8", "#5743C2", "#4F6FD0", "#3F96C4"]}
              locations={[0, 0.45, 0.8, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.header}
            >
              {/* Brillo  */}
              <View style={s.brillo} />

      
              <View>
                <Text style={s.headerTitulo}>Comunicación</Text>
                <Text style={s.headerSub}>
                  {totalSinLeer > 0
                    ? `Tienes ${totalSinLeer} ${totalSinLeer === 1 ? "mensaje" : "mensajes"} sin leer`
                    : "Estás al día con tus mensajes"}
                </Text>
              </View>

              {/* Buscador */}
              <View style={s.buscador}>
                <Ionicons name="search" size={20} color={C.niebla} />
                <TextInput
                  value={busqueda}
                  onChangeText={setBusqueda}
                  placeholder="Buscar a una persona"
                  placeholderTextColor={C.niebla}
                  style={s.buscadorTexto}
                  accessibilityLabel="Buscar a una persona"
                  returnKeyType="search"
                />
                {busqueda.length > 0 && (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Borrar búsqueda"
                    hitSlop={10}
                    onPress={() => setBusqueda("")}
                  >
                    <Ionicons name="close-circle" size={20} color={C.niebla} />
                  </Pressable>
                )}
              </View>
            </LinearGradient>

            {/* Filtros Tdos y sin leer  */}
            <View style={s.filtros}>
              {(["todos", "sinLeer"] as Filtro[]).map((f) => {
                const activo = filtro === f;
                return (
                  <Pressable
                    key={f}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: activo }}
                    onPress={() => setFiltro(f)}
                    style={[s.filtro, activo && s.filtroActivo]}
                  >
                    <Text style={[s.filtroTexto, activo && { color: "#fff" }]}>
                      {f === "todos" ? "Todos" : "Sin leer"}
                    </Text>
                    {f === "sinLeer" && chatsSinLeer > 0 && (
                      <View style={s.filtroGlobo}>
                        <Text style={s.globoTexto}>{chatsSinLeer}</Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </>
        }
        ListEmptyComponent={
          !cargando ? (
            <View style={s.vacio}>
              <Ionicons name="chatbubbles-outline" size={32} color={C.prisma} />
              <Text style={s.vacioTitulo}>
                {texto ? "No encontramos a esa persona" : filtro === "sinLeer" ? "Todo leído" : "No hay contactos todavía"}
              </Text>
              <Text style={s.vacioTexto}>
                {texto ? "Revisa cómo escribiste el nombre" : "Cuando te escriban, aparecerán aquí"}
              </Text>
            </View>
          ) : undefined
        }
        renderItem={({ item: c, index }) => {
          const r = estiloRol(c.rol);
          const nuevo = c.noleido > 0;
          const primera = index === 0;
          const ultima = index === visibles.length - 1;
          return (

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${c.nombre}, ${r.etiqueta}${nuevo ? `, ${c.noleido} sin leer` : ""}`}
              onPress={() =>
                router.push({
                  pathname: "/conversacion",
                  params: { correo: c.correo, nombre: c.nombre },
                })
              }
            >
              {({ pressed }) => (
                <View
                  style={[
                    s.fila,
                    primera && s.filaPrimera,
                    ultima && s.filaUltima,
                    pressed && { backgroundColor: C.fondo },
                  ]}
                >
                  <LinearGradient
                    colors={r.gradiente}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[s.avatar, { boxShadow: `0 4px 10px ${r.sombra}` }]}
                  >
                    <Text style={s.avatarLetra}>{c.nombre?.[0]?.toUpperCase() ?? "?"}</Text>
                  </LinearGradient>

                  <View style={[s.centro, !ultima && s.centroDivisor]}>
                    <View style={s.filaArriba}>
                      <Text style={s.nombre} numberOfLines={1}>{c.nombre}</Text>
                      <Text style={[s.hora, nuevo && s.horaNueva]}>{horaLista(c.fecha)}</Text>
                    </View>

                    <View style={[s.rol, { backgroundColor: r.fondoPill }]}>
                      <Text style={[s.rolTexto, { color: r.textoPill }]}>{r.etiqueta}</Text>
                    </View>

                    <View style={s.filaAbajo}>
                      <Text
                        style={[s.ultimo, nuevo && s.ultimoNuevo, !c.ultimo && s.ultimoVacio]}
                        numberOfLines={1}
                      >
                        {c.ultimo ?? "Toca para escribirle"}
                      </Text>
                      {nuevo && (
                        <View style={s.globo}>
                          <Text style={s.globoTexto}>{c.noleido}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              )}
            </Pressable>
          );
        }}
      />
    </View>
  );
}


const sombraTarjeta = { boxShadow: "0 4px 12px rgba(70, 54, 168, 0.08)" };

const s = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: "#F3F2FB" },

  header: {
    paddingHorizontal: 18,
    paddingTop: 58,
    paddingBottom: 52,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    gap: 18,
    overflow: "hidden",
  },
  brillo: {
    position: "absolute",
    right: -64,
    top: -48,
    width: 208,
    height: 208,
    borderRadius: 104,
    backgroundColor: "#FFFFFF1A",
  },
  headerTitulo: { fontSize: 24, fontWeight: "800", color: "#fff" },
  headerSub: { fontSize: 14, color: C.lila, marginTop: 2 },

  buscador: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 48,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: "#fff",
    boxShadow: "0 6px 16px rgba(30, 20, 90, 0.18)",
  },
  buscadorTexto: { flex: 1, fontSize: 15, color: C.tinta, paddingVertical: 0 },

  filtros: {
    flexDirection: "row",
    gap: 4,
    padding: 5,
    marginTop: -26,
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.borde,
    backgroundColor: "#fff",
    ...sombraTarjeta,
  },
  filtro: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 13,
  },
  filtroActivo: { backgroundColor: C.prismaDark, boxShadow: "0 4px 10px rgba(70, 54, 168, 0.3)" },
  filtroTexto: { fontSize: 14, fontWeight: "600", color: C.niebla },
  filtroGlobo: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    backgroundColor: "#F03E4E",
    alignItems: "center",
    justifyContent: "center",
  },

  vacio: {
    alignItems: "center",
    marginHorizontal: 16,
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.borde,
    backgroundColor: "#fff",
  },
  vacioTitulo: { marginTop: 8, fontSize: 15, fontWeight: "700", color: C.tinta },
  vacioTexto: { marginTop: 2, fontSize: 13, color: C.niebla, textAlign: "center" },

  fila: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    paddingLeft: 18,
    backgroundColor: "#fff",
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: C.borde,
  },
  filaPrimera: { borderTopWidth: 1, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  filaUltima: { borderBottomWidth: 1, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  avatarLetra: { color: "#fff", fontWeight: "700", fontSize: 20 },

  // epacios porque estaba muy junto 
  centro: { flex: 1, paddingVertical: 16, paddingRight: 18 },
  centroDivisor: { borderBottomWidth: 1, borderBottomColor: "#ECEAF4" },
  filaArriba: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  nombre: { flex: 1, fontSize: 16, fontWeight: "700", color: C.tinta, marginRight: 8 },
  hora: { fontSize: 12, color: C.niebla },
  horaNueva: { color: C.prisma, fontWeight: "700" },

  rol: { alignSelf: "flex-start", borderRadius: 8, paddingHorizontal: 7, paddingVertical: 1, marginTop: 3 },
  rolTexto: { fontSize: 11, fontWeight: "700" },

  filaAbajo: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  ultimo: { flex: 1, fontSize: 14, color: C.niebla, marginRight: 8 },
  ultimoNuevo: { color: C.tinta, fontWeight: "600" },
  ultimoVacio: { fontStyle: "italic", color: C.niebla },
  globo: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    backgroundColor: C.prisma,
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 3px 8px rgba(87, 67, 194, 0.35)",
  },
  globoTexto: { color: "#fff", fontSize: 12, fontWeight: "700" },
});