import { API_URL } from "@/config/api";
import { useAuthSession } from "@/providers/AuthProvider";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { ActivityIndicator, Image, Modal, Platform, Pressable, Text, View } from "react-native";
import { ImagePickerButton } from "./ImagePickerButton";

export type TareaParaCompletar = { id: number; titulo: string; tienda: string };

export default function EvidenciaTareaModal({
  tarea,
  onClose,
  onCompletada,
}: {
  tarea: TareaParaCompletar | null;
  onClose: () => void;
  onCompletada: (id: number) => void;
}) {
  const { token } = useAuthSession();
  const [foto, setFoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cerrar = () => {
    if (enviando) return;
    setFoto(null);
    setError(null);
    onClose();
  };

  const completar = async () => {
    if (!tarea || !foto || !token) return;
    setEnviando(true);
    setError(null);

    const formulario = new FormData();
    if (Platform.OS === "web" && foto.file) {
      formulario.append("foto", foto.file);
    } else {
      formulario.append("foto", {
        uri: foto.uri,
        name: foto.fileName ?? `tarea-${tarea.id}.jpg`,
        type: foto.mimeType ?? "image/jpeg",
      } as any);
    }

    try {
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${API_URL}/api/tareas/${tarea.id}/completar`);
        xhr.setRequestHeader("Authorization", token);
        xhr.onload = () =>
          xhr.status >= 200 && xhr.status < 300 ? resolve(xhr.response) : reject(new Error(xhr.responseText || `Error ${xhr.status}`));
        xhr.onerror = () => reject(new Error("No se pudo conectar con el servidor"));
        xhr.send(formulario);
      });
      const id = tarea.id;
      setFoto(null);
      onCompletada(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo completar la tarea");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Modal visible={!!tarea} transparent animationType="slide" onRequestClose={cerrar}>
      <View className="flex-1 justify-end bg-[#00000080]">
        <View className="gap-4 rounded-t-[28px] bg-white px-5 pb-8 pt-5">
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <Text className="text-xs font-bold text-[#5743C2]">COMPLETAR TAREA</Text>
              <Text className="mt-0.5 text-lg font-bold text-[#1B1733]">{tarea?.titulo}</Text>
              <Text className="text-sm text-[#6B6787]">{tarea?.tienda}</Text>
            </View>
            <Pressable onPress={cerrar} accessibilityRole="button" accessibilityLabel="Cerrar" hitSlop={10}>
              <Feather name="x" size={24} color="#6B6787" />
            </Pressable>
          </View>

          <Text className="text-[15px] text-[#3B3755]">
            Saca una foto de la góndola o del producto como evidencia. Tu supervisor la verá en sus reportes.
          </Text>

          {foto ? (
            <View className="items-center gap-2">
              <Image source={{ uri: foto.uri }} style={{ width: "100%", height: 220, borderRadius: 18, backgroundColor: "#EEEDF6" }} resizeMode="cover" />
              <Text className="text-sm text-[#6B6787]">¿Se ve bien? Puedes cambiarla abajo</Text>
            </View>
          ) : (
            <View className="items-center gap-2 rounded-2xl border-2 border-dashed border-[#C9C4E4] bg-[#F7F6FD] py-8">
              <Feather name="camera" size={30} color="#5743C2" />
              <Text className="text-[15px] font-bold text-[#1B1733]">Falta la foto de evidencia</Text>
            </View>
          )}

          <View className="flex-row gap-3">
            <ImagePickerButton
              usarcamara
              onImagePicked={(img) => {
                setFoto(img);
                setError(null);
              }}
              buttonStyle={{ flex: 1, backgroundColor: "#EEEBFF", borderRadius: 16, paddingVertical: 14 }}
            >
              <View className="flex-row items-center justify-center gap-2">
                <Feather name="camera" size={18} color="#4636A8" />
                <Text className="font-bold text-[#4636A8]">{foto ? "Otra foto" : "Sacar foto"}</Text>
              </View>
            </ImagePickerButton>
            <ImagePickerButton
              onImagePicked={(img) => {
                setFoto(img);
                setError(null);
              }}
              buttonStyle={{ flex: 1, backgroundColor: "#F3F2FB", borderRadius: 16, paddingVertical: 14 }}
            >
              <View className="flex-row items-center justify-center gap-2">
                <Feather name="image" size={18} color="#4636A8" />
                <Text className="font-bold text-[#4636A8]">Galería</Text>
              </View>
            </ImagePickerButton>
          </View>

          {error && <Text className="text-center text-sm font-semibold text-[#C4202F]">{error}</Text>}

          <Pressable
            onPress={completar}
            disabled={!foto || enviando}
            accessibilityRole="button"
            accessibilityState={{ disabled: !foto || enviando }}
            className="flex-row items-center justify-center gap-2 rounded-2xl bg-[#1F9D55] py-4"
            style={{ opacity: foto && !enviando ? 1 : 0.45 }}
          >
            {enviando ? <ActivityIndicator color="white" /> : <Feather name="check-circle" size={20} color="white" />}
            <Text className="text-base font-bold text-white">{enviando ? "Enviando..." : "Completar tarea"}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
