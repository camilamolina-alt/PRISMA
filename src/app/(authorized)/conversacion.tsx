//colores
import { colorMensajes as C, gradienteMio, iris } from "../../theme/colores";

import {StatusBar} from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
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
  // Lo de adentro es igual para las dos; solo cambia el "envase"
  const contenido = (
    <>
      <Text style={[s.texto, mio && s.textoMio]}>{m.contenido}</Text>
      <View style={s.meta}>
        <Text style={[s.hora, mio && s.horaMia]}>{hora(m.fecha)}</Text>
        {mio && (
          <Ionicons
            name="checkmark-done"
            size={16}
            color={m.leido ? C.leido : "rgba(255,255,255,0.6)"}
          />
        )}
      </View>
    </>
  );

  return (
    <View style={[s.fila, mio ? s.filaMia : s.filaOtro]}>
      {mio ? (
        <LinearGradient
          colors={gradienteMio}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[s.burbuja, s.burbujaMia]}
        >
          {contenido}
        </LinearGradient>
      ) : (
        <View style={[s.burbuja, s.burbujaOtro]}>{contenido}</View>
      )}
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

  //Arriba 
  return (
    <View style={s.pantalla}>
      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + 8 }]}>
        <StatusBar style ="dark" />
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={C.tinta} />
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
        behavior= "padding">
          {/* Fondo nácar como el login. pointerEvents="none" para que no bloquee toques */}
          {/* overflow hidden: sin esto los círculos se salen hacia arriba y tiñen el header */}
          <View pointerEvents="none" style={[StyleSheet.absoluteFill, { overflow: "hidden" }]}>
            <View style={[s.circulo, { top: -60, left: -90, backgroundColor: iris[1] }]} />
            <View style={[s.circulo, { top: 240, right: -120, backgroundColor: iris[0] }]} />
            <View style={[s.circulo, { bottom: 60, left: -100, backgroundColor: iris[6] }]} />
          </View>
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
              placeholderTextColor={C.niebla}
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
  pantalla: { flex: 1, backgroundColor: C.fondo },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.borde,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.lila,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetra: { color: C.prismaDark, fontWeight: "700", fontSize: 16 },
  headerNombre: { color: C.tinta, fontSize: 16, fontWeight: "600" },
  headerEstado: { color: C.niebla, fontSize: 12 },

  circulo: { position: "absolute", width: 280, height: 280, borderRadius: 140, opacity: 0.45 },

  fila: { paddingHorizontal: 10, marginVertical: 2, flexDirection: "row" },
  filaMia: { justifyContent: "flex-end" },
  filaOtro: { justifyContent: "flex-start" },
  burbuja: {
    maxWidth: "80%",
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
    borderRadius: 18,
  },
  // Sin backgroundColor: el color lo pone el degradado
  burbujaMia: { borderTopRightRadius: 6 },
  burbujaOtro: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(87,67,194,0.10)",
  },
  texto: { fontSize: 15, color: C.tinta, lineHeight: 20 },
  textoMio: { color: "#FFFFFF" },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 3,
    marginTop: 2,
  },
  hora: { fontSize: 11, color: C.niebla },
  horaMia: { color: "rgba(255,255,255,0.75)" },

  dia: {
    alignSelf: "center",
    backgroundColor: C.lila,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    marginVertical: 10,
  },
  diaTexto: { fontSize: 12, color: C.prismaDark, fontWeight: "500" },

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
    borderWidth: 1,
    borderColor: C.borde,
    paddingHorizontal: 16,
    minHeight: 46,
    justifyContent: "center",
  },
  input: { fontSize: 16, color: C.tinta, maxHeight: 120, paddingVertical: 10 },
  btnEnviar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: C.prisma,
    alignItems: "center",
    justifyContent: "center",
  },
});