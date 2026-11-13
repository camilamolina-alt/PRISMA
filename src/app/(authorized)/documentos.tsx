import DocumentoFila from "@/components/DocumentoFila";
import { Documento, leerDocumentos } from "@/lib/documentos";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const sombraTarjeta = { boxShadow: "0 4px 12px rgba(10, 85, 104, 0.08)" };

export default function Documentos() {
  const insets = useSafeAreaInsets();
  const [recientes, setRecientes] = useState<Documento[]>([]);

  // recarga cada vez que se vuelve a esta pantalla (ej. después de subir una planilla)
  useFocusEffect(
    useCallback(() => {
      leerDocumentos().then(setRecientes);
    }, [])
  );

  const acciones = [
    {
      titulo: "Subir Excel",
      texto: "Actualiza productos, stock y precios",
      ruta: "/planillas",
      colores: ["#4ADE80", "#16A34A"] as const,
      sombra: "22, 163, 74",
      icono: <Feather name="upload-cloud" size={26} color="white" />,
    },
    {
      titulo: "Ver documentos",
      texto: "Historial de planillas subidas",
      ruta: "/listaDocumentos",
      colores: ["#14C2C0", "#0A7A8C"] as const,
      sombra: "10, 122, 140",
      icono: <MaterialCommunityIcons name="folder-open-outline" size={28} color="white" />,
    },
  ];

  return (
    <ScrollView className="flex-1 bg-[#EEF6F7]" contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
      <StatusBar style="light" />

      {/* Header */}
      <LinearGradient
        colors={["#0A5568", "#0B7C8E", "#0EA5B0", "#3BCBC3"]}
        locations={[0, 0.42, 0.78, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingHorizontal: 20,
          paddingTop: insets.top + 16,
          paddingBottom: 48,
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
        }}
      >
        <View className="flex-row items-center">
          <Pressable
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
            accessibilityRole="button"
            accessibilityLabel="Volver"
            className="h-11 w-11 items-center justify-center rounded-full border border-[#FFFFFF40] bg-[#FFFFFF26]"
          >
            <Feather name="chevron-left" size={24} color="white" />
          </Pressable>
          <View className="ml-4 flex-1">
            <Text className="text-2xl font-bold text-white">Documentos</Text>
            <Text className="text-sm text-[#D4F5F4]">Planillas y archivos de tus tiendas</Text>
          </View>
        </View>
      </LinearGradient>

      <View className="-mt-6 gap-4 px-5">
        {/* Dos acciones principales */}
        <View className="flex-row gap-3">
          {acciones.map((a) => (
            <Pressable
              key={a.titulo}
              onPress={() => router.push(a.ruta as any)}
              accessibilityRole="button"
              accessibilityLabel={`${a.titulo}. ${a.texto}`}
              className="flex-1 gap-3 rounded-3xl border border-[#DCEBEE] bg-white p-4"
              style={({ pressed }) => [sombraTarjeta, { opacity: pressed ? 0.85 : 1 }]}
            >
              <LinearGradient
                colors={a.colores}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 4px 10px rgba(${a.sombra}, 0.3)`,
                }}
              >
                {a.icono}
              </LinearGradient>
              <View className="gap-0.5">
                <Text className="text-base font-bold text-[#10262E]">{a.titulo}</Text>
                <Text className="text-sm leading-5 text-[#3B5760]">{a.texto}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Recientes */}
        <View className="mt-1 flex-row items-center justify-between">
          <Text className="text-base font-bold text-[#10262E]">Recientes</Text>
          {recientes.length > 3 && (
            <Pressable accessibilityRole="link" hitSlop={10} onPress={() => router.push("/listaDocumentos" as any)}>
              <Text className="text-sm font-bold text-[#0A6D7D]">Ver todos</Text>
            </Pressable>
          )}
        </View>

        {recientes.length === 0 ? (
          <View className="items-center gap-2 rounded-2xl border border-dashed border-[#B9CFD4] bg-[#F6FBFB] px-4 py-8">
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-[#E2ECEE]">
              <Feather name="file-text" size={22} color="#6E8C94" />
            </View>
            <Text className="text-[15px] font-bold text-[#3B5760]">Aún no hay documentos</Text>
            <Text className="text-center text-sm text-[#6E8C94]">
              Las planillas que subas aparecerán aquí
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {recientes.slice(0, 3).map((doc) => (
              <DocumentoFila key={doc.id} doc={doc} />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
