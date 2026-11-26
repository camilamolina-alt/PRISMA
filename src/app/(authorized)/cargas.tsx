import {
  aFecha,
  aIso,
  avisarPromotores,
  cambiarEstado,
  Envio,
  EnvioDetalle,
  EstadoEnvio,
  estadoVisible,
  estiloEstado,
  fechaBonita,
  fraseLlegada,
  leerDetalle,
  leerEnvios,
  leerEnviosMiZona,
  leerMisEnvios,
} from "@/lib/envios";
import { useAuthSession } from "@/providers/AuthProvider";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const sombraTarjeta = { boxShadow: "0 4px 12px rgba(10, 85, 104, 0.08)" };

type Filtro = "activos" | "problemas" | "entregados";

const filtros: { id: Filtro; texto: string }[] = [
  { id: "activos", texto: "En camino" },
  { id: "problemas", texto: "Problemas" },
  { id: "entregados", texto: "Entregados" },
];

const ZONAS = ["todas", "norte", "centro", "sur"];

const temas = {
  admin: {
    degradado: ["#0B1B3F", "#13285C", "#1E3A8A", "#2F5BB7"] as const,
    acento: "#1E3A8A",
    subtitulo: "#C9D6F2",
  },
  normal: {
    degradado: ["#0A5568", "#0B7C8E", "#0EA5B0", "#3BCBC3"] as const,
    acento: "#0A6D7D",
    subtitulo: "#D4F5F4",
  },
};

function pasaFiltro(envio: Envio, filtro: Filtro) {
  const estado = estadoVisible(envio);
  if (filtro === "entregados") return estado === "ENTREGADO";
  if (filtro === "problemas") return estado === "POSIBLE_ATRASO" || estado === "NO_LLEGARA";
  return estado !== "ENTREGADO";
}

