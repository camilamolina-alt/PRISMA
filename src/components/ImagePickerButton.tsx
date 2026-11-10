import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';

interface ImagePickerButtonProps {
  onImagePicked: (image: ImagePicker.ImagePickerAsset) => void;
  title?: string;
  buttonStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  usarcamara?: boolean;
  children?: React.ReactNode;
}

export const ImagePickerButton: React.FC<ImagePickerButtonProps> = ({
  onImagePicked,
  title = "Seleccionar Foto",
  buttonStyle,
  textStyle,
  usarcamara = false,
  children,
}) => {
  const handlePress = async (): Promise<void> => {
    const permiso = usarcamara
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permiso.granted) {
      alert(usarcamara
        ? "Se requiere permiso para usar la cámara"
        : "Se requieren permisos para acceder a la galería");
      return;
    }

    const opciones: ImagePicker.ImagePickerOptions = {
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.5,
    };

    const result = usarcamara
      ? await ImagePicker.launchCameraAsync(opciones)
      : await ImagePicker.launchImageLibraryAsync(opciones);

    if (!result.canceled && result.assets.length > 0) {
      onImagePicked(result.assets[0]);
    }
  };

  return (
    <TouchableOpacity style={[styles.button, buttonStyle]} onPress={handlePress}>

      {children ?? <Text style={[styles.text, textStyle]}>{title}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  text: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});