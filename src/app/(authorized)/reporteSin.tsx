import { ImagePickerButton } from '@/components/ImagePickerButton';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function reporteSin() {
  const [imagen, setImagen] = useState<string | null>(null);
  const [ubicacion, setUbicacion] = useState<Location.LocationObject | null>(null);
  const [cargaUbi, setCargaUbi] = useState<boolean>(false);
  const [comentario, setComentario] = useState<string>('');
  const [confirmado, setConfimado] = useState<boolean>(false);

  const manejarImagePick = (asset: ImagePicker.ImagePickerAsset) => {
    setImagen(asset.uri);
  };

  const agarrarUbi = async () => {
    setCargaUbi(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permiso denegado',
          'Se necesita acceso a la ubicación para registrar punto de salida'
        );
        setCargaUbi(false);
        return;
      }
      const ubiActual = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setUbicacion(ubiActual);
    } catch (error) {
      Alert.alert('Error', 'No se puede obtener la ubicación');
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

  const manejarSubmit = async () => {
  if (!imagen) {
    Alert.alert('Atención', 'Por favor sube foto de cierre');
    return;
  }
  if (!ubicacion) {
    Alert.alert('Atención', 'No hay punto de salida registrado');
    return;
  }
  if (!confirmado) {
    Alert.alert('Atención', 'Debes confirmar antes de continuar');
    return;
  }

  try {
    const formulario = new FormData();

    const nombreFile = imagen.split('/').pop() || 'cierre.jpg';
    const match = /\.(\w+)$/.exec(nombreFile);
    
    // Corregido: ${match[1]} con llaves
    const tipo = match ? `image/${match[1]}` : 'image/jpeg';

    formulario.append('foto', {
      uri: imagen,
      name: nombreFile,
      type: tipo,
    } as any);

    const datosReporte = {
      latitud: ubicacion.coords.latitude,
      longitud: ubicacion.coords.longitude,
      precision: precision,
      comentario: comentario,
      confirmado: confirmado,
      fechaEnvio: new Date().toISOString(),
    };

    
    formulario.append('reporte', JSON.stringify(datosReporte));
      // cambiar el ip en base al pc/server
    const response = await fetch('http://192.168.1.x:8090/api/reportes/cierre', {
      method: 'POST',
      body: formulario,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.ok) {
      Alert.alert('Listo', 'Jornada lista y reporte enviado');
    } else {
      const textoError = await response.text();
      Alert.alert('Error al enviar', `Servidor respondió: ${response.status}`);
    }
  } catch (error) {
    Alert.alert('Error al enviar', 'No se ha podido conectar con el servidor.');
    console.error(error);
  }
};

  return (
    <ScrollView className="flex-1 bg-white px-5 py-6">
      {/* Encabezado */}
      <View className="mb-6">
        <View className="flex-row items-center mb-1">
          <Ionicons name="camera-outline" size={28} color="#0f172a" />
          <Text className="text-xl font-bold text-slate-900 ml-2">
            Cierre del Día
          </Text>
        </View>
        <Text className="text-slate-500 text-sm">
          Es obligatorio subir una foto de la góndola o exhibidor al finalizar la
          jornada.
        </Text>
      </View>

      {/* Componente ImagePickerButton */}
      <View className="mb-6">
        {imagen ? (
          <TouchableOpacity
            onPress={() => setImagen(null)}
            activeOpacity={0.8}
            className="border border-slate-200 rounded-xl p-2 bg-white shadow-sm"
          >
            <Image
              source={{ uri: imagen }}
              className="w-full h-44 rounded-lg"
              resizeMode="cover"
            />
            <Text className="text-center text-xs text-red-500 mt-2 font-medium">
              Tocar para cambiar foto
            </Text>
          </TouchableOpacity>
        ) : (
          <ImagePickerButton
            onImagePicked={manejarImagePick}
            title="Subir Foto de Cierre"
            buttonStyle={{
              backgroundColor: '#FFFFFF',
              borderWidth: 1,
              borderColor: '#E2E8F0',
              borderRadius: 12,
              paddingVertical: 24,
              paddingHorizontal: 16,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            textStyle={{
              color: '#1E293B',
              fontSize: 16,
              fontWeight: '600',
            }}
          />
        )}
      </View>

      {/* Punto de Salida dinámico con expo-location */}
      <View className="mb-6">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-slate-800 font-bold text-xs tracking-wider uppercase">
            Punto de Salida
          </Text>
          <TouchableOpacity onPress={agarrarUbi} activeOpacity={0.7}>
            <Text className="text-blue-600 text-xs font-semibold">
              Actualizar
            </Text>
          </TouchableOpacity>
        </View>

        <View className="bg-blue-100 rounded-xl h-36 items-center justify-center relative overflow-hidden">
          {cargaUbi ? (
            <ActivityIndicator size="large" color="#0073ab" />
          ) : (
            <>
              <Ionicons name="location" size={38} color="#0073ab" />
              {ubicacion && (
                <Text className="text-slate-600 text-xs mt-1 font-mono">
                  {ubicacion.coords.latitude.toFixed(5)},{' '}
                  {ubicacion.coords.longitude.toFixed(5)}
                </Text>
              )}
              <View className="absolute bottom-3 left-4">
                <Text className="text-slate-600 font-bold text-xs uppercase">
                  PRECISIÓN:{' '}
                  <Text className="font-normal">
                    {precision !== null ? `${precision}M` : 'NO DISPONIBLE'}
                  </Text>
                </Text>
              </View>
            </>
          )}
        </View>
      </View>

      {/* Comentarios Adicionales */}
      <View className="mb-6">
        <Text className="text-slate-800 font-bold text-xs tracking-wider uppercase mb-2">
          Comentarios Adicionales
        </Text>
        <TextInput
          className="border border-slate-200 rounded-xl p-4 bg-white text-slate-800 text-sm min-h-[100px] text-center"
          placeholder="¿Algo más que debamos saber?"
          placeholderTextColor="#94a3b8"
          multiline
          textAlignVertical="top"
          value={comentario}
          onChangeText={setComentario}
        />
      </View>

      {/* Checkbox de confirmación */}
      <TouchableOpacity
        onPress={() => setConfimado(!confirmado)}
        activeOpacity={0.7}
        className="flex-row items-center mb-8 pr-2"
      >
        <View
          className={`w-6 h-6 border rounded justify-center items-center mr-3 ${
            confirmado
              ? 'bg-blue-600 border-blue-600'
              : 'border-slate-300 bg-white'
          }`}
        >
          {confirmado && <MaterialIcons name="check" size={18} color="white" />}
        </View>
        <Text className="text-slate-600 text-xs flex-1 leading-4">
          Confirmo que todos los datos entregados son verídicos y que mi jornada
          ha concluido legalmente.
        </Text>
      </TouchableOpacity>

      {/* Botón Principal */}
      <TouchableOpacity
        onPress={manejarSubmit}
        activeOpacity={0.8}
        className="bg-[#0073ab] py-4 rounded-xl items-center shadow-md mb-8"
      >
        <Text className="text-white font-bold text-base">
          Finalizar Jornada y enviar reporte
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}