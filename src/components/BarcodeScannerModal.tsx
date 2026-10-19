import { Ionicons } from "@expo/vector-icons";
import {
    BarcodeScanningResult,
    CameraView,
    useCameraPermissions,
} from "expo-camera";
import React, { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";

interface BarcodeScannerModalProps {
  isVisible: boolean;
  onClose: () => void;
  onScanSuccess: (data: string, type: string) => void;
  title?: string;
}

export default function BarcodeScannerModal({
  isVisible,
  onClose,
  onScanSuccess,
  title = "Alinea el código dentro del recuadro",
}: BarcodeScannerModalProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  // Solicitar permiso de cámara si no está concedido
  React.useEffect(() => {
    if (isVisible && !permission?.granted) {
      requestPermission();
    }
  }, [isVisible]);

  const handleBarcodeScanned = (result: BarcodeScanningResult) => {
    if (scanned) return;
    setScanned(true);

    // Llama al callback con el código detectado
    onScanSuccess(result.data, result.type);

    // Reinicia el estado de escaneo después de cerrar
    setTimeout(() => setScanned(false), 500);
  };

  if (!permission?.granted && isVisible) {
    return (
      <Modal visible={isVisible} animationType="slide">
        <View className="flex-1 items-center justify-center bg-gray-900 p-6">
          <Text className="mb-4 text-center text-white">
            Se requiere permiso para acceder a la cámara y escanear códigos.
          </Text>
          <Pressable
            className="rounded-xl bg-sky-500 px-6 py-3"
            onPress={requestPermission}
          >
            <Text className="font-bold text-white">Otorgar Permiso</Text>
          </Pressable>
          <Pressable className="mt-4 py-2" onPress={onClose}>
            <Text className="text-gray-400">Cancelar</Text>
          </Pressable>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={isVisible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black">
        <CameraView
          style={{ flex: 1 }}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ["itf14", "ean13", "code128", "qr"],
          }}
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        >
          <View className="flex-1 justify-between px-6 py-12">
            {/* Botón Cerrar Superior */}
            <View className="w-full flex-row justify-end">
              <Pressable
                className="rounded-full bg-gray-900/80 p-3"
                onPress={onClose}
              >
                <Ionicons name="close" size={28} color="white" />
              </Pressable>
            </View>

            {/* Cuadro de Lectura */}
            <View className="items-center">
              <View className="h-48 w-80 rounded-2xl border-2 border-dashed border-sky-400 bg-transparent" />
              <Text className="mt-4 font-semibold text-white">{title}</Text>
            </View>

            {/* Botón Cancelar */}
            <Pressable
              className="self-center rounded-xl bg-red-600 px-8 py-3"
              onPress={onClose}
            >
              <Text className="font-bold text-white">Cancelar</Text>
            </Pressable>
          </View>
        </CameraView>
      </View>
    </Modal>
  );
}