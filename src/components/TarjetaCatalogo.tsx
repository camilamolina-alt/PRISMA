import { API_URL } from "@/config/api";
import { useAuthSession } from "@/providers/AuthProvider";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

const sombraTarjeta = { boxShadow: "0 4px 12px rgba(10, 85, 104, 0.08)" };

type ResultadoCatalogo = { asociadas: number; sinProducto: string[]; invalidas: string[] };

export default function TarjetaCatalogo() {
  const { token } = useAuthSession();
  const [fotos, setFotos] = useState<DocumentPicker.DocumentPickerAsset[]>([]);
  const [subiendo, setSubiendo] = useState(false);
  const [resultado, setResultado] = useState<ResultadoCatalogo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const elegirFotos = async () => {
    const escogido = await DocumentPicker.getDocumentAsync({
      type: ["image/jpeg", "image/png", "image/webp"],
      multiple: true,
    });
    if (escogido.canceled) return;
    setFotos(escogido.assets);
    setResultado(null);
    setError(null);
  };

  const subir = async () => {
    if (fotos.length === 0 || !token) return;
    setSubiendo(true);
    setResultado(null);
    setError(null);

    const formulario = new FormData();
    for (const foto of fotos) {
      if (foto.file) {
        formulario.append("imagenes", foto.file);
      } else {
        formulario.append("imagenes", {
          uri: foto.uri,
          name: foto.name,
          type: foto.mimeType ?? "image/jpeg",
        } as any);
      }
    }

    try {
      const res = await fetch(`${API_URL}/api/productos/catalogo`, {
        method: "POST",
        headers: { Authorization: token },
        body: formulario,
      });
      if (!res.ok) {
        setError((await res.text()) || "No se pudieron subir las fotos");
        return;
      }
      setResultado(await res.json());
      setFotos([]);
    } catch {
      setError("No hay conexión con el servidor");
    } finally {
      setSubiendo(false);
    }
  };

  const noAsociadas = resultado ? [...resultado.sinProducto, ...resultado.invalidas] : [];

  return (
    <View className="gap-4 rounded-3xl border border-[#DCEBEE] bg-white p-5" style={sombraTarjeta}>
      <View className="flex-row items-center gap-3">
        <LinearGradient
          colors={["#A78BFA", "#7C3AED"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center", boxShadow: "0 4px 10px rgba(124, 58, 237, 0.3)" }}
        >
          <MaterialCommunityIcons name="image-multiple-outline" size={26} color="white" />
        </LinearGradient>
        <View className="flex-1">
          <Text className="text-lg font-bold text-[#10262E]">Catálogo de fotos</Text>
          <Text className="text-sm text-[#3B5760]">Fotos de productos. Se asocian solas por el SKU</Text>
        </View>
      </View>

      <View className="rounded-xl bg-[#F6FBFB] px-3 py-2">
        <Text className="text-xs font-bold text-[#6E8C94]">CÓMO NOMBRAR LAS FOTOS</Text>
        <Text className="mt-0.5 text-[13px] leading-5 text-[#3B5760]">
          Cada foto con el SKU del producto: 12345.jpg, 55120.png… (JPG, PNG o WEBP)
        </Text>
      </View>

      <Pressable
        onPress={elegirFotos}
        disabled={subiendo}
        accessibilityRole="button"
        accessibilityLabel={fotos.length ? `${fotos.length} fotos elegidas. Toca para cambiarlas` : "Elegir fotos del catálogo"}
        className={`items-center gap-2 rounded-2xl border-2 border-dashed px-4 py-6 ${fotos.length ? "border-[#7C3AED] bg-[#F5F3FF]" : "border-[#A9DCDD] bg-[#F6FBFB]"}`}
      >
        {fotos.length ? (
          <>
            <MaterialCommunityIcons name="image-check-outline" size={32} color="#7C3AED" />
            <Text className="text-[15px] font-bold text-[#10262E]">
              {fotos.length} {fotos.length === 1 ? "foto elegida" : "fotos elegidas"}
            </Text>
            <Text className="text-center text-sm text-[#3B5760]" numberOfLines={2}>
              {fotos.slice(0, 4).map((f) => f.name).join(", ")}
              {fotos.length > 4 ? "…" : ""}
            </Text>
          </>
        ) : (
          <>
            <Feather name="image" size={32} color="#0A6D7D" />
            <Text className="text-[15px] font-bold text-[#0A5568]">Elegir fotos</Text>
            <Text className="text-sm text-[#3B5760]">Puedes elegir varias a la vez</Text>
          </>
        )}
      </Pressable>

      {error && (
        <View className="flex-row items-start gap-2 rounded-2xl bg-[#FDECEC] px-4 py-3" accessibilityLiveRegion="polite">
          <Feather name="alert-circle" size={18} color="#C4202F" style={{ marginTop: 1 }} />
          <Text className="flex-1 text-[15px] font-semibold text-[#C4202F]">{error}</Text>
        </View>
      )}

      {resultado && (
        <View className="gap-2" accessibilityLiveRegion="polite">
          <View className="flex-row items-start gap-2 rounded-2xl bg-[#DCF7E5] px-4 py-3">
            <Feather name="check-circle" size={18} color="#11602F" style={{ marginTop: 1 }} />
            <Text className="flex-1 text-[15px] font-semibold text-[#11602F]">
              {resultado.asociadas} {resultado.asociadas === 1 ? "foto asociada" : "fotos asociadas"} a sus productos
            </Text>
          </View>
          {noAsociadas.length > 0 && (
            <View className="flex-row items-start gap-2 rounded-2xl bg-[#FFF4E0] px-4 py-3">
              <Feather name="alert-triangle" size={18} color="#9A5300" style={{ marginTop: 1 }} />
              <Text className="flex-1 text-sm text-[#7A4300]">
                Sin producto con ese SKU o formato no válido: {noAsociadas.join(", ")}
              </Text>
            </View>
          )}
        </View>
      )}

      <Pressable
        onPress={subir}
        disabled={fotos.length === 0 || subiendo}
        accessibilityRole="button"
        accessibilityState={{ disabled: fotos.length === 0 || subiendo }}
        style={{ opacity: fotos.length > 0 && !subiendo ? 1 : 0.45 }}
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
          <Text className="text-base font-bold text-white">{subiendo ? "Subiendo..." : "Subir fotos"}</Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
}
