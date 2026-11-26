import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Modal, Pressable, Text, View } from "react-native";
import { API_URL } from "../config/api";

export type ProductoEscaneado = {
  idProducto: number;
  sku: string;
  nombre: string;
  descripcion: string | null;
  tipo: string | null;
  imageUrl: string | null;
  precio: number | null;
};

interface Props {
  producto: ProductoEscaneado | null;
  onClose: () => void;
  onEscanearOtro: () => void;
  onVerProducto: (sku:string) => void;
}

export default function ProductoEscaneadoModal({ producto, onClose, onEscanearOtro, onVerProducto }: Props) {
  return (
    <Modal visible={producto !== null} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/50">
        <View className="rounded-t-3xl bg-white px-5 pb-10 pt-5">
          {producto && (
            <>
              {/* Foto o dibujito si no tiene */}
              {producto.imageUrl ? (
                <Image
                  source={{ uri: `${API_URL}${producto.imageUrl}` }}
                  style={{ width: "100%", height: 220, borderRadius: 16 }}
                  contentFit="cover"
                />
              ) : (
                <View className="h-[220px] w-full items-center justify-center rounded-2xl bg-[#F5F4FB]">
                  <Ionicons name="camera-outline" size={48} color="#B7B3CC" />
                  <Text className="mt-2 text-[#6B6787]">Sin imagen</Text>
                </View>
              )}

              {/* Datos */}
              <Text className="mt-4 text-xl font-extrabold text-[#1B1733]">{producto.nombre}</Text>
              <Text className="mt-1 text-sm text-[#6B6787]">SKU {producto.sku}</Text>

              {producto.precio !== null && (
                <Text className="mt-3 text-2xl font-extrabold text-[#5B3FE0]">
                  ${producto.precio.toLocaleString("es-CL")}
                </Text>
              )}

              {producto.tipo && (
                <View className="mt-3 self-start rounded-full bg-[#EEEAFE] px-3 py-1">
                  <Text className="text-xs font-semibold text-[#5B3FE0]">{producto.tipo}</Text>
                </View>
              )}

              {producto.descripcion && (
                <Text className="mt-3 text-[15px] text-gray-700">{producto.descripcion}</Text>
              )}

              {/* Botones */}
              <View className="mt-6 flex-row gap-3">
                <Pressable className="flex-1 items-center rounded-xl border border-[#E4E2EE] py-3" onPress={() => onVerProducto(producto.sku)}>
                  <Text className="font-bold text-gray-700">Ver producto</Text>
                </Pressable>
                <Pressable className="flex-1 items-center rounded-xl bg-[#0284C7] py-3" onPress={onEscanearOtro}>
                  <Text className="font-bold text-white">Escanear otro</Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}
