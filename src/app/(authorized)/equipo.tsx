import {
  esHoy,
  fechaLarga,
  hora,
  iniciales,
  leerCierres,
  leerProblemas,
  leerPromotores,
  Promotor,
  ReporteCierre,
  ReporteProblema,
  urlFoto,
  urlMapa,
} from "@/lib/reportes";
import { useAuthSession } from "@/providers/AuthProvider";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const sombraTarjeta = { boxShadow: "0 4px 12px rgba(10, 85, 104, 0.08)" };

type Pestana = "hoy" | "archivo";
type Carpeta = "cierres" | "problemas";

export default function Equipo() {
  const insets = useSafeAreaInsets();
  const { token } = useAuthSession();

  const [promotores, setPromotores] = useState<Promotor[]>([]);
  const [cierres, setCierres] = useState<ReporteCierre[]>([]);
  const [problemas, setProblemas] = useState<ReporteProblema[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  const [pestana, setPestana] = useState<Pestana>("hoy");
  const [abierto, setAbierto] = useState<string | null>(null);
  const [carpeta, setCarpeta] = useState<Carpeta>("cierres");
  const [fotoGrande, setFotoGrande] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!token) return;
    setError(false);
    try {
      const [p, c, pr] = await Promise.all([leerPromotores(token), leerCierres(token), leerProblemas(token)]);
      const delEquipo = new Set(p.map((x) => x.correo));
      setPromotores(p);
      setCierres(c.filter((r) => delEquipo.has(r.correoPromotor)));
      setProblemas(pr.filter((r) => delEquipo.has(r.correoPromotor)));
    } catch {
      setError(true);
    } finally {
      setCargando(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  const nombreDe = (correo: string) => promotores.find((p) => p.correo === correo)?.name ?? correo;

  const cierresHoy = cierres.filter((c) => esHoy(c.fecha));
  const problemasHoy = problemas.filter((p) => esHoy(p.fecha));
  const sinCerrar = promotores.filter((p) => !cierresHoy.some((c) => c.correoPromotor === p.correo));

  return (
    <View className="flex-1 bg-[#EEF6F7]">
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        refreshControl={<RefreshControl refreshing={false} onRefresh={cargar} />}
      >
        {/* Header */}
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
              <Text className="text-2xl font-bold text-white">Reportes del equipo</Text>
              <Text className="text-sm text-[#D4F5F4]">Reportes que envían tus promotores</Text>
            </View>
          </View>

          {/* Resumen de hoy */}
          <View className="mt-5 flex-row gap-3">
            <Resumen numero={cierresHoy.length} texto="Cierres hoy" />
            <Resumen numero={problemasHoy.length} texto="Problemas hoy" />
            <Resumen numero={sinCerrar.length} texto="Sin cerrar" />
          </View>
        </LinearGradient>

        <View className="-mt-6 gap-4 px-5">
          {/* Pestañas */}
          <View className="flex-row gap-2 rounded-2xl border border-[#DCEBEE] bg-white p-1.5" style={sombraTarjeta}>
            {(
              [
                { id: "hoy", texto: "Fin de día" },
                { id: "archivo", texto: "Archivo por promotor" },
              ] as const
            ).map((p) => {
              const activo = pestana === p.id;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => setPestana(p.id)}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: activo }}
                  className={`flex-1 items-center rounded-xl px-1 py-2.5 ${activo ? "bg-[#0A6D7D]" : ""}`}
                >
                  <Text className={`text-[13px] font-bold ${activo ? "text-white" : "text-[#3B5760]"}`} numberOfLines={1}>
                    {p.texto}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {cargando ? (
            <ActivityIndicator color="#0A6D7D" style={{ marginTop: 32 }} />
          ) : error ? (
            <Vacio icono="wifi-off" titulo="No se pudieron cargar los reportes" texto="Revisa tu conexión y desliza hacia abajo para reintentar" />
          ) : pestana === "hoy" ? (
            <>
              {problemasHoy.length > 0 && (
                <>
                  <Titulo texto={`Problemas reportados (${problemasHoy.length})`} />
                  {problemasHoy.map((p) => (
                    <TarjetaProblema key={p.idProblemas} reporte={p} nombre={nombreDe(p.correoPromotor)} soloHora onFoto={setFotoGrande} />
                  ))}
                </>
              )}

              <Titulo texto={`Cierres de hoy (${cierresHoy.length})`} />
              {cierresHoy.length === 0 ? (
                <Vacio icono="moon" titulo="Aún nadie cierra el día" texto="Aquí salen solo los reportes de hoy. Los de días anteriores están en «Archivo por promotor»" />
              ) : (
                cierresHoy.map((c) => (
                  <TarjetaCierre key={c.idReporte} reporte={c} nombre={nombreDe(c.correoPromotor)} soloHora onFoto={setFotoGrande} />
                ))
              )}

              {sinCerrar.length > 0 && (
                <View className="rounded-2xl border border-[#F4D9A8] bg-[#FFF8EB] p-4">
                  <Text className="text-sm font-bold text-[#9A5300]">Faltan por cerrar ({sinCerrar.length})</Text>
                  <Text className="mt-1 text-sm text-[#7A5A2A]">{sinCerrar.map((p) => p.name).join(", ")}</Text>
                </View>
              )}
            </>
          ) : promotores.length === 0 ? (
            <Vacio icono="users" titulo="No hay promotores" texto="Crea promotores desde el panel de admin" />
          ) : (
            promotores.map((p) => {
              const susCierres = cierres.filter((c) => c.correoPromotor === p.correo);
              const susProblemas = problemas.filter((x) => x.correoPromotor === p.correo);
              const estaAbierto = abierto === p.correo;
              return (
                <View key={p.id} className="rounded-2xl border border-[#DCEBEE] bg-white" style={sombraTarjeta}>
                  <Pressable
                    onPress={() => {
                      setAbierto(estaAbierto ? null : p.correo);
                      setCarpeta("cierres");
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ expanded: estaAbierto }}
                    className="flex-row items-center gap-3 p-4"
                  >
                    <Avatar nombre={p.name} />
                    <View className="flex-1">
                      <Text className="text-base font-bold text-[#0B2A33]">{p.name}</Text>
                      <Text className="text-[13px] text-[#5C7A82]">
                        {susCierres.length} cierres · {susProblemas.length} problemas
                      </Text>
                    </View>
                    <Feather name={estaAbierto ? "chevron-up" : "chevron-down"} size={22} color="#5C7A82" />
                  </Pressable>

                  {estaAbierto && (
                    <View className="gap-3 border-t border-[#EEF3F4] p-4">
                      <View className="flex-row gap-2">
                        <ChipCarpeta
                          activo={carpeta === "cierres"}
                          icono="moon"
                          texto={`Cierres (${susCierres.length})`}
                          onPress={() => setCarpeta("cierres")}
                        />
                        <ChipCarpeta
                          activo={carpeta === "problemas"}
                          icono="alert-triangle"
                          texto={`Problemas (${susProblemas.length})`}
                          onPress={() => setCarpeta("problemas")}
                        />
                      </View>

                      {carpeta === "cierres" ? (
                        susCierres.length === 0 ? (
                          <Text className="py-2 text-center text-sm text-[#5C7A82]">Sin reportes de cierre</Text>
                        ) : (
                          susCierres.map((c) => <TarjetaCierre key={c.idReporte} reporte={c} plana onFoto={setFotoGrande} />)
                        )
                      ) : susProblemas.length === 0 ? (
                        <Text className="py-2 text-center text-sm text-[#5C7A82]">Sin problemas reportados</Text>
                      ) : (
                        susProblemas.map((x) => <TarjetaProblema key={x.idProblemas} reporte={x} plana onFoto={setFotoGrande} />)
                      )}
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Foto en grande */}
      <Modal visible={!!fotoGrande} transparent animationType="fade" onRequestClose={() => setFotoGrande(null)}>
        <Pressable
          onPress={() => setFotoGrande(null)}
          accessibilityLabel="Cerrar foto"
          className="flex-1 items-center justify-center bg-[#000000E6] p-4"
        >
          {fotoGrande && <Image source={{ uri: fotoGrande }} style={{ width: "100%", height: "80%" }} resizeMode="contain" />}
          <Text className="mt-4 text-sm text-white">Toca para cerrar</Text>
        </Pressable>
      </Modal>
    </View>
  );
}

function Resumen({ numero, texto }: { numero: number; texto: string }) {
  return (
    <View className="flex-1 rounded-2xl border border-[#FFFFFF40] bg-[#FFFFFF26] px-3 py-2.5">
      <Text className="text-2xl font-bold text-white">{numero}</Text>
      <Text className="text-xs text-[#D4F5F4]" numberOfLines={1}>
        {texto}
      </Text>
    </View>
  );
}

function Titulo({ texto }: { texto: string }) {
  return <Text className="mt-1 text-base font-bold text-[#0B2A33]">{texto}</Text>;
}

function Avatar({ nombre }: { nombre: string }) {
  return (
    <View className="h-11 w-11 items-center justify-center rounded-full bg-[#E3F5F5]">
      <Text className="text-sm font-bold text-[#0A6D7D]">{iniciales(nombre)}</Text>
    </View>
  );
}

function ChipCarpeta({
  activo,
  icono,
  texto,
  onPress,
}: {
  activo: boolean;
  icono: keyof typeof Feather.glyphMap;
  texto: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: activo }}
      className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-xl border py-2 ${
        activo ? "border-[#0A6D7D] bg-[#0A6D7D]" : "border-[#DCEBEE] bg-white"
      }`}
    >
      <Feather name={icono} size={14} color={activo ? "white" : "#3B5760"} />
      <Text className={`text-[13px] font-bold ${activo ? "text-white" : "text-[#3B5760]"}`}>{texto}</Text>
    </Pressable>
  );
}

type PropsTarjeta<T> = { reporte: T; nombre?: string; soloHora?: boolean; plana?: boolean; onFoto: (uri: string) => void };

function TarjetaCierre({ reporte, nombre, soloHora, plana, onFoto }: PropsTarjeta<ReporteCierre>) {
  return (
    <View
      className={`flex-row gap-3 rounded-2xl border p-3 ${plana ? "border-[#EEF3F4] bg-[#F7FBFB]" : "border-[#DCEBEE] bg-white"}`}
      style={plana ? undefined : sombraTarjeta}
    >
      <Foto uri={urlFoto(reporte.fotoURL)} onFoto={onFoto} />
      <View className="flex-1">
        {nombre && <Text className="text-[15px] font-bold text-[#0B2A33]">{nombre}</Text>}
        <View className="flex-row items-center gap-1.5">
          <Feather name="clock" size={12} color="#5C7A82" />
          <Text className="text-[13px] text-[#5C7A82]">{soloHora ? hora(reporte.fecha) : fechaLarga(reporte.fecha)}</Text>
        </View>
        <Text className="mt-1 text-sm text-[#3B5760]" numberOfLines={4}>
          {reporte.comentario?.trim() || "Sin comentario"}
        </Text>
        <Pressable
          onPress={() => Linking.openURL(urlMapa(reporte.latitud, reporte.longitud))}
          accessibilityRole="link"
          className="mt-2 flex-row items-center gap-1 self-start"
          hitSlop={8}
        >
          <Feather name="map-pin" size={13} color="#0A6D7D" />
          <Text className="text-[13px] font-bold text-[#0A6D7D]">
            Ver ubicación{reporte.precisionMT ? ` (±${reporte.precisionMT} m)` : ""}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function TarjetaProblema({ reporte, nombre, soloHora, plana, onFoto }: PropsTarjeta<ReporteProblema>) {
  return (
    <View
      className={`flex-row gap-3 rounded-2xl border p-3 ${plana ? "border-[#F7D6D9] bg-[#FFF7F7]" : "border-[#F7D6D9] bg-white"}`}
      style={plana ? undefined : sombraTarjeta}
    >
      <Foto uri={urlFoto(reporte.fotoURL)} onFoto={onFoto} />
      <View className="flex-1">
        <View className="flex-row items-center gap-2">
          {nombre && (
            <Text className="flex-shrink text-[15px] font-bold text-[#0B2A33]" numberOfLines={1}>
              {nombre}
            </Text>
          )}
          <View className="rounded-full bg-[#FDECEC] px-2 py-0.5">
            <Text className="text-[11px] font-bold text-[#C4202F]">Problema</Text>
          </View>
        </View>
        <View className="flex-row items-center gap-1.5">
          <Feather name="clock" size={12} color="#5C7A82" />
          <Text className="text-[13px] text-[#5C7A82]">{soloHora ? hora(reporte.fecha) : fechaLarga(reporte.fecha)}</Text>
        </View>
        <Text className="mt-1 text-sm text-[#3B5760]">{reporte.comentario}</Text>
      </View>
    </View>
  );
}

function Foto({ uri, onFoto }: { uri: string; onFoto: (uri: string) => void }) {
  return (
    <Pressable onPress={() => onFoto(uri)} accessibilityRole="imagebutton" accessibilityLabel="Ver foto en grande">
      <Image source={{ uri }} style={{ width: 84, height: 84, borderRadius: 14, backgroundColor: "#E3EEF0" }} />
    </Pressable>
  );
}

function Vacio({ icono, titulo, texto }: { icono: keyof typeof Feather.glyphMap; titulo: string; texto: string }) {
  return (
    <View className="items-center rounded-2xl border border-[#DCEBEE] bg-white px-6 py-8" style={sombraTarjeta}>
      <Feather name={icono} size={28} color="#5C7A82" />
      <Text className="mt-3 text-center text-base font-bold text-[#0B2A33]">{titulo}</Text>
      <Text className="mt-1 text-center text-sm text-[#5C7A82]">{texto}</Text>
    </View>
  );
}
