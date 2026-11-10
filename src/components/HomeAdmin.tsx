import { LinearGradient } from "expo-linear-gradient";
import { Feather, FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import { ScrollView, Text, View, Pressable} from "react-native";
import { useEffect, useState } from "react";

import { useAuthSession } from "../providers/AuthProvider";
import { API_URL } from "@/config/api";
import { useRouter } from "expo-router";

export default function HomeAdmin() {
    const fechaHoy = new Date().toLocaleDateString("es-CL", {
        weekday: "long",
        day: "numeric",
        month: "long",
    });

    const signOut = useAuthSession().signOut;
    const [usuarios, setUsuarios] = useState<any[]>([]);
   

    const [nombre, setNombre] = useState<string | null>(null);
    const { token } = useAuthSession();
    const router = useRouter();
    
    const accesos = [
        {texto: "Usuarios", icono: "users", color:"#1E3A8A", ruta: "/gestionUser"},
        {texto: "Logistica", icono: "truck", color:"#2F5BB7"},
        {texto: "Reportes", icono: "file-text", color:"#0E7490"},
    ];
    
    useEffect(() => {
        if (!token) return;

    fetch(`${API_URL}/api/me`, { headers: { Authorization: token } })
        .then((res) => res.json())
        .then((me) => setNombre(me.nombre))
        .catch(() => {});
    
    fetch(`${API_URL}/usuarios`, { headers: { Authorization: token } })
    .then((res) => res.json())
    .then((lista) => setUsuarios(lista))
    .catch(() => {});
    }, [token]);



    const primerNombre = nombre?.split(" ")[0];
    const iniciales = nombre
        ? nombre.split(" ").filter(Boolean).map((n) => n[0]).slice(0, 2).join("").toUpperCase()
        : "";
    const promotores = usuarios.filter((usuario) => usuario.rol === "promotor").length;
    const supervisores = usuarios.filter((usuario) => usuario.rol === "supervisor").length;
        return (
        
    
        <ScrollView className="flex-1 bg-[#F1F4FA]">
        <LinearGradient
            colors={["#0B1B3F", "#13285C", "#1E3A8A", "#2F5BB7"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
                paddingHorizontal: 18,
                paddingTop: 58,
                paddingBottom: 64,
                borderBottomLeftRadius: 32,
                borderBottomRightRadius: 32,
            }}
            >
            <View className="flex-row items-center gap-3">
                <View className="h-12 w-12 items-center justify-center rounded-full bg-white">
                {iniciales ? (
                <Text className="text-lg font-bold text-[#13285C]">{iniciales}</Text>
                ) : (
                    <Ionicons name="person" size={24} color="#4636A8" />
                )}
            </View>
            <View>
                <Text className="text-xl font-bold text-white">
                    {primerNombre ? `Hola, ${primerNombre}` : "Cargando..."}
                </Text>
                <Text className="text-sm text-[#C9D6F2]">Panel de Administración, {fechaHoy}</Text>
            </View>
        </View>
        <View className="mt-5 rounded-[20px] border border-[#FFFFFF33] bg-[#FFFFFF1F] p-4">
                <Text className="text-[15px] font-semibold text-[#C9D6F2]">Usuarios activos</Text>
                <Text className="text-[32px] font-extrabold text-white">{usuarios.length}</Text>
                <Text className="text-sm text-[#E3EAF8]">
                    {promotores} promotores - {supervisores} supervisores
                </Text>
            </View>
        </LinearGradient>

        <View className="-mt-9 gap-6 px-4 pb-10">
            <View className="gap-3">
                <Text className="text-base font-semibold text-[#ffff]">Accesos rápidos</Text>
                <View className="flex-row gap-3">
                {accesos.map((acceso) => (
                    <Pressable
                    key={acceso.texto}
                    onPress={() => acceso.ruta && router.push(acceso.ruta as any)}
                    className="flex-1 items-center rounded-2xl border border-[#E3EAF8] bg-white py-4 shadow-md"
                    >
                    <View className="mb-2 h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: acceso.color }}>
                        <Feather name={acceso.icono as any} size={24} color="white" />
                    </View>
                    <Text className="text-base font-semibold text-[#13285C]">{acceso.texto}</Text>
                    </Pressable>
                ))}
            </View>
        </View>




        {/* Cerrar sesion */}
        <Pressable
            accessibilityRole="button"
            className="items-center rounded-xl bg-[#13285C] py-3"
            onPress={signOut}
        >
            <Text className="font-semibold text-white">Cerrar sesión</Text>
        </Pressable>
        </View>

        

    
    </ScrollView>
    
);
}