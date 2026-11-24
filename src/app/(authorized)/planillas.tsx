import { API_URL } from "@/config/api";
import { useAuthSession } from "@/providers/AuthProvider";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ReactNode, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const sombraTarjeta = { boxShadow: "0 4px 12px rgba(10, 85, 104, 0.08)" };

export default function Planillas() {
  const insets = useSafeAreaInsets();

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
            <Text className="text-sm text-[#D4F5F4]">Sube las planillas para actualizar los datos</Text>
          </View>
        </View>
      </LinearGradient>

      <View className="-mt-6 gap-4 px-5">
        <TarjetaPlanilla
          titulo="Planilla de tiendas"
          texto="Productos, stock enviado y precios por tienda"
          endpoint="/api/importaciones"
          colores={["#4ADE80", "#16A34A"]}
          sombra="22, 163, 74"
          icono={<MaterialCommunityIcons name="file-excel-outline" size={26} color="white" />}
        />
        <TarjetaPlanilla
          titulo="Planilla de envíos"
          texto="Camiones a cada tienda y su fecha aprox. de llegada"
          endpoint="/api/importaciones/envios"
          colores={["#38BDF8", "#0284C7"]}
          sombra="2, 132, 199"
          icono={<MaterialCommunityIcons name="truck-delivery-outline" size={26} color="white" />}
          columnas="CADENA · UBICACIÓN · SECTOR · PLU · DESCRIPCIÓN · CANTIDAD · FECHA ENVÍO · LLEGADA APROX"
        />
        <TarjetaPlanilla
          titulo="Planilla de promociones"
          texto="Precios, promos y eventos por cadena. Crea las tareas de los promotores"
          endpoint="/api/importaciones/promociones"
          colores={["#F472B6", "#DB2777"]}
          sombra="219, 39, 119"
          icono={<MaterialCommunityIcons name="tag-outline" size={26} color="white" />}
          columnas="TIPO · CADENA · SKU · DESCRIPCIÓN · PRECIO NORMAL · PRECIO OFERTA · DESDE · HASTA"
        />
      </View>
    </ScrollView>
  );
}

function TarjetaPlanilla({
  titulo,
  texto,
  endpoint,
  colores,
  sombra,
  icono,
  columnas,
}: {
  titulo: string;
  texto: string;
  endpoint: string;
  colores: [string, string];
  sombra: string;
  icono: ReactNode;
  columnas?: string;
}) {
  const { token } = useAuthSession();
  const [archivo, setArchivo] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [resultado, setResultado] = useState<{ ok: boolean; mensaje: string } | null>(null);

  const elegirArchivo = async () => {
    const escogido = await DocumentPicker.getDocumentAsync({
      type: [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
      ],
    });
    if (escogido.canceled) return;

    setArchivo(escogido.assets[0]);
    setResultado(null);
  };

  const subir = async () => {
    if (!archivo || !token) return;
    setSubiendo(true);
    setResultado(null);

    const formulario = new FormData();
    if (archivo.file) {
      formulario.append("archivo", archivo.file);
    } else {
      formulario.append("archivo", {
        uri: archivo.uri,
        name: archivo.name,
        type: archivo.mimeType ?? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      } as any);
    }
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { Authorization: token },
        body: formulario,
      });
      const mensaje = await res.text();
      setResultado({ ok: res.ok, mensaje });
      if (res.ok) setArchivo(null);
    } catch {
      setResultado({ ok: false, mensaje: "No hay conexión con el servidor" });
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <View className="gap-4 rounded-3xl border border-[#DCEBEE] bg-white p-5" style={sombraTarjeta}>
      <View className="flex-row items-center gap-3">
        <LinearGradient
          colors={colores}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center", boxShadow: `0 4px 10px rgba(${sombra}, 0.3)` }}
        >
          {icono}
        </LinearGradient>
        <View className="flex-1">
          <Text className="text-lg font-bold text-[#10262E]">{titulo}</Text>
          <Text className="text-sm text-[#3B5760]">{texto}</Text>
        </View>
      </View>

      {columnas && (
        <View className="rounded-xl bg-[#F6FBFB] px-3 py-2">
          <Text className="text-xs font-bold text-[#6E8C94]">COLUMNAS DEL EXCEL</Text>
          <Text className="mt-0.5 text-[13px] leading-5 text-[#3B5760]">{columnas}</Text>
        </View>
      )}

      {/* Zona para elegir archivo */}
      <Pressable
        onPress={elegirArchivo}
        disabled={subiendo}
        accessibilityRole="button"
        accessibilityLabel={archivo ? `Archivo elegido ${archivo.name}. Toca para cambiarlo` : `Elegir archivo Excel para ${titulo}`}
        className={`items-center gap-2 rounded-2xl border-2 border-dashed px-4 py-6 ${archivo ? "border-[#16A34A] bg-[#F0FBF4]" : "border-[#A9DCDD] bg-[#F6FBFB]"
          }`}
      >
        {archivo ? (
          <>
            <MaterialCommunityIcons name="file-check-outline" size={32} color="#16A34A" />
            <Text className="text-center text-[15px] font-bold text-[#10262E]" numberOfLines={1}>
              {archivo.name}
            </Text>
            <Text className="text-sm text-[#3B5760]">Toca para cambiar el archivo</Text>
          </>
        ) : (
          <>
            <Feather name="upload-cloud" size={32} color="#0A6D7D" />
            <Text className="text-[15px] font-bold text-[#0A5568]">Elegir archivo Excel</Text>
            <Text className="text-sm text-[#3B5760]">.xlsx o .xls</Text>
          </>
        )}
      </Pressable>

      {/* Resultado de la subida */}
      {resultado && (
        <View
          className={`flex-row items-start gap-2 rounded-2xl px-4 py-3 ${resultado.ok ? "bg-[#DCF7E5]" : "bg-[#FDECEC]"}`}
          accessibilityLiveRegion="polite"
        >
          <Feather
            name={resultado.ok ? "check-circle" : "alert-circle"}
            size={18}
            color={resultado.ok ? "#11602F" : "#C4202F"}
            style={{ marginTop: 1 }}
          />
          <Text className={`flex-1 text-[15px] font-semibold ${resultado.ok ? "text-[#11602F]" : "text-[#C4202F]"}`}>
            {resultado.mensaje}
          </Text>
        </View>
      )}

      {/* Botón subir */}
      <Pressable
        onPress={subir}
        disabled={!archivo || subiendo}
        accessibilityRole="button"
        accessibilityState={{ disabled: !archivo || subiendo }}
        style={{ opacity: archivo && !subiendo ? 1 : 0.45 }}
      >
        <LinearGradient
          colors={["#0B7C8E", "#0EA5B0"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 16,
            paddingVertical: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            boxShadow: "0 4px 10px rgba(11, 124, 142, 0.3)",
          }}
        >
          {subiendo ? <ActivityIndicator color="white" /> : <Feather name="upload" size={18} color="white" />}
          <Text className="text-base font-bold text-white">{subiendo ? "Subiendo..." : "Subir planilla"}</Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
}
