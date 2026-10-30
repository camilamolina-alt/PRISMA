import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { API_URL } from "../../config/api";
import { useAuthSession } from "../../providers/AuthProvider";
import { colorMensajes as C } from "../../theme/colores";

// Igual que tu ContactosDTO de Java
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

export default function Chats() {
  const { token } = useAuthSession();
  const router = useRouter();
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [cargando, setCargando] = useState(false);

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

  return (
    <FlatList
      style={s.pantalla}
      data={contactos}
      keyExtractor={(c) => c.correo}
      refreshControl={<RefreshControl refreshing={cargando} onRefresh={cargar} />}
      ListEmptyComponent={
        !cargando ? <Text style={s.vacio}>No hay contactos todavía</Text> : undefined
      }
      renderItem={({ item: c }) => (
        <Pressable
          style={({ pressed }) => [s.fila, pressed && { backgroundColor: C.fondo }]}
          onPress={() =>
            router.push({
              pathname: "/conversacion",
              params: { correo: c.correo, nombre: c.nombre },
            })
          }
        >
          <View style={s.avatar}>
            <Text style={s.avatarLetra}>{c.nombre?.[0]?.toUpperCase() ?? "?"}</Text>
          </View>

          <View style={s.centro}>
            <View style={s.filaArriba}>
              <Text style={s.nombre} numberOfLines={1}>{c.nombre}</Text>
              <Text style={[s.hora, c.noleido > 0 && s.horaNueva]}>{horaLista(c.fecha)}</Text>
            </View>

            <View style={s.filaAbajo}>
              <Text
                style={[s.ultimo, !c.ultimo && s.ultimoVacio]}
                numberOfLines={1}
              >
                {c.ultimo ?? `${c.rol} · toca para chatear`}
              </Text>
              {c.noleido > 0 && (
                <View style={s.globo}>
                  <Text style={s.globoTexto}>{c.noleido}</Text>
                </View>
              )}
            </View>
          </View>
        </Pressable>
      )}
    />
  );
}

const s = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: "#fff" },
  vacio: { textAlign: "center", color: C.niebla, marginTop: 40 },

  fila: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10 },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: C.lila,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  avatarLetra: { color: C.prismaDark, fontWeight: "700", fontSize: 20 },

  centro: {
    flex: 1,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.borde,
    paddingBottom: 10,
  },
  filaArriba: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  nombre: { flex: 1, fontSize: 16, fontWeight: "600", color: C.tinta, marginRight: 8 },
  hora: { fontSize: 12, color: C.niebla },
  horaNueva: { color: C.prisma, fontWeight: "600" },

  filaAbajo: { flexDirection: "row", alignItems: "center", marginTop: 3 },
  ultimo: { flex: 1, fontSize: 14, color: C.niebla, marginRight: 8 },
  ultimoVacio: { fontStyle: "italic", color: C.niebla },
  globo: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    backgroundColor: C.prisma,
    alignItems: "center",
    justifyContent: "center",
  },
  globoTexto: { color: "#fff", fontSize: 12, fontWeight: "700" },
});