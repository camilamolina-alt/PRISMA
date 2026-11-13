import { Documento, fechaCorta, nombreTipo } from "@/lib/documentos";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";

//Doc y lista
export default function DocumentoFila({ doc }: { doc: Documento }) {
  return (
    <View
      className="flex-row items-center gap-3 rounded-2xl border border-[#DCEBEE] bg-white p-4"
      style={{ boxShadow: "0 2px 8px rgba(10, 85, 104, 0.06)" }}
      accessible
      accessibilityLabel={`${doc.nombre}, ${nombreTipo[doc.tipo]}, ${fechaCorta(doc.fecha)}, ${doc.ok ? "importado" : "con error"}`}
    >
      <View className="h-11 w-11 items-center justify-center rounded-xl bg-[#E5F7EC]">
        <MaterialCommunityIcons name="file-excel-outline" size={24} color="#16A34A" />
      </View>

      <View className="flex-1">
        <Text className="text-[15px] font-bold text-[#10262E]" numberOfLines={1}>
          {doc.nombre}
        </Text>
        <Text className="text-sm text-[#3B5760]" numberOfLines={1}>
          {nombreTipo[doc.tipo]} · {fechaCorta(doc.fecha)}
        </Text>
      </View>

      <View
        className={`flex-row items-center gap-1 rounded-full px-2.5 py-1 ${doc.ok ? "bg-[#DCF7E5]" : "bg-[#FDECEC]"}`}
      >
        <Feather name={doc.ok ? "check" : "x"} size={12} color={doc.ok ? "#11602F" : "#C4202F"} />
        <Text className={`text-xs font-bold ${doc.ok ? "text-[#11602F]" : "text-[#C4202F]"}`}>
          {doc.ok ? "Importado" : "Error"}
        </Text>
      </View>
    </View>
  );
}
