import { Redirect } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { API_URL } from "../config/api";
import { Rol, useAuthSession } from "../providers/AuthProvider";

export default function Login() {
  const { token, signIn } = useAuthSession();
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  if (token) {
    return <Redirect href="/" />;
  }

  const handleLogin = async () => {
    if (!correo.trim() || !clave) {
      setError("Completa el correo y la contraseña");
      return;
    }
    setError("");
    setCargando(true);

    try {
      const res = await fetch(`${API_URL}/usuarios/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: correo.trim(), contrasena: clave }),
      });

      if (res.status === 401) {
        setError("Correo o contraseña incorrectos");
        return;
      }
      if (!res.ok) {
        setError(`Error del servidor (${res.status})`);
        return;
      }

      const data = await res.json();
      const rol: Rol = data.rol === "supervisor" ? "supervisor" : "promotor";
      await signIn(data.token, rol);
    } catch {
      setError("No se pudo conectar con el servidor");
    } finally {
      setCargando(false);
    }
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
        <Text className="text-xs text-gray-500 mb-1 ml-1">Correo</Text>
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

        {error !== "" && <Text className="mb-4 text-center text-red-500">{error}</Text>}

        <Text className="text-xs text-center text-gray-400 mb-4">¿Olvidó su contraseña?</Text>

        <Pressable
          className={`rounded-xl px-6 py-3 ${cargando ? "bg-gray-400" : "bg-[#006699]"}`}
          onPress={handleLogin}
          disabled={cargando}
        >
          <Text className="text-center font-semibold text-white">
            {cargando ? "Ingresando..." : "Ingresar"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}