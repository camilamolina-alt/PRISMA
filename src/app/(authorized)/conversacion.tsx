import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Mensaje, useChat } from "../../hooks/useChat";

// "2026-10-27T14:32:10" → "14:32"
const hora = (iso: string) =>
  new Date(iso).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });

// → "Hoy", "Ayer" o "25 de octubre"
function etiquetaDia(iso: string) {
  const d = new Date(iso).toDateString();
  const hoy = new Date();
  const ayer = new Date();
  ayer.setDate(hoy.getDate() - 1);
  if (d === hoy.toDateString()) return "Hoy";
  if (d === ayer.toDateString()) return "Ayer";
  return new Date(iso).toLocaleDateString("es-CL", { day: "numeric", month: "long" });
}

function Burbuja({ m, mio }: { m: Mensaje; mio: boolean }) {
  return (
    <View style={[s.fila, mio ? s.filaMia : s.filaOtro]}>
      <View style={[s.burbuja, mio ? s.burbujaMia : s.burbujaOtro]}>
        <Text style={s.texto}>{m.contenido}</Text>
        <View style={s.meta}>
          <Text style={s.hora}>{hora(m.fecha)}</Text>
          {mio && (
            <Ionicons
              name="checkmark-done"
              size={16}
              color={m.leido ? "#53BDEB" : "#8696A0"}
            />
          )}
        </View>
      </View>
    </View>
  );
}

export default function Conversacion() {
  const { correo, nombre } = useLocalSearchParams<{ correo: string; nombre?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { mensajes, enviarMensaje, conectado } = useChat(correo);
  const [texto, setTexto] = useState("");

  // FlatList "inverted" dibuja de abajo hacia arriba, así que el más nuevo va primero
  const invertidos = useMemo(() => [...mensajes].reverse(), [mensajes]);

  const puedeEnviar = conectado && texto.trim().length > 0;

  const enviar = () => {
    if (!puedeEnviar) return;
    enviarMensaje(texto);
    setTexto("");
  };

  return (
    <View style={s.pantalla}>
      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <View style={s.avatar}>
          <Text style={s.avatarLetra}>{(nombre ?? correo)?.[0]?.toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.headerNombre} numberOfLines={1}>{nombre ?? correo}</Text>
          <Text style={s.headerEstado}>{conectado ? "conectado" : "conectando..."}</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Mensajes */}
        <FlatList
          data={invertidos}
          inverted
          keyExtractor={(m) => String(m.idMensaje)}
          contentContainerStyle={{ paddingVertical: 8 }}
          renderItem={({ item, index }) => {
            // En la lista invertida, el mensaje ANTERIOR (más viejo) está en index + 1
            const anterior = invertidos[index + 1];
            const cambiaDia =
              !anterior ||
              new Date(anterior.fecha).toDateString() !== new Date(item.fecha).toDateString();

            return (
              <View>
                {cambiaDia && (
                  <View style={s.dia}>
                    <Text style={s.diaTexto}>{etiquetaDia(item.fecha)}</Text>
                  </View>
                )}
                <Burbuja m={item} mio={item.remitente !== correo} />
              </View>
            );
          }}
        />

        {/* Barra de escribir */}
        <View style={[s.barra, { paddingBottom: insets.bottom + 6 }]}>
          <View style={s.inputCaja}>
            <TextInput
              value={texto}
              onChangeText={setTexto}
              placeholder="Mensaje"
              placeholderTextColor="#8696A0"
              multiline
              style={s.input}
            />
          </View>
          <Pressable
            onPress={enviar}
            disabled={!puedeEnviar}
            style={[s.btnEnviar, !puedeEnviar && { opacity: 0.5 }]}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: "#EFEAE2" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#0A3773",
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#D1E4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetra: { color: "#0A3773", fontWeight: "700", fontSize: 16 },
  headerNombre: { color: "#fff", fontSize: 16, fontWeight: "600" },
  headerEstado: { color: "#C9D6E8", fontSize: 12 },

  fila: { paddingHorizontal: 10, marginVertical: 2, flexDirection: "row" },
  filaMia: { justifyContent: "flex-end" },
  filaOtro: { justifyContent: "flex-start" },
  burbuja: {
    maxWidth: "80%",
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 4,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 1,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  burbujaMia: { backgroundColor: "#D9FDD3", borderTopRightRadius: 2 },
  burbujaOtro: { backgroundColor: "#FFFFFF", borderTopLeftRadius: 2 },
  texto: { fontSize: 15, color: "#111B21", lineHeight: 20 },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 3,
    marginTop: 2,
  },
  hora: { fontSize: 11, color: "#667781" },

  dia: {
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginVertical: 8,
  },
  diaTexto: { fontSize: 12, color: "#54656F" },

  barra: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
    paddingHorizontal: 8,
    paddingTop: 6,
  },
  inputCaja: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 24,
    paddingHorizontal: 14,
    minHeight: 46,
    justifyContent: "center",
  },
  input: { fontSize: 16, color: "#111B21", maxHeight: 120, paddingVertical: 10 },
  btnEnviar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#0A3773",
    alignItems: "center",
    justifyContent: "center",
  },
});