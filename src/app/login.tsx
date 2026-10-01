import { Redirect } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useAuthSession } from "../providers/AuthProvider";

export default function Login() {
  const { token, signIn } = useAuthSession();
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");

  // Si ya hay sesión, no tiene sentido mostrar el login
  if (token) {
    return <Redirect href="/" />;
  }

  const handleLogin = async () => {
    if (!correo.trim() || !clave) {
      setError("Completa el correo y la contraseña");
      return;
    }
    setError("");
    // TEMPORAL: token falso. Más adelante acá va la llamada a la API
    await signIn("token-de-prueba-" + Date.now());
  };

  return (
    <View className="flex-1 justify-center bg-white px-8">
      <Text className="mb-8 text-center text-3xl font-bold text-blue-500">
        PRISMA
      </Text>

      <TextInput
        className="mb-4 rounded-xl border border-gray-300 px-4 py-3"
        placeholder="Correo"
        autoCapitalize="none"
        keyboardType="email-address"
        value={correo}
        onChangeText={setCorreo}
      />

      <TextInput
        className="mb-4 rounded-xl border border-gray-300 px-4 py-3"
        placeholder="Contraseña"
        secureTextEntry
        value={clave}
        onChangeText={setClave}
      />

      {error !== "" && <Text className="mb-4 text-red-500">{error}</Text>}

      <Pressable
        className="rounded-xl bg-blue-500 px-6 py-3"
        onPress={handleLogin}
      >
        <Text className="text-center font-semibold text-white">Ingresar</Text>
      </Pressable>
    </View>
  );
}
