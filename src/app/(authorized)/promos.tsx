import { API_URL } from "@/config/api";
import { useAuthSession } from "@/providers/AuthProvider";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Promotor { id: string; name: string; correo: string; rol: string; }
interface Tienda { idTienda: number; nombre: string; ubicacion: string; }

type TipoTarea = "precio" | "promo" | "repo";


const tipos: { valor: TipoTarea; texto: string; icono: keyof typeof Feather.glyphMap }[] = [
    { valor: "precio", texto: "Precio", icono: "tag" },
    { valor: "promo", texto: "Promo", icono: "percent" },
    { valor: "repo", texto: "Reposición", icono: "package" },
];

const sombraTarjeta = { boxShadow: "0 4px 12px rgba(10, 85, 104, 0.08)" };

export default function Promos() {
    const insets = useSafeAreaInsets();
    const { token } = useAuthSession();
    const [promotores, setPromotores] = useState<Promotor[]>([]);
    const [tiendas, setTiendas] = useState<Tienda[]>([]);
    const [tipo, setTipo] = useState<TipoTarea | null>(null);
    const [nombreTarea, setNombreTarea] = useState("");
    const [correoPromotor, setCorreoPromotor] = useState<string | null>(null);
    const [idTienda, setIdTienda] = useState<number | null>(null);

    useEffect(() => {
        if (!token) return;
        const headers = { Authorization: token };
        fetch(`${API_URL}/usuarios`, { headers })
            .then((res) => (res.ok ? res.json() : []))
            .then((usuarios: Promotor[]) => {
                setPromotores(usuarios.filter((u) => u.rol?.toLowerCase() === "promotor"));
            });

        fetch(`${API_URL}/api/tiendas`, { headers })
            .then((res) => (res.ok ? res.json() : []))
            .then((data: Tienda[]) => {
                setTiendas(data);
            });
    }, [token]);

    // El botón se activa solo cuando está todo elegido
    const listo = tipo !== null && nombreTarea.trim() !== "" && correoPromotor !== null && idTienda !== null;

    const enviar = () => {
        if (!token) return;
        fetch(`${API_URL}/api/tareas`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: token },
            body: JSON.stringify({
                tipo: tipo,
                nombreTarea: nombreTarea.trim(),
                correoPromotor: correoPromotor,
                idTienda: idTienda,
            }),
        })
            .then((res) => {
                if (res.ok) {
                    router.replace("/");
                } else {
                    alert("No se pudo crear la tarea");
                }
            })
            .catch(() => alert("No hay conexión con el servidor"));
    };










    return (
        <ScrollView
            className="flex-1 bg-[#EEF6F7]"
            contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
            keyboardShouldPersistTaps="handled"
        >
            <StatusBar style="light" />

            {/* Header turquesa del supervisor */}
            <LinearGradient
                colors={["#0A5568", "#0B7C8E", "#0EA5B0", "#3BCBC3"]}
                locations={[0, 0.42, 0.78, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                    paddingHorizontal: 20,
                    paddingTop: insets.top + 16,
                    paddingBottom: 48,
                    borderBottomLeftRadius: 28,
                    borderBottomRightRadius: 28,
                }}
            >
                <View className="flex-row items-center">
                    <Pressable
                        onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
                        accessibilityRole="button"
                        accessibilityLabel="Volver"
                        className="h-11 w-11 items-center justify-center rounded-full border border-[#FFFFFF40] bg-[#FFFFFF26]"
                    >
                        <Feather name="chevron-left" size={24} color="white" />
                    </Pressable>
                    <View className="ml-4 flex-1">
                        <Text className="text-2xl font-bold text-white">Nueva tarea</Text>
                        <Text className="text-sm text-[#D4F5F4]">Precios, promos y reposición</Text>
                    </View>
                </View>
            </LinearGradient>

            <View className="-mt-6 gap-4 px-5">
                {/* 1. Tipo */}
                <Seccion numero={1} titulo="Tipo de tarea">
                    <View className="flex-row flex-wrap gap-2">
                        {tipos.map((t) => (
                            <Chip
                                key={t.valor}
                                texto={t.texto}
                                icono={t.icono}
                                activo={tipo === t.valor}
                                onPress={() => setTipo(t.valor)}
                            />
                        ))}
                    </View>


                </Seccion>

                {/* 2. Nombre */}
                <Seccion numero={2} titulo="¿Qué hay que hacer?">
                    <TextInput
                        value={nombreTarea}
                        onChangeText={setNombreTarea}
                        placeholder="Ej: 30% de descuento en zona infantil"
                        placeholderTextColor="#8AA3AA"
                        className="rounded-2xl border border-[#CFE3E6] bg-[#F6FBFB] px-4 py-3.5 text-[15px] text-[#10262E]"
                    />
                </Seccion>

                {/* 3. Promotor */}
                <Seccion numero={3} titulo="Promotor">
                    {promotores.length === 0 ? (
                        <Text className="text-sm text-[#3B5760]">Cargando promotores...</Text>
                    ) : (
                        <View className="flex-row flex-wrap gap-2">
                            {promotores.map((p) => (
                                <Chip
                                    key={p.correo}
                                    texto={p.name}
                                    icono="user"
                                    activo={correoPromotor === p.correo}
                                    onPress={() => setCorreoPromotor(p.correo)}
                                />
                            ))}
                        </View>
                    )}
                </Seccion>

                {/* 4. Tienda */}
                <Seccion numero={4} titulo="Tienda">
                    {tiendas.length === 0 ? (
                        <Text className="text-sm text-[#3B5760]">Cargando tiendas...</Text>
                    ) : (
                        <View className="flex-row flex-wrap gap-2">
                            {tiendas.map((t) => (
                                <Chip
                                    key={t.idTienda}
                                    texto={t.nombre}
                                    icono="map-pin"
                                    activo={idTienda === t.idTienda}
                                    onPress={() => setIdTienda(t.idTienda)}
                                />
                            ))}
                        </View>
                    )}
                </Seccion>

                {/* Botón asignar */}
                <Pressable
                    onPress={enviar}
                    disabled={!listo}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: !listo }}
                    style={{ opacity: listo ? 1 : 0.45 }}
                >
                    <LinearGradient
                        colors={["#0B7C8E", "#0EA5B0"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                            borderRadius: 16,
                            paddingVertical: 16,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                            boxShadow: "0 4px 10px rgba(11, 124, 142, 0.3)",
                        }}
                    >
                        <Feather name="send" size={18} color="white" />
                        <Text className="text-base font-bold text-white">Asignar tarea</Text>
                    </LinearGradient>
                </Pressable>
            </View>
        </ScrollView>
    );
}

