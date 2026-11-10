
import { ScrollView, Text, View, Pressable, Alert, Platform, TextInput } from "react-native";
import { useEffect, useState } from "react";

import { useAuthSession } from "../../providers/AuthProvider";
import { API_URL } from "@/config/api";



export default function GestionUserer() {

    const [name, setName] = useState("");
    const [correo, setCorreo] = useState("");
    const [rol, setRol] = useState("promotor");
    const [pass, setPass] = useState("");

    const eliminarWeb = (usuario: any) => {
        if (!token) return;
        fetch(`${API_URL}/usuarios/${usuario.id}`, {
            method: "DELETE",
            headers: { Authorization: token },
        })
            .then((res) => {
                if (res.ok) {
                    setUsuarios(usuarios.filter((u) => u.id !== usuario.id));
                }
            })
            .catch(() => { });
    };

    const eliminar = (usuario: any) => {
        const mensaje = `¿Seguro que quieres eliminar a ${usuario.name}?`;

        if (Platform.OS === "web") {
            if (window.confirm(mensaje)) eliminarWeb(usuario);
            return;
        }

        Alert.alert("Eliminar usuario", mensaje, [
            { text: "Cancelar", style: "cancel" },
            { text: "Eliminar", style: "destructive", onPress: () => eliminarWeb(usuario) }
        ]);
    };




    const [usuarios, setUsuarios] = useState<any[]>([]);

    const { token } = useAuthSession();

    useEffect(() => {
        if (!token) return;

        fetch(`${API_URL}/usuarios`, { headers: { Authorization: token } })
            .then((res) => res.json())
            .then((lista) => setUsuarios(lista))
            .catch(() => { });
    }, [token]);

    const aviso = (mensaje: string) => {
        if (Platform.OS === "web") window.alert(mensaje);
        else Alert.alert("Atencion", mensaje)
    };

    const crear = () => {
        if (!token) return;
        if (!name.trim() || !correo.trim() || !pass.trim()) {
            aviso("Rellena nombre,correo y contraseña");
            return;
        }
        if (usuarios.some((u) => u.correo === correo.trim())) {
            aviso("Ya hay un usuario registrado con ese correo");
            return;
        }

        fetch(`${API_URL}/usuarios/registro`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: token },
            body: JSON.stringify({ nombre: name.trim(), correo: correo.trim(), contrasena: pass, rol }),
        })
            .then((res) => res.json())
            .then((nuevo) => {
                setUsuarios([...usuarios, nuevo])
                setName("");
                setCorreo("");
                setPass("");
                setRol("promotor");
            })
            .catch(() => aviso("No se puede crear el usuario"));
    }

    const cambio = (usuario: any, nuevorol: string) => {
        if (!token || usuario.rol === nuevorol)
            return;
        fetch(`${API_URL}/usuarios/${usuario.id}/rol`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: token },
            body: JSON.stringify({ rol: nuevorol }),
        })
            .then((res) => res.json())
            .then((actualizado) => {
                setUsuarios(usuarios.map((u) => (u.id === actualizado.id ? actualizado : u)));
            })
            .catch(() => aviso("No se puede cambiar"))
    };


    return (


        <ScrollView className="flex-1 bg-[#F1F4FA]">
            <View className="p-4">
                <Text className="text-lg font-bold text-[#0F1B33]">Gestión de usuarios</Text>

                <View className="mt-3 gap-2 rounded-2xl border border-[#DCE3F0] bg-white p-4 shadow-md">
                    <Text className="text-base font-bold text-[#0F1B33]">Agregar usuario</Text>
                    <TextInput
                        placeholder="Nombre"
                        value={name}
                        onChangeText={setName}
                        className="rounded-lg border border-[#DCE3F0] bg-[#F1F4FA] p-3 text-base text-[#0F1B33]"

                    />
                    <TextInput
                        placeholder="Correo"
                        value={correo}
                        onChangeText={setCorreo}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        className="rounded-lg border border-[#DCE3F0] bg-[#F1F4FA] p-3 text-base text-[#0F1B33]"


                    />
                    <TextInput
                        placeholder="Contrasena"
                        value={pass}
                        onChangeText={setPass}
                        secureTextEntry
                        className="rounded-lg border border-[#DCE3F0] bg-[#F1F4FA] p-3 text-base text-[#0F1B33]"

                    />

                    {/* PARA SELECCIONAR EL ROL DEL USUARIO */}
                    <View className="flex-row gap-2">
                        {["admin", "supervisor", "promotor"].map((r) => (
                            <Pressable
                                key={r}
                                onPress={() => setRol(r)}
                                className={`flex-1 items-center rounded-lg border px-2 py-2 ${rol === r ? "border-[#13285C] bg-[#13285C]" : "border-[#DCE3F0] bg-white"}`}
                            >
                                <Text className={`font-semibold capitalize ${rol === r ? "text-white" : "text-[#0F1B33]"}`}>{r}</Text>
                            </Pressable>
                        ))}
                    </View>
                    <Pressable onPress={crear} className="mt-1 items-center rounded-lg bg-[#13285C] py-3">
                        <Text className="font-bold text-white">Crear usuario</Text>
                    </Pressable>

                </View>

                {usuarios.map(usuario => (
                    <View key={usuario.id} className="mt-3 rounded-2xl border border-[#E3EAF8] bg-white p-4 shadow-md">
                        <View className="flex-row items-center justify-between">
                            <View>
                                <View className="flex-1">
                                    <Text className="text-lg font-bold text-[#0F1B33]">{usuario.name}</Text>
                                    <Text className="text-sm text-[#4A5878]">{usuario.correo}</Text>
                                </View>
                            </View>
                        </View>

                        <View className="mt-3 flex-row gap-2">
                            {["admin", "supervisor", "promotor"].map((r) => (
                                <Pressable
                                    key={r}
                                    onPress={() => cambio(usuario, r)}
                                    className={`flex-1 items-center rounded-lg border py-1.5 ${usuario.rol === r ? "border-[#13285C] bg-[#13285C]" : "border-[#DCE3F0] bg-white"}`}
                                >
                                    <Text className={`text-xs font-semibold capitalize ${usuario.rol === r ? "text-white" : "text-[#4A5878]"}`}>{r}</Text>
                                </Pressable>
                            ))}
                        </View>

                        <Pressable onPress={() => eliminar(usuario)} className="mt-3 items-center rounded-lg bg-[#FDECEC] py-2">
                            <Text className="font-semibold text-[#C4202F]">Eliminar</Text>
                        </Pressable>
                    </View>
                ))}
            </View>

        </ScrollView>

    )
};
