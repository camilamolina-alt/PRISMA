import { abrirDocumento, Documento, fechaCorta, nombreTipo } from "@/lib/documentos";
import { useAuthSession } from "@/providers/AuthProvider";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";

//Doc y lista
export default function DocumentoFila({ doc }: { doc: Documento }) {
  const { token } = useAuthSession();
  const [abriendo, setAbriendo] = useState(false);
  const tipo = nombreTipo[doc.tipo] ?? doc.tipo;

  // toca la fila -> baja el Excel original y lo abre con Excel/Sheets
  const abrir = async () => {
    if (!token || abriendo) return;
    setAbriendo(true);
    try {
      await abrirDocumento(doc, token);
    } catch {
      Alert.alert("No se pudo abrir", "Revisa tu conexión e inténtalo de nuevo.");
    } finally {
      setAbriendo(false);
    }
  };

  return (
    <Pressable
      onPress={abrir}
      disabled={abriendo}
      className="flex-row items-center gap-3 rounded-2xl border border-[#DCEBEE] bg-white p-4"
      style={({ pressed }) => ({ boxShadow: "0 2px 8px rgba(10, 85, 104, 0.06)", opacity: pressed ? 0.8 : 1 })}
      accessibilityRole="button"
      accessibilityHint="Abre la planilla en otra aplicación"
      accessibilityLabel={`${doc.nombreArchivo}, ${tipo}, ${fechaCorta(doc.fecha)}, ${doc.oki ? "importado" : "con error"}`}
    >
      <View className="h-11 w-11 items-center justify-center rounded-xl bg-[#E5F7EC]">
        {abriendo ? (
          <ActivityIndicator color="#16A34A" />
        ) : (
          <MaterialCommunityIcons name="file-excel-outline" size={24} color="#16A34A" />
        )}
      </View>

      <View className="flex-1">
        <Text className="text-[15px] font-bold text-[#10262E]" numberOfLines={1}>
          {doc.nombreArchivo}
        </Text>
        <Text className="text-sm text-[#3B5760]" numberOfLines={1}>
          {abriendo ? "Abriendo..." : `${tipo} · ${fechaCorta(doc.fecha)}`}
        </Text>
      </View>

      <View
        className={`flex-row items-center gap-1 rounded-full px-2.5 py-1 ${doc.oki ? "bg-[#DCF7E5]" : "bg-[#FDECEC]"}`}
      >
        <Feather name={doc.oki ? "check" : "x"} size={12} color={doc.oki ? "#11602F" : "#C4202F"} />
        <Text className={`text-xs font-bold ${doc.oki ? "text-[#11602F]" : "text-[#C4202F]"}`}>
          {doc.oki ? "Importado" : "Error"}
        </Text>
      </View>
    </Pressable>
  );
}