// Tarjeta blanca con número + título (cada paso del formulario)
function Seccion({ numero, titulo, children }: { numero: number; titulo: string; children: React.ReactNode }) {
    return (
        <View className="gap-3 rounded-3xl border border-[#DCEBEE] bg-white p-4" style={sombraTarjeta}>
            <View className="flex-row items-center gap-2">
                <View className="h-6 w-6 items-center justify-center rounded-full bg-[#E3F5F5]">
                    <Text className="text-xs font-bold text-[#0A6D7D]">{numero}</Text>
                </View>
                <Text className="text-base font-bold text-[#10262E]">{titulo}</Text>
            </View>
            {children}
        </View>
    );
}


//chip de seleccion
function Chip({ texto, icono, activo, onPress }: {
    texto: string;
    icono: keyof typeof Feather.glyphMap;
    activo: boolean;
    onPress: () => void;
}) {
    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="radio"
            accessibilityState={{ selected: activo }}
            className={`flex-row items-center gap-1.5 rounded-full border px-4 py-2.5 ${activo ? "border-[#0B7C8E] bg-[#0B7C8E]" : "border-[#CFE3E6] bg-[#F6FBFB]"
                }`}
        >
            <Feather name={icono} size={15} color={activo ? "white" : "#0A6D7D"} />
            <Text className={`text-[15px] font-semibold ${activo ? "text-white" : "text-[#0A5568]"}`}>{texto}</Text>
        </Pressable>
    );
}
