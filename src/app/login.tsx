import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Redirect } from "expo-router";
import { useState } from "react";
import { Platform, Pressable, Text, TextInput, View } from "react-native";
import { API_URL, API_URL_AUTO, guardarServidor, normalizarServidor } from "../config/api";
import { Rol, useAuthSession } from "../providers/AuthProvider";

export default function Login() {
  const { token, signIn } = useAuthSession();
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [verpass, setVerpass] = useState(false);


  const [verServidor, setVerServidor] = useState(false);
  const [servidor, setServidor] = useState(API_URL === API_URL_AUTO ? "" : API_URL);
  const [msgServidor, setMsgServidor] = useState<{ ok: boolean; texto: string } | null>(null);

  if (token) {
    return <Redirect href="/" />;
  }

  const probarServidor = async (texto: string | null) => {
    const url = await guardarServidor(texto);
    setServidor(texto ? normalizarServidor(texto) : "");
    setMsgServidor({ ok: true, texto: "Probando " + url + "..." });
    try {
      const res = await fetch(`${url}/usuarios`);
      setMsgServidor(
        res.ok
          ? { ok: true, texto: "Conectado a " + url }
          : { ok: false, texto: `El servidor respondió con error (${res.status})` }
      );
    } catch {
      setMsgServidor({ ok: false, texto: "No se pudo conectar a " + url + ". ¿Mismo WiFi? ¿Backend encendido?" });
    }
  };

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
      const rol: Rol = data.rol === "supervisor" ? "supervisor" : data.rol === "admin" ? "admin" : "promotor";
      if (rol === "admin" && Platform.OS !== "web") {
        setError("El administrador ingresa desde la página web de PRISMA");
        return;
      }
      await signIn(data.token, rol);
    } catch {
      setError("No se pudo conectar con el servidor");
    } finally {
      setCargando(false);
    }
  };

  return (
    <View className="flex-1 justify-center overflow-hidden bg-[#EEEFFA] px-6">

      <View pointerEvents="none" className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[#D8D1FF] opacity-70" />
      <View pointerEvents="none" className="absolute -right-32 -top-10 h-96 w-96 rounded-full bg-[#C6ECF8] opacity-70" />
      <View pointerEvents="none" className="absolute -bottom-20 -left-28 h-80 w-80 rounded-full bg-[#D2F4E3] opacity-70" />
      <View pointerEvents="none" className="absolute -bottom-28 -right-24 h-80 w-80 rounded-full bg-[#FFE4CB] opacity-70" />

      <Pressable
        onPress={() => setVerServidor(!verServidor)}
        accessibilityRole="button"
        accessibilityLabel="Configurar servidor"
        hitSlop={12}
        className="absolute right-6 top-14 h-11 w-11 items-center justify-center rounded-full bg-[#FFFFFFA6]"
      >
        <Feather name="settings" size={20} color="#5B47D6" />
      </Pressable>

      {verServidor && (
        <View className="mb-4 gap-2 rounded-3xl border border-[#D9D6E6] bg-[#FFFFFFD9] p-4">
          <Text className="text-[15px] font-semibold text-[#1F1A3D]">Servidor</Text>
          <Text className="text-[13px] text-[#6B6787]">IP del PC con el backend (ver con ipconfig). Ej: 192.168.1.20</Text>
          <TextInput
            className="h-12 rounded-full border-[1.5px] border-[#D9D6E6] bg-white px-4 text-[16px] text-[#1F1A3D]"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            placeholder={API_URL_AUTO}
            value={servidor}
            onChangeText={setServidor}
          />
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => probarServidor(servidor)}
              disabled={!servidor.trim()}
              className="h-11 flex-1 justify-center rounded-full bg-[#5B47D6]"
              style={{ opacity: servidor.trim() ? 1 : 0.5 }}
            >
              <Text className="text-center font-semibold text-white">Guardar y probar</Text>
            </Pressable>
            <Pressable onPress={() => probarServidor(null)} className="h-11 justify-center rounded-full border border-[#D9D6E6] bg-white px-4">
              <Text className="font-semibold text-[#5B47D6]">Automático</Text>
            </Pressable>
          </View>
          {msgServidor && (
            <Text className={`text-[13px] font-medium ${msgServidor.ok ? "text-[#11602F]" : "text-[#C62C43]"}`}>
              {msgServidor.texto}
            </Text>
          )}
        </View>
      )}

      <View className="items-center mb-8">
      <Image
      source={require("../../assets/images/logo-login.png")}
      style={{ width: verServidor ? 110 : 220, height: verServidor ? 110 : 220 }}
      contentFit="contain"
/>
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
        <View className="mb-5 justify-center">
          <TextInput
            className="h-14 rounded-full border-[1.5px] border-[#D9D6E6] bg-[#FFFFFFA6] pl-5 pr-14 text-[17px] text-[#1F1A3D]"
            secureTextEntry={!verpass}
            autoCapitalize="none"
            value={clave}
            onChangeText={setClave}
          />
          <Pressable
            onPress={() => setVerpass(!verpass)}
            accessibilityRole="button"
            accessibilityLabel={verpass ? "Ocultar contraseña" : "Mostrar contraseña"}
            hitSlop={10}
            className="absolute right-4 h-10 w-10 items-center justify-center"
          >
            <Feather name={verpass ? "eye-off" : "eye"} size={22} color="#6B6787" />
          </Pressable>
        </View>

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