export default function Cargas() {
  const insets = useSafeAreaInsets();
  const { token, rol } = useAuthSession();
  const esAdmin = rol === "admin";
  const esSupervisor = rol === "supervisor";
  const tema = esAdmin ? temas.admin : temas.normal;

  const [envios, setEnvios] = useState<Envio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [filtro, setFiltro] = useState<Filtro>("activos");
  const [zona, setZona] = useState("todas");
  const [editando, setEditando] = useState<Envio | null>(null);

  const cargar = useCallback(async () => {
    if (!token) return;
    setError(false);
    try {
      if (esAdmin) setEnvios(await leerEnvios(token, zona === "todas" ? undefined : zona));
      else if (esSupervisor) setEnvios(await leerEnviosMiZona(token));
      else setEnvios(await leerMisEnvios(token));
    } catch {
      setError(true);
    } finally {
      setCargando(false);
    }
  }, [token, esAdmin, esSupervisor, zona]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  const visibles = envios.filter((e) => pasaFiltro(e, filtro));
  const cuenta = (f: Filtro) => envios.filter((e) => pasaFiltro(e, f)).length;

  return (
    <View className="flex-1 bg-[#EEF6F7]">
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        refreshControl={<RefreshControl refreshing={false} onRefresh={cargar} />}
      >
        {/* Header */}
        <LinearGradient
          colors={tema.degradado}
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
              <Text className="text-2xl font-bold text-white">Seguimiento de carga</Text>
              <Text className="text-sm" style={{ color: tema.subtitulo }}>
                {esAdmin
                  ? "Todos los envíos desde bodega"
                  : esSupervisor
                    ? "Envíos a las tiendas de tu zona"
                    : "Mercadería en camino a tus tiendas"}
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View className="-mt-6 gap-4 px-5">
          {esAdmin && (
            <View className="flex-row gap-2 rounded-2xl border border-[#DCEBEE] bg-white p-1.5" style={sombraTarjeta}>
              {ZONAS.map((z) => {
                const activa = zona === z;
                return (
                  <Pressable
                    key={z}
                    onPress={() => setZona(z)}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: activa }}
                    className="flex-1 items-center rounded-xl px-1 py-2.5"
                    style={activa ? { backgroundColor: tema.acento } : undefined}
                  >
                    <Text className={`text-[13px] font-bold capitalize ${activa ? "text-white" : "text-[#3B5760]"}`}>{z}</Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* Filtros */}
          <View className="flex-row gap-2 rounded-2xl border border-[#DCEBEE] bg-white p-1.5" style={sombraTarjeta}>
            {filtros.map((f) => {
              const activo = filtro === f.id;
              return (
                <Pressable
                  key={f.id}
                  onPress={() => setFiltro(f.id)}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: activo }}
                  className="flex-1 items-center rounded-xl px-1 py-2.5"
                  style={activo ? { backgroundColor: tema.acento } : undefined}
                >
                  <Text className={`text-[13px] font-bold ${activo ? "text-white" : "text-[#3B5760]"}`} numberOfLines={1}>
                    {f.texto} ({cuenta(f.id)})
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {esAdmin && (
            <Pressable
              onPress={() => router.push("/planillas")}
              accessibilityRole="button"
              className="flex-row items-center gap-2 self-start"
              hitSlop={8}
            >
              <Feather name="upload-cloud" size={16} color={tema.acento} />
              <Text className="text-sm font-bold" style={{ color: tema.acento }}>Subir planilla de envíos</Text>
            </Pressable>
          )}

          {cargando ? (
            <ActivityIndicator color={tema.acento} style={{ marginTop: 32 }} />
          ) : error ? (
            <Vacio icono="wifi-off" titulo="No se pudieron cargar los envíos" texto="Revisa tu conexión y desliza hacia abajo para reintentar" />
          ) : visibles.length === 0 ? (
            <Vacio
              icono="truck"
              titulo={envios.length === 0 ? "Aún no hay envíos" : "Nada por aquí"}
              texto={
                envios.length === 0
                  ? esAdmin
                    ? "Sube la planilla de envíos para ver los camiones"
                    : esSupervisor
                      ? "Cuando bodega mande camiones a tu zona, aparecerán aquí"
                      : "Cuando bodega mande mercadería a tus tiendas, aparecerá aquí"
                  : "No hay envíos con este filtro"
              }
            />
          ) : (
            visibles.map((envio) => (
              <TarjetaEnvio
                key={envio.idEnvio}
                envio={envio}
                esAdmin={esAdmin}
                esSupervisor={esSupervisor}
                onCambiar={() => setEditando(envio)}
                onActualizado={(nuevo) => setEnvios((prev) => prev.map((e) => (e.idEnvio === nuevo.idEnvio ? nuevo : e)))}
              />
            ))
          )}
        </View>
      </ScrollView>

      {editando && (
        <ModalEstado
          envio={editando}
          onCerrar={() => setEditando(null)}
          onGuardado={(nuevo) => {
            setEnvios((prev) => prev.map((e) => (e.idEnvio === nuevo.idEnvio ? nuevo : e)));
            setEditando(null);
          }}
        />
      )}
    </View>
  );
}

function Vacio({ icono, titulo, texto }: { icono: "truck" | "wifi-off"; titulo: string; texto: string }) {
  return (
    <View className="items-center gap-2 rounded-2xl border border-dashed border-[#B9CFD4] bg-[#F6FBFB] px-4 py-8">
      <View className="h-12 w-12 items-center justify-center rounded-2xl bg-[#E2ECEE]">
        <Feather name={icono} size={22} color="#6E8C94" />
      </View>
      <Text className="text-[15px] font-bold text-[#3B5760]">{titulo}</Text>
      <Text className="text-center text-sm text-[#6E8C94]">{texto}</Text>
    </View>
  );
}

function TarjetaEnvio({
  envio,
  esAdmin,
  esSupervisor,
  onCambiar,
  onActualizado,
}: {
  envio: Envio;
  esAdmin: boolean;
  esSupervisor: boolean;
  onCambiar: () => void;
  onActualizado: (nuevo: Envio) => void;
}) {
  const { token } = useAuthSession();
  const estado = estadoVisible(envio);
  const estilo = estiloEstado[estado];
  const automatico = estado !== envio.estado;

  const [abierto, setAbierto] = useState(false);
  const [detalle, setDetalle] = useState<EnvioDetalle[] | null>(null);
  const [avisando, setAvisando] = useState(false);

  const avisar = async () => {
    if (!token) return;
    setAvisando(true);
    try {
      onActualizado(await avisarPromotores(envio.idEnvio, token));
    } catch {
      if (Platform.OS === "web") window.alert("No se pudo avisar a los promotores");
      else Alert.alert("Atención", "No se pudo avisar a los promotores");
    } finally {
      setAvisando(false);
    }
  };

  const verProductos = async () => {
    setAbierto((a) => !a);
    if (detalle || !token) return;
    try {
      setDetalle(await leerDetalle(envio.idEnvio, token));
    } catch {
      setDetalle([]);
    }
  };

  const totalUnidades = detalle?.reduce((s, d) => s + d.cantidad, 0) ?? 0;

  return (
    <View className="gap-3 rounded-3xl border border-[#DCEBEE] bg-white p-4" style={sombraTarjeta}>
      <View className="flex-row items-start gap-3">
        <View className="h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: estilo.fondo }}>
          <MaterialCommunityIcons name={estilo.icono as any} size={24} color={estilo.color} />
        </View>
        <View className="flex-1">
          <Text className="text-base font-bold text-[#10262E]" numberOfLines={1}>
            {envio.tienda.nombre}
          </Text>
          <Text className="text-sm text-[#3B5760]" numberOfLines={1}>
            {envio.tienda.ubicacion}
          </Text>
        </View>
        <View className="rounded-full px-2.5 py-1" style={{ backgroundColor: estilo.fondo }}>
          <Text className="text-xs font-bold" style={{ color: estilo.color }}>
            {estilo.texto}
          </Text>
        </View>
      </View>

      <View className="gap-0.5">
        <Text className="text-lg font-extrabold text-[#10262E]">{fraseLlegada(envio)}</Text>
        <Text className="text-sm text-[#6E8C94]">Salió de bodega el {fechaBonita(envio.fechaEnvio)}</Text>
      </View>

      {(envio.motivo || automatico) && (
        <View className="flex-row items-start gap-2 rounded-xl px-3 py-2.5" style={{ backgroundColor: estilo.fondo }}>
          <Feather name="info" size={16} color={estilo.color} style={{ marginTop: 2 }} />
          <Text className="flex-1 text-sm" style={{ color: estilo.color }}>
            {envio.motivo || "Ya pasó la fecha aprox. y aún no se confirma la llegada"}
          </Text>
        </View>
      )}

      <Pressable
        onPress={verProductos}
        accessibilityRole="button"
        accessibilityState={{ expanded: abierto }}
        className="flex-row items-center justify-between border-t border-[#E3EEF0] pt-3"
      >
        <Text className="text-sm font-bold text-[#0A6D7D]">
          {abierto ? "Ocultar productos" : "Ver productos"}
          {detalle && detalle.length > 0 ? ` · ${detalle.length} SKU, ${totalUnidades} un.` : ""}
        </Text>
        <Feather name={abierto ? "chevron-up" : "chevron-down"} size={18} color="#0A6D7D" />
      </Pressable>

      {abierto && (
        <View className="gap-2">
          {detalle === null ? (
            <ActivityIndicator color="#0A6D7D" />
          ) : detalle.length === 0 ? (
            <Text className="text-sm text-[#6E8C94]">Sin productos registrados</Text>
          ) : (
            detalle.map((d) => (
              <View key={d.idDetalle} className="flex-row items-center gap-3">
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-[#10262E]" numberOfLines={1}>
                    {d.producto.nombre}
                  </Text>
                  <Text className="text-xs text-[#6E8C94]">SKU {d.producto.sku}</Text>
                </View>
                <Text className="text-sm font-bold text-[#0A5568]">{d.cantidad} un.</Text>
              </View>
            ))
          )}
        </View>
      )}

      {(esAdmin || esSupervisor) && (
        <View className="flex-row items-center gap-1.5">
          <Feather name={envio.avisado ? "check-circle" : "bell-off"} size={14} color={envio.avisado ? "#15803D" : "#B45309"} />
          <Text className="text-xs font-semibold" style={{ color: envio.avisado ? "#15803D" : "#B45309" }}>
            {envio.avisado ? "Promotores avisados" : "Sin avisar a los promotores"}
          </Text>
        </View>
      )}

      {esSupervisor && !envio.avisado && (
        <Pressable
          onPress={avisar}
          disabled={avisando}
          accessibilityRole="button"
          className="h-12 flex-row items-center justify-center gap-2 rounded-full bg-[#0A6D7D]"
          style={{ opacity: avisando ? 0.6 : 1 }}
        >
          {avisando ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Feather name="send" size={16} color="white" />
              <Text className="text-[15px] font-bold text-white">Avisar a mis promotores</Text>
            </>
          )}
        </Pressable>
      )}

      {esAdmin && envio.estado !== "ENTREGADO" && (
        <Pressable
          onPress={onCambiar}
          accessibilityRole="button"
          className="h-12 items-center justify-center rounded-full border border-[#C9D6F2] bg-[#E8EEFA]"
        >
          <Text className="text-[15px] font-bold text-[#13285C]">Actualizar estado</Text>
        </Pressable>
      )}
    </View>
  );
}

const opcionesEstado: EstadoEnvio[] = ["EN_CAMINO", "POSIBLE_ATRASO", "NO_LLEGARA", "ENTREGADO"];

function ModalEstado({
  envio,
  onCerrar,
  onGuardado,
}: {
  envio: Envio;
  onCerrar: () => void;
  onGuardado: (nuevo: Envio) => void;
}) {
  const { token } = useAuthSession();
  const insets = useSafeAreaInsets();
  const [estado, setEstado] = useState<EstadoEnvio>(envio.estado);
  const [motivo, setMotivo] = useState(envio.motivo ?? "");
  const [diasExtra, setDiasExtra] = useState(0);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pideMotivo = estado === "POSIBLE_ATRASO" || estado === "NO_LLEGARA";

  const nuevaFecha = () => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const aprox = aFecha(envio.aproxLlegada);
    const f = aprox < hoy ? hoy : aprox;
    f.setDate(f.getDate() + diasExtra);
    return aIso(f);
  };

  const guardar = async () => {
    if (!token) return;
    if (pideMotivo && motivo.trim() === "") {
      setError("Escribe el motivo para avisarle al promotor");
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      const nuevo = await cambiarEstado(
        envio.idEnvio,
        {
          estado,
          motivo: pideMotivo ? motivo.trim() : null,
          nuevaLlegada: estado === "POSIBLE_ATRASO" && diasExtra > 0 ? nuevaFecha() : null,
        },
        token
      );
      onGuardado(nuevo);
    } catch {
      setError("No se pudo guardar. Intenta de nuevo");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal transparent animationType="slide" onRequestClose={onCerrar}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1 justify-end bg-[#0A1F2699]">
        <Pressable className="flex-1" onPress={onCerrar} accessibilityLabel="Cerrar" />
        <View className="gap-4 rounded-t-3xl bg-white px-5 pt-5" style={{ paddingBottom: insets.bottom + 20 }}>
          <View>
            <Text className="text-xl font-bold text-[#10262E]">Actualizar envío</Text>
            <Text className="text-sm text-[#3B5760]">
              {envio.tienda.nombre} · {envio.tienda.ubicacion} · aprox. {fechaBonita(envio.aproxLlegada)}
            </Text>
          </View>

          <View className="gap-2">
            {opcionesEstado.map((op) => {
              const e = estiloEstado[op];
              const activo = estado === op;
              return (
                <Pressable
                  key={op}
                  onPress={() => setEstado(op)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: activo }}
                  className="flex-row items-center gap-3 rounded-2xl border-2 px-3 py-3"
                  style={{ borderColor: activo ? e.color : "#E3EEF0", backgroundColor: activo ? e.fondo : "white" }}
                >
                  <MaterialCommunityIcons name={e.icono as any} size={22} color={e.color} />
                  <Text className="flex-1 text-[15px] font-bold" style={{ color: activo ? e.color : "#10262E" }}>
                    {e.texto}
                  </Text>
                  {activo && <Feather name="check" size={18} color={e.color} />}
                </Pressable>
              );
            })}
          </View>

          {pideMotivo && (
            <View className="gap-1.5">
              <Text className="text-sm font-bold text-[#10262E]">Motivo</Text>
              <TextInput
                value={motivo}
                onChangeText={setMotivo}
                placeholder={estado === "NO_LLEGARA" ? "Ej: camión con falla, se reprograma" : "Ej: retraso en ruta por tráfico"}
                placeholderTextColor="#8AA3A9"
                multiline
                className="min-h-[72px] rounded-2xl border border-[#DCEBEE] bg-[#F6FBFB] px-3 py-2.5 text-[15px] text-[#10262E]"
                style={{ textAlignVertical: "top" }}
              />
            </View>
          )}

          {estado === "POSIBLE_ATRASO" && (
            <View className="gap-1.5">
              <Text className="text-sm font-bold text-[#10262E]">¿Cambia la fecha aprox.?</Text>
              <View className="flex-row flex-wrap gap-2">
                {[0, 1, 2, 3, 5].map((d) => {
                  const activo = diasExtra === d;
                  return (
                    <Pressable
                      key={d}
                      onPress={() => setDiasExtra(d)}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: activo }}
                      className={`rounded-full border px-3.5 py-2 ${activo ? "border-[#0A6D7D] bg-[#0A6D7D]" : "border-[#DCEBEE] bg-white"}`}
                    >
                      <Text className={`text-sm font-bold ${activo ? "text-white" : "text-[#3B5760]"}`}>
                        {d === 0 ? "No sé aún" : `+${d} ${d === 1 ? "día" : "días"}`}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              {diasExtra > 0 && (
                <Text className="text-sm text-[#3B5760]">Nueva fecha aprox.: {fechaBonita(nuevaFecha())}</Text>
              )}
            </View>
          )}

          {error && <Text className="text-sm font-semibold text-[#C4202F]">{error}</Text>}

          <Pressable onPress={guardar} disabled={guardando} accessibilityRole="button" style={{ opacity: guardando ? 0.6 : 1 }}>
            <LinearGradient
              colors={["#0B7C8E", "#0EA5B0"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 16, paddingVertical: 16, alignItems: "center", justifyContent: "center" }}
            >
              {guardando ? <ActivityIndicator color="white" /> : <Text className="text-base font-bold text-white">Guardar</Text>}
            </LinearGradient>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
