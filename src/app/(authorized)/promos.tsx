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
interface Asignacion { correoPromotor: string; tienda: Tienda; }

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
    const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
    const [cadena, setCadena] = useState<string | null>(null);
    const [enviando, setEnviando] = useState(false);

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

        fetch(`${API_URL}/api/asignaciones`, { headers })
            .then((res) => (res.ok ? res.json() : []))
            .then((data: Asignacion[]) => setAsignaciones(data))
            .catch(() => { });
    }, [token]);

    // Una opción por cadena 
    const cadenas = Object.values(
        tiendas.reduce<Record<string, { nombre: string; sucursales: number }>>((acc, t) => {
            const clave = t.nombre.trim().toLowerCase();
            acc[clave] = { nombre: acc[clave]?.nombre ?? t.nombre.trim(), sucursales: (acc[clave]?.sucursales ?? 0) + 1 };
            return acc;
        }, {})
    ).sort((a, b) => a.nombre.localeCompare(b.nombre));

    const destinatarios = cadena
        ? [...new Set(
            asignaciones
                .filter((a) => a.tienda?.nombre?.trim().toLowerCase() === cadena.toLowerCase())
                .map((a) => a.correoPromotor)
        )].map((correo) => promotores.find((p) => p.correo === correo)?.name ?? correo)
        : [];

    const listo = tipo !== null && nombreTarea.trim() !== "" && cadena !== null && destinatarios.length > 0 && !enviando;

    const enviar = () => {
        if (!token || !listo) return;
        setEnviando(true);
        fetch(`${API_URL}/api/tareas/cadena`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: token },
            body: JSON.stringify({
                tipo: tipo,
                nombreTarea: nombreTarea.trim(),
                cadena: cadena,
            }),
        })
            .then(async (res) => {
                if (res.ok) {
                    router.replace("/");
                } else {
                    alert((await res.text()) || "No se pudo crear la tarea");
                }
            })
            .catch(() => alert("No hay conexión con el servidor"))
            .finally(() => setEnviando(false));
    };

    return (
        <ScrollView
            className="flex-1 bg-[#EEF6F7]"
            contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
            keyboardShouldPersistTaps="handled"
        >
            <StatusBar style="light" />

            {/* Header turquesa  */}
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

                {/* 3. Tienda */}
                <Seccion numero={3} titulo="Tienda">
                    {cadenas.length === 0 ? (
                        <Text className="text-sm text-[#3B5760]">Cargando tiendas...</Text>
                    ) : (
                        <View className="flex-row flex-wrap gap-2">
                            {cadenas.map((c) => (
                                <Chip
                                    key={c.nombre}
                                    texto={c.sucursales > 1 ? `${c.nombre} (${c.sucursales})` : c.nombre}
                                    icono="map-pin"
                                    activo={cadena === c.nombre}
                                    onPress={() => setCadena(c.nombre)}
                                />
                            ))}
                        </View>
                    )}

                    {cadena && (
                        destinatarios.length > 0 ? (
                            <View className="flex-row items-start gap-2 rounded-2xl bg-[#E3F5F5] p-3">
                                <Feather name="users" size={16} color="#0A6D7D" style={{ marginTop: 2 }} />
                                <Text className="flex-1 text-sm text-[#0A5568]">
                                    <Text className="font-bold">Le llega a: </Text>
                                    {destinatarios.join(", ")}
                                </Text>
                            </View>
                        ) : (
                            <View className="flex-row items-start gap-2 rounded-2xl bg-[#FFF2DC] p-3">
                                <Feather name="alert-circle" size={16} color="#9A5300" style={{ marginTop: 2 }} />
                                <Text className="flex-1 text-sm text-[#9A5300]">
                                    Ningún promotor tiene asignada esta tienda todavía
                                </Text>
                            </View>
                        )
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
                        <Text className="text-base font-bold text-white">{enviando ? "Enviando..." : "Asignar tarea"}</Text>
                    </LinearGradient>
                </Pressable>
            </View>
        </ScrollView>
    );
}


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
