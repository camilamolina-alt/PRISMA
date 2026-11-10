import { ImagePickerButton } from "@/components/ImagePickerButton";
import { API_URL } from "@/config/api";
import { useAuthSession } from "@/providers/AuthProvider";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";


const sombraTarjeta = { boxShadow: "0 4px 12px rgba(70, 54, 168, 0.08)" };
const sombraIcono = (rgb: string) => ({
  boxShadow: `0 4px 10px rgba(${rgb}, 0.3)`,
});

export default function ReporteSin() {
  const { token } = useAuthSession();
  const insets = useSafeAreaInsets();
  const [imagen, setImagen] = useState<ImagePicker.ImagePickerAsset | null>(
    null,
  );
  const [ubicacion, setUbicacion] = useState<Location.LocationObject | null>(
    null,
  );
  const [direccion, setDireccion] = useState<string | null>(null);
  const [cargaUbi, setCargaUbi] = useState<boolean>(false);
  const [comentario, setComentario] = useState<string>("");
  const [confirmado, setConfirmado] = useState<boolean>(false);
  const [enviando, setEnviando] = useState<boolean>(false);

  const manejarImagePick = (asset: ImagePicker.ImagePickerAsset) => {
    setImagen(asset);
  };

  const agarrarUbi = async () => {
    setCargaUbi(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permiso denegado",
          "Se necesita acceso a la ubicación para registrar punto de salida",
        );
        setCargaUbi(false);
        return;
      }
      const ubiActual = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setUbicacion(ubiActual);

      // Transformar las coordenadas en una dirección 
      try {
        const [lugar] = await Location.reverseGeocodeAsync({
          latitude: ubiActual.coords.latitude,
          longitude: ubiActual.coords.longitude,
        });

        if (lugar) {
          const calle = [lugar.street, lugar.streetNumber]
            .filter(Boolean)
            .join(" ");
          const zona = lugar.district ?? lugar.city;
          setDireccion([calle, zona].filter(Boolean).join(", ") || null);
        } else {
          setDireccion(null);
        }
      } catch {
        setDireccion(null);
      }
    } catch {
      Alert.alert("Error", "No se puede obtener la ubicación");
    } finally {
      setCargaUbi(false);
    }
  };

  useEffect(() => {
    agarrarUbi();
  }, []);

  const precision = ubicacion?.coords.accuracy
    ? Math.round(ubicacion.coords.accuracy)
    : null;

  // verde si la ubicación es buena 30 m, naranjo si es más imprecisa
  const precisionBuena = precision !== null && precision <= 30;

  const manejarSubmit = async () => {
    if (enviando) return;
    if (!token) {
      Alert.alert("Sesión expirada", "Vuelve a iniciar sesión");
      return;
    }
    if (!imagen) {
      Alert.alert("Atención", "Por favor sube foto de cierre");
      return;
    }
    if (!ubicacion) {
      Alert.alert("Atención", "No hay punto de salida registrado");
      return;
    }
    if (!confirmado) {
      Alert.alert("Atención", "Debes confirmar antes de continuar");
      return;
    }

    setEnviando(true);

    try {
      const formulario = new FormData();

      formulario.append("foto", {
        uri: imagen.uri,
        name: imagen.fileName ?? "cierre.jpg",
        type: imagen.mimeType ?? "image/jpeg",
      } as any);

      formulario.append("latitud", ubicacion.coords.latitude.toString());
      formulario.append("longitud", ubicacion.coords.longitude.toString());
      formulario.append(
        "precision",
        precision !== null ? precision.toString() : "",
      );
      formulario.append("comentario", comentario);
      formulario.append("confirmado", confirmado.toString());

      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${API_URL}/api/reportes/cierre`);
        xhr.setRequestHeader("Authorization", token);

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(xhr.response);
          } else {
            reject(
              new Error(
                `Servidor respondió: ${xhr.status} - ${xhr.responseText}`,
              ),
            );
          }
        };

        xhr.onerror = () => {
          reject(new Error("No se ha podido conectar con el servidor."));
        };

        xhr.send(formulario);
      });

      setImagen(null);
      setComentario("");
      setConfirmado(false);
      // Al apretar OK vuelve al inicio
      Alert.alert("Listo", "Jornada lista y reporte enviado", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert(
        "Error al enviar",
        error.message || "No se ha podido conectar con el servidor.",
      );
      console.error(error);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-[#F5F4FB]"
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
    >
      <StatusBar style="light" />

      {/* Header */}
      <LinearGradient
        colors={["#4636A8", "#5743C2", "#4F6FD0", "#3F96C4"]}
        locations={[0, 0.45, 0.8, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingHorizontal: 20,
          paddingTop: insets.top + 16,
          paddingBottom: 56,
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
        }}
      >
        <View className="flex-row items-center">
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Volver"
            className="h-11 w-11 items-center justify-center rounded-full border border-[#FFFFFF40] bg-[#FFFFFF26]"
          >
            <Feather name="chevron-left" size={24} color="white" />
          </Pressable>
          <View className="ml-4">
            <Text className="text-2xl font-bold text-white">
              Cierre del día
            </Text>
            <Text className="text-sm text-[#E2DDFB]">
              Paso 2 de 2 · Evidencia
            </Text>
          </View>
        </View>

        {/* bara de progreso*/}
        <View className="mt-5 flex-row gap-2">
          <View className="h-1.5 flex-1 rounded-full bg-white" />
          <View className="h-1.5 flex-1 rounded-full bg-white" />
        </View>
      </LinearGradient>

    
      <View className="-mt-6 gap-4 px-5">
        {/* Foto de cierre */}
        {imagen ? (
          <Pressable
            onPress={() => setImagen(null)}
            accessibilityRole="button"
            accessibilityLabel="Cambiar foto de cierre"
            className="overflow-hidden rounded-3xl border border-[#E4E2EE] bg-white p-2"
            style={sombraTarjeta}
          >
            <Image
              source={{ uri: imagen.uri }}
              className="h-52 w-full rounded-2xl"
              resizeMode="cover"
            />
            <View className="flex-row items-center justify-center gap-1.5 py-2.5">
              <Feather name="refresh-cw" size={14} color="#5B3FE0" />
              <Text className="text-sm font-semibold text-[#5B3FE0]">
                Tocar para cambiar foto
              </Text>
            </View>
          </Pressable>
        ) : (
          <ImagePickerButton
            usarcamara
            onImagePicked={manejarImagePick}
            buttonStyle={{
              backgroundColor: "#FFFFFF",
              borderWidth: 1.5,
              borderStyle: "dashed",
              borderColor: "#B9ACF5",
              borderRadius: 24,
              paddingVertical: 28,
              paddingHorizontal: 16,
              alignItems: "center",
            }}
          >
            <LinearGradient
              colors={["#8B6CFF", "#5B3FE0"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                { marginBottom: 12, borderRadius: 16, padding: 14 },
                sombraIcono("91, 63, 224"),
              ]}
            >
              <Feather name="camera" size={28} color="white" />
            </LinearGradient>
            <Text className="text-base font-bold text-[#1B1733]">
              Foto de cierre
            </Text>
            <Text className="mt-0.5 text-[13px] text-[#6B6787]">
              Góndola o exhibidor · obligatoria
            </Text>
          </ImagePickerButton>
        )}

        {/* Punto de salida */}
        <View
          className="overflow-hidden rounded-3xl border border-[#E4E2EE] bg-white"
          style={sombraTarjeta}
        >
          <View className="h-32 items-center justify-center bg-[#DCE7F7]">
            {cargaUbi ? (
              <ActivityIndicator size="large" color="#0284C7" />
            ) : (
              <>
                <Ionicons name="location-outline" size={34} color="#0284C7" />
                {ubicacion && (
                  <Text
                    className="mt-1 px-14 text-center text-sm font-semibold text-[#2D4F73]"
                    numberOfLines={2}
                  >
                    {direccion ??
                      `${ubicacion.coords.latitude.toFixed(5)}, ${ubicacion.coords.longitude.toFixed(5)}`}
                  </Text>
                )}
              </>
            )}

            {/* Botón para volver a pedir la ubicación */}
            <Pressable
              onPress={agarrarUbi}
              disabled={cargaUbi}
              accessibilityRole="button"
              accessibilityLabel="Actualizar ubicación"
              className="absolute right-3 top-3 h-9 w-9 items-center justify-center rounded-full bg-white"
              style={{ opacity: cargaUbi ? 0.5 : 1 }}
            >
              <Feather name="refresh-cw" size={16} color="#0284C7" />
            </Pressable>
          </View>

          <View className="flex-row items-center justify-between px-4 py-3.5">
            <Text className="text-[15px] font-bold text-[#1B1733]">
              Punto de salida
            </Text>
            <View
              className={`rounded-full px-3 py-1 ${
                precision === null
                  ? "bg-[#F1F0F7]"
                  : precisionBuena
                    ? "bg-[#DCFCE7]"
                    : "bg-[#FEF3C7]"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  precision === null
                    ? "text-[#6B6787]"
                    : precisionBuena
                      ? "text-[#15803D]"
                      : "text-[#B45309]"
                }`}
              >
                {precision !== null
                  ? `Precisión ${precision} m`
                  : "Sin ubicación"}
              </Text>
            </View>
          </View>
        </View>

        {/* Comentarios */}
        <View>
          <Text className="mb-2 mt-1 text-base font-bold text-[#1B1733]">
            Comentarios adicionales
          </Text>
          <TextInput
            className="min-h-[96px] rounded-2xl border border-[#E4E2EE] bg-white p-4 text-sm text-[#1B1733]"
            style={sombraTarjeta}
            placeholder="¿Algo más que debamos saber?"
            placeholderTextColor="#8E8AA8"
            multiline
            textAlignVertical="top"
            value={comentario}
            onChangeText={setComentario}
          />
        </View>

        {/* Confirmación */}
        <Pressable
          onPress={() => setConfirmado(!confirmado)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: confirmado }}
          className="flex-row items-start pr-2"
        >
          <View
            className={`mr-3 mt-0.5 h-6 w-6 items-center justify-center rounded-md border-2 ${
              confirmado
                ? "border-[#5B3FE0] bg-[#5B3FE0]"
                : "border-[#B9ACF5] bg-white"
            }`}
          >
            {confirmado && <Feather name="check" size={16} color="white" />}
          </View>
          <Text className="flex-1 text-sm leading-5 text-[#6B6787]">
            Confirmo que los datos son verídicos y que mi jornada terminó.
          </Text>
        </Pressable>

        {/* Enviar */}
        <Pressable
          onPress={manejarSubmit}
          disabled={enviando}
          accessibilityRole="button"
          style={{ opacity: enviando ? 0.7 : 1 }}
        >
          <LinearGradient
            colors={["#5B3FE0", "#4636A8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              {
                borderRadius: 16,
                paddingVertical: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              },
              sombraIcono("70, 54, 168"),
            ]}
          >
            {enviando ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Feather name="send" size={18} color="white" />
                <Text className="text-base font-bold text-white">
                  Finalizar y enviar reporte
                </Text>
              </>
            )}
          </LinearGradient>
        </Pressable>
      </View>
    </ScrollView>
  );
}
