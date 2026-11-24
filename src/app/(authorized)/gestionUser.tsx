
import { ScrollView, Text, View, Pressable, Alert, Platform, TextInput } from "react-native";
import { useEffect, useState } from "react";

import { useAuthSession } from "../../providers/AuthProvider";
import { API_URL } from "@/config/api";



const ZONAS = ["norte", "centro", "sur"];

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
    const [tiendas, setTiendas] = useState<any[]>([]);
    const [asignaciones, setAsignaciones] = useState<any[]>([]);

    const { token, correo: miCorreo } = useAuthSession();

    useEffect(() => {
        if (!token) return;

        fetch(`${API_URL}/usuarios`, { headers: { Authorization: token } })
            .then((res) => res.json())
            .then((lista) => setUsuarios(lista))
            .catch(() => { });

        fetch(`${API_URL}/api/tiendas`, { headers: { Authorization: token } })
            .then((res) => res.json())
            .then((lista) => setTiendas(lista))
            .catch(() => { });

        fetch(`${API_URL}/api/asignaciones`, { headers: { Authorization: token } })
            .then((res) => res.json())
            .then((lista) => setAsignaciones(lista))
            .catch(() => { });
    }, [token]);

    const asignar = (usuario: any, tienda: any) => {
        if (!token) return;
        const actual = asignaciones.find(
            (a) => a.correoPromotor === usuario.correo && a.tienda.idTienda === tienda.idTienda
        );

        if (actual) {
            fetch(`${API_URL}/api/asignaciones/${actual.idAsignacionTienda}`, {
                method: "DELETE",
                headers: { Authorization: token },
            })
                .then((res) => {
                    if (res.ok) setAsignaciones(asignaciones.filter((a) => a.idAsignacionTienda !== actual.idAsignacionTienda));
                })
                .catch(() => aviso("No se pudo quitar la tienda"));
            return;
        }

        fetch(`${API_URL}/api/asignaciones`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: token },
            body: JSON.stringify({ correoPromotor: usuario.correo, idTienda: tienda.idTienda }),
        })
            .then((res) => {
                if (!res.ok) throw new Error();
                return res.json();
            })
            .then((nueva) => setAsignaciones([...asignaciones, nueva]))
            .catch(() => aviso("No se pudo asignar la tienda"));
    };

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
        if (usuario.correo === miCorreo) {
            aviso("No puedes cambiar tu propio rol");
            return;
        }
        const mensaje = `¿Cambiar el rol de ${usuario.name} de ${usuario.rol} a ${nuevorol}?`;

        if (Platform.OS === "web") {
            if (window.confirm(mensaje)) cambioRol(usuario, nuevorol);
            return;
        }

        Alert.alert("Cambiar rol", mensaje, [
            { text: "Cancelar", style: "cancel" },
            { text: "Cambiar", onPress: () => cambioRol(usuario, nuevorol) }
        ]);
    };

    const cambiarZona = (usuario: any, zona: string) => {
        if (!token) return;
        fetch(`${API_URL}/usuarios/${usuario.id}/zona`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: token },
            body: JSON.stringify({ zona }),
        })
            .then((res) => {
                if (!res.ok) throw new Error();
                return res.json();
            })
            .then((actualizado) => {
                setUsuarios((prev) => prev.map((u) => (u.id === actualizado.id ? actualizado : u)));
            })
            .catch(() => aviso("No se pudo cambiar la zona"));
    };

    const cambioRol = (usuario: any, nuevorol: string) => {
        if (!token) return;
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
                                    <Text className="text-lg font-bold text-[#0F1B33]">{usuario.name}{usuario.correo === miCorreo ? " (tú)" : ""}</Text>
                                    <Text className="text-sm text-[#4A5878]">{usuario.correo}</Text>
                                </View>
                            </View>
                        </View>

                        <View className="mt-3 flex-row gap-2">
                            {["admin", "supervisor", "promotor"].map((r) => (
                                <Pressable
                                    key={r}
                                    onPress={() => cambio(usuario, r)}
                                    disabled={usuario.correo === miCorreo}
                                    className={`flex-1 items-center rounded-lg border py-1.5 ${usuario.correo === miCorreo ? "opacity-50" : ""} ${usuario.rol === r ? "border-[#13285C] bg-[#13285C]" : "border-[#DCE3F0] bg-white"}`}
                                >
                                    <Text className={`text-xs font-semibold capitalize ${usuario.rol === r ? "text-white" : "text-[#4A5878]"}`}>{r}</Text>
                                </Pressable>
                            ))}
                        </View>

                        {(usuario.rol === "supervisor" || usuario.rol === "promotor") && (
                            <View className="mt-3">
                                <View className="flex-row items-center justify-between">
                                    <Text className="text-sm font-semibold text-[#0F1B33]">Zona</Text>
                                    {usuario.rol === "supervisor" && usuario.zona && (
                                        <Text className="text-xs text-[#4A5878]">
                                            Equipo: {usuarios.filter((u) => u.rol === "promotor" && u.zona === usuario.zona).length} promotores
                                        </Text>
                                    )}
                                </View>
                                <View className="mt-2 flex-row gap-2">
                                    {ZONAS.map((z) => {
                                        const activa = usuario.zona === z;
                                        return (
                                            <Pressable
                                                key={z}
                                                onPress={() => cambiarZona(usuario, activa ? "" : z)}
                                                accessibilityRole="radio"
                                                accessibilityState={{ selected: activa }}
                                                className={`flex-1 items-center rounded-lg border py-1.5 ${activa ? "border-[#2F5BB7] bg-[#2F5BB7]" : "border-[#DCE3F0] bg-white"}`}
                                            >
                                                <Text className={`text-xs font-semibold capitalize ${activa ? "text-white" : "text-[#4A5878]"}`}>{z}</Text>
                                            </Pressable>
                                        );
                                    })}
                                </View>
                                {!usuario.zona && (
                                    <Text className="mt-1 text-xs text-[#B45309]">
                                        {usuario.rol === "supervisor" ? "Sin zona: ve a todos los promotores" : "Sin zona: no pertenece a ningún equipo"}
                                    </Text>
                                )}
                            </View>
                        )}

                        {usuario.rol === "promotor" && (
                            <View className="mt-3">
                                <Text className="text-sm font-semibold text-[#0F1B33]">Tiendas asignadas</Text>
                                {tiendas.length === 0 ? (
                                    <Text className="mt-1 text-xs text-[#4A5878]">No hay tiendas registradas</Text>
                                ) : (
                                    <View className="mt-2 flex-row flex-wrap gap-2">
                                        {tiendas.map((t) => {
                                            const tiene = asignaciones.some(
                                                (a) => a.correoPromotor === usuario.correo && a.tienda.idTienda === t.idTienda
                                            );
                                            return (
                                                <Pressable
                                                    key={t.idTienda}
                                                    onPress={() => asignar(usuario, t)}
                                                    className={`rounded-full border px-3 py-1.5 ${tiene ? "border-[#13285C] bg-[#13285C]" : "border-[#DCE3F0] bg-white"}`}
                                                >
                                                    <Text className={`text-xs font-semibold ${tiene ? "text-white" : "text-[#4A5878]"}`}>
                                                        {t.nombre}{t.ubicacion ? ` · ${t.ubicacion}` : ""}
                                                    </Text>
                                                </Pressable>
                                            );
                                        })}
                                    </View>
                                )}
                            </View>
                        )}

                        {usuario.correo !== miCorreo && (
                            <Pressable onPress={() => eliminar(usuario)} className="mt-3 items-center rounded-lg bg-[#FDECEC] py-2">
                                <Text className="font-semibold text-[#C4202F]">Eliminar</Text>
                            </Pressable>
                        )}
                    </View>
                ))}
            </View>

        </ScrollView>

    )
};
