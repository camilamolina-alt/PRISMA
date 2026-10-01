import { Redirect } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Rol, useAuthSession } from "../providers/AuthProvider";

export default function Login() {
  const { token, signIn } = useAuthSession();
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [rol, setRol] = useState<Rol>("promotor");
  const [error, setError] = useState("");

  if (token) {
    return <Redirect href="/" />;
  }

  const handleLogin = async () => {
    if (!correo.trim() || !clave) {
      setError("Completa el correo y la contraseña");
      return;
    }
    setError("");
    //por mientras que no hay api jeje
    await signIn("token-de-prueba-" + Date.now(), rol);
  };

  return (
    <View className="flex-1 justify-center bg-[#F8FAFC] px-6">
      <View className="items-center mb-8">
        <Text className="text-center text-xl font-bold italic text-[#1a365d] tracking-wider mb-2 mt-4">
          PRISMA
        </Text>
        <Text className="text-center text-4xl text-slate-800 font-normal">
          Bienvenido
        </Text>
      </View>

      <View className="bg-white rounded-[24px] p-6 border border-gray-200 shadow-sm">
        <Text className="text-xs text-gray-500 mb-1 ml-1">Correo Electronico</Text>
        <TextInput
          className="mb-4 rounded-xl border border-gray-300 px-4 py-3"
          autoCapitalize="none"
          keyboardType="email-address"
          value={correo}
          onChangeText={setCorreo}
        />

        <Text className="text-xs text-gray-500 mb-1 ml-1">Contraseña</Text>
        <TextInput
          className="mb-4 rounded-xl border border-gray-300 px-4 py-3"
          secureTextEntry
          value={clave}
          onChangeText={setClave}
        />

        <View className="flex-row items-center mb-6 ml-1">
          <View className="w-4 h-4 border border-gray-400 rounded-sm mr-2" />
          <Text className="text-xs text-gray-500">Recordar usuario</Text>
        </View>

        <Text className="mb-2 text-xs text-gray-400 text-center">Entrar como (demo)</Text>
        <View className="mb-6 flex-row">
          <Pressable
            onPress={() => setRol("promotor")}
            className={`mr-2 flex-1 rounded-xl px-4 py-2 ${
              rol === "promotor" ? "bg-[#006699]" : "bg-gray-100"
            }`}
          >
            <Text
              className={`text-center font-semibold text-sm ${
                rol === "promotor" ? "text-white" : "text-gray-700"
              }`}
            >
              Promotor
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setRol("supervisor")}
            className={`flex-1 rounded-xl px-4 py-2 ${
              rol === "supervisor" ? "bg-[#006699]" : "bg-gray-100"
            }`}
          >
            <Text
              className={`text-center font-semibold text-sm ${
                rol === "supervisor" ? "text-white" : "text-gray-700"
              }`}
            >
              Supervisor
            </Text>
          </Pressable>
        </View>

        {error !== "" && <Text className="mb-4 text-center text-red-500">{error}</Text>}

        <Text className="text-xs text-center text-gray-400 mb-4">¿Olvidó su contraseña?</Text>

        <Pressable
          className="rounded-xl bg-[#006699] px-6 py-3"
          onPress={handleLogin}
        >
          <Text className="text-center font-semibold text-white">Ingresar</Text>
        </Pressable>
      </View>
    </View>
  );
}