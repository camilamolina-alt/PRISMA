import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';

interface ImagePickerButtonProps {
  onImagePicked: (image: ImagePicker.ImagePickerAsset) => void;
  title?: string;
  buttonStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const ImagePickerButton: React.FC<ImagePickerButtonProps> = ({
  onImagePicked,
  title = "Seleccionar Foto",
  buttonStyle,
  textStyle,
}) => {
  const handlePress = async (): Promise<void> => {
  
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      alert("Se requieren permisos para acceder a la galería");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      onImagePicked(result.assets[0]);
    }
  };

  return (
    <TouchableOpacity style={[styles.button, buttonStyle]} onPress={handlePress}>
      <Text style={[styles.text, textStyle]}>{title}</Text>
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