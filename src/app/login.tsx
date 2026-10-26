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
    <View className="flex-1 justify-center overflow-hidden bg-[#EEEFFA] px-6">
      {/* Fondo nacar: circulos suaves superpuestos */}
      <View pointerEvents="none" className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[#D8D1FF] opacity-70" />
      <View pointerEvents="none" className="absolute -right-32 -top-10 h-96 w-96 rounded-full bg-[#C6ECF8] opacity-70" />
      <View pointerEvents="none" className="absolute -bottom-20 -left-28 h-80 w-80 rounded-full bg-[#D2F4E3] opacity-70" />
      <View pointerEvents="none" className="absolute -bottom-28 -right-24 h-80 w-80 rounded-full bg-[#FFE4CB] opacity-70" />

      <View className="items-center mb-8">
        <Text className="text-center text-[30px] font-medium text-[#231A4F] mb-6 mt-4">
          Prisma
        </Text>
        <Text className="text-center text-2xl font-semibold text-[#1F1A3D]">
          Bienvenido
        </Text>
      </View>

      <View>
        <Text className="text-[15px] font-semibold text-[#1F1A3D] mb-2 ml-4">Correo</Text>
        <TextInput
          className="mb-5 h-14 rounded-full border-[1.5px] border-[#D9D6E6] bg-[#FFFFFFA6] px-5 text-[17px] text-[#1F1A3D]"
          autoCapitalize="none"
          keyboardType="email-address"
          value={correo}
          onChangeText={setCorreo}
        />

        <Text className="text-[15px] font-semibold text-[#1F1A3D] mb-2 ml-4">Contraseña</Text>
        <TextInput
          className="mb-5 h-14 rounded-full border-[1.5px] border-[#D9D6E6] bg-[#FFFFFFA6] px-5 text-[17px] text-[#1F1A3D]"
          secureTextEntry
          value={clave}
          onChangeText={setClave}
        />

        <View className="flex-row items-center mb-4 ml-2">
          <View className="w-6 h-6 border-[1.5px] border-[#C9C5DD] bg-[#FFFFFFA6] rounded-lg mr-3" />
          <Text className="text-[15px] text-[#1F1A3D]">Recordar usuario</Text>
        </View>

        {error !== "" && <Text className="mb-4 text-center text-[15px] font-medium text-[#C62C43]">{error}</Text>}

        <Text className="text-[15px] font-semibold text-right text-[#5B47D6] mb-6 mr-2">¿Olvidó su contraseña?</Text>

        <Pressable
          className={`h-14 justify-center rounded-full px-6 shadow-lg ${cargando ? "bg-[#8F89B0]" : "bg-[#231A4F]"}`}
          onPress={handleLogin}
          disabled={cargando}
        >
          <Text className="text-center text-[17px] font-semibold text-white">
            {cargando ? "Ingresando..." : "Ingresar"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
