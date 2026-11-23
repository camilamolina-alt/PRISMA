import DocumentoFila from "@/components/DocumentoFila";
import { Documento, leerDocumentos } from "@/lib/documentos";
import { useAuthSession } from "@/providers/AuthProvider";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Filtro = "todos" | "ok" | "error";

const filtros: { valor: Filtro; texto: string }[] = [
  { valor: "todos", texto: "Todos" },
  { valor: "ok", texto: "Importados" },
  { valor: "error", texto: "Con error" },
];

export default function ListaDocumentos() {
  const insets = useSafeAreaInsets();
  const { token } = useAuthSession();
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  const cargar = useCallback(() => {
    if (!token) return;
    leerDocumentos(token)
      .then((lista) => {
        setDocumentos(lista);
        setError(false);
      })
      .catch(() => setError(true))
      .finally(() => setCargando(false));
  }, [token]);

  useFocusEffect(cargar);

  const visibles = documentos.filter((d) => filtro === "todos" || (filtro === "ok" ? d.oki : !d.oki));

  return (
    <View className="flex-1 bg-[#EEF6F7]">
      <StatusBar style="light" />

      <LinearGradient
        colors={["#0A5568", "#0B7C8E", "#0EA5B0", "#3BCBC3"]}
        locations={[0, 0.42, 0.78, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingHorizontal: 20,
          paddingTop: insets.top + 16,
          paddingBottom: 24,
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
        }}
      >
        <View className="flex-row items-center">
          <Pressable
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/documentos" as any))}
            accessibilityRole="button"
            accessibilityLabel="Volver"
            className="h-11 w-11 items-center justify-center rounded-full border border-[#FFFFFF40] bg-[#FFFFFF26]"
          >
            <Feather name="chevron-left" size={24} color="white" />
          </Pressable>
          <View className="ml-4 flex-1">
            <Text className="text-2xl font-bold text-white">Mis documentos</Text>
            <Text className="text-sm text-[#D4F5F4]">
              {documentos.length} {documentos.length === 1 ? "planilla subida" : "planillas subidas"}
            </Text>
          </View>
        </View>

        {/* Filtros */}
        <View className="mt-4 flex-row gap-2">
          {filtros.map((f) => {
            const activo = filtro === f.valor;
            return (
              <Pressable
                key={f.valor}
                onPress={() => setFiltro(f.valor)}
                accessibilityRole="button"
                accessibilityState={{ selected: activo }}
                className={`rounded-full border px-4 py-2 ${activo ? "border-white bg-white" : "border-[#FFFFFF40] bg-[#FFFFFF26]"}`}
              >
                <Text className={`text-sm font-bold ${activo ? "text-[#0A5568]" : "text-white"}`}>{f.texto}</Text>
              </Pressable>
            );
          })}
        </View>
      </LinearGradient>

      <FlatList
        data={visibles}
        keyExtractor={(d) => String(d.idImportar)}
        renderItem={({ item }) => <DocumentoFila doc={item} />}
        contentContainerStyle={{ padding: 20, gap: 12, paddingBottom: insets.bottom + 24 }}
        ListEmptyComponent={
          cargando ? (
            <ActivityIndicator color="#0A6D7D" style={{ marginTop: 48 }} />
          ) : (
            <View className="items-center gap-2 py-12">
              <Feather name={error ? "wifi-off" : "inbox"} size={32} color="#6E8C94" />
              <Text className="text-[15px] font-bold text-[#3B5760]">
                {error ? "No hay conexión con el servidor" : "No hay documentos aquí"}
              </Text>
              {error && (
                <Pressable accessibilityRole="button" hitSlop={10} onPress={cargar}>
                  <Text className="text-sm font-bold text-[#0A6D7D]">Reintentar</Text>
                </Pressable>
              )}
            </View>
          )
        }
      />
    </View>
  );
}
