import { API_URL } from "@/config/api";
import { useAuthSession } from "@/providers/AuthProvider";
import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";


type Meta = {
  idMeta: number;
  correoPromotor: string;
  tienda: { idTienda: number; nombre: string; ubicacion: string };
  departamento: string;
  periodo: string; // "2026-11"
  meta: number;
  venta: number;
  bono: number;
};

type Usuario = { id: string; name: string; correo: string; rol: string };


type Resumen = { venta: number; meta: number; bono: number; pct: number };

function resumir(filas: Meta[]): Resumen {
  const venta = filas.reduce((t, m) => t + (m.venta ?? 0), 0);
  const meta = filas.reduce((t, m) => t + (m.meta ?? 0), 0);
  const bono = filas.reduce((t, m) => t + (m.bono ?? 0), 0);
  return { venta, meta, bono, pct: porcentaje(venta, meta) };
}

const porcentaje = (venta: number, meta: number) => (meta > 0 ? Math.round((venta / meta) * 100) : 0);

function formatearPesos(valor: number) {
  return "$" + Math.round(valor).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}


function pesosCortos(valor: number) {
  if (valor >= 1_000_000) return "$" + (valor / 1_000_000).toFixed(1).replace(".", ",") + "M";
  return formatearPesos(valor);
}

// "2026-11" -> "Nov 2026"
function nombrePeriodo(periodo: string) {
  const [anio, mes] = periodo.split("-").map(Number);
  const texto = new Date(anio, mes - 1, 1).toLocaleDateString("es-CL", { month: "short" }).replace(".", "");
  return `${texto.charAt(0).toUpperCase()}${texto.slice(1)} ${anio}`;
}


function colorBarra(pct: number) {
  if (pct >= 100) return { barra: "#4F8BF5", texto: "#2450C2", fondo: "#E6EEFF" };
  if (pct >= 90) return { barra: "#3FD6A0", texto: "#0A6D7D", fondo: "#E3F5F5" };
  return { barra: "#FF7A9C", texto: "#C4202F", fondo: "#FDECEC" };
}


function iniciales(nombre: string) {
  return nombre
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}


const sombraTarjeta = { boxShadow: "0 4px 12px rgba(10, 85, 104, 0.08)" };
const sombraPrincipal = { boxShadow: "0 10px 24px rgba(10, 85, 104, 0.14)" };

export default function Desempeno() {
  const { token } = useAuthSession();

  const [metas, setMetas] = useState<Meta[]>([]);
  const [promotores, setPromotores] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  const [periodoElegido, setPeriodoElegido] = useState<string | null>(null);
  const [seleccionado, setSeleccionado] = useState<string | null>(null); // correo

  const cargar = useCallback(async () => {
    if (!token) return;
    setError(false);
    try {
      const headers = { Authorization: token };
      const [resMetas, resUsuarios] = await Promise.all([
        fetch(`${API_URL}/api/metas`, { headers }),
        fetch(`${API_URL}/usuarios`, { headers }),
      ]);
      if (!resMetas.ok || !resUsuarios.ok) throw new Error();
      setMetas(await resMetas.json());
      const usuarios: Usuario[] = await resUsuarios.json();
      setPromotores(usuarios.filter((u) => u.rol?.toLowerCase() === "promotor"));
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


  const periodos = [...new Set(metas.map((m) => m.periodo))].sort().reverse();
  const periodo = periodoElegido ?? periodos[0];

  const delMes = metas.filter((m) => m.periodo === periodo);
  const nombreDe = (correo: string) => promotores.find((p) => p.correo === correo)?.name ?? correo;


  const ranking = [...new Set(delMes.map((m) => m.correoPromotor))]
    .map((correo) => ({ correo, nombre: nombreDe(correo), ...resumir(delMes.filter((m) => m.correoPromotor === correo)) }))
    .sort((a, b) => b.pct - a.pct);

  const promotor = ranking.find((r) => r.correo === seleccionado) ?? ranking[0];
  const detalle = promotor ? delMes.filter((m) => m.correoPromotor === promotor.correo) : [];
  const historial = promotor
    ? periodos.map((p) => ({
        periodo: p,
        ...resumir(metas.filter((m) => m.periodo === p && m.correoPromotor === promotor.correo)),
      }))
    : [];
  const equipo = resumir(delMes);

  return (
    <ScrollView
      className="flex-1 bg-[#EEF6F7]"
      refreshControl={<RefreshControl refreshing={false} onRefresh={cargar} />}
    >
      <StatusBar style="light" />


      <LinearGradient
        colors={["#0A5568", "#0B7C8E", "#0EA5B0", "#3BCBC3"]}
        locations={[0, 0.42, 0.78, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingHorizontal: 18,
          paddingTop: 58,
          paddingBottom: 64,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
          gap: 18,
        }}
      >
        <View>
          <Text className="text-[26px] font-extrabold text-white">Mi equipo</Text>
          <Text className="text-sm text-[#D4F5F4]">
            {periodo
              ? `${ranking.length} promotores · equipo al ${equipo.pct}% de la meta`
              : "Metas y cierres de mes"}
          </Text>
        </View>


        {periodos.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
            {periodos.map((p) => {
              const activo = p === periodo;
              return (
                <Pressable
                  key={p}
                  accessibilityRole="button"
                  accessibilityState={{ selected: activo }}
                  onPress={() => setPeriodoElegido(p)}
                  className={`mr-2 rounded-full border px-4 py-2 ${
                    activo ? "border-white bg-white" : "border-[#FFFFFF33] bg-[#FFFFFF1F]"
                  }`}
                >
                  <Text className={`text-sm ${activo ? "font-bold text-[#0A5568]" : "font-semibold text-white"}`}>
                    {nombrePeriodo(p)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </LinearGradient>

      <View className="-mt-9 gap-6 px-4 pb-10">
        {cargando ? (
          <ActivityIndicator color="#0A6D7D" style={{ marginTop: 48 }} />
        ) : error ? (
          <Vacio icono="wifi-off" texto="No se pudieron cargar las metas. Desliza hacia abajo para reintentar." />
        ) : !promotor ? (
          <Vacio icono="target" texto="Todavía no hay metas cargadas" />
        ) : (
          <>

            <View className="rounded-3xl border border-[#DCEBEE] bg-white pl-4" style={sombraPrincipal}>
              {ranking.map((p, i) => {
                const color = colorBarra(p.pct);
                const activo = p.correo === promotor.correo;
                return (
                  <Pressable
                    key={p.correo}
                    accessibilityRole="button"
                    accessibilityState={{ selected: activo }}
                    accessibilityLabel={`${p.nombre}, ${p.pct} por ciento de la meta`}
                    onPress={() => setSeleccionado(p.correo)}
                    className={`flex-row items-center gap-3 py-3 pr-4 ${
                      i < ranking.length - 1 ? "border-b border-[#E3EEF0]" : ""
                    }`}
                  >
                    <View
                      className={`h-11 w-11 items-center justify-center rounded-full ${activo ? "border-2 border-[#0B7C8E]" : ""}`}
                      style={{ backgroundColor: color.fondo }}
                    >
                      <Text className="text-[15px] font-bold" style={{ color: color.texto }}>
                        {iniciales(p.nombre)}
                      </Text>
                    </View>
                    <View className="flex-1 gap-1">
                      <View className="flex-row items-baseline justify-between">
                        <Text
                          className={`flex-shrink text-[15px] font-bold ${activo ? "text-[#0A5568]" : "text-[#10262E]"}`}
                          numberOfLines={1}
                        >
                          {p.nombre}
                        </Text>
                        <Text className="text-[15px] font-bold" style={{ color: color.texto }}>
                          {p.pct}%
                        </Text>
                      </View>
                      <Text className="text-xs text-[#3B5760]">
                        {pesosCortos(p.venta)} de {pesosCortos(p.meta)}
                        {p.bono > 0 ? ` · bono ${formatearPesos(p.bono)}` : ""}
                      </Text>
                      <View className="h-1.5 overflow-hidden rounded-full bg-[#E2ECEE]">
                        <View
                          className="h-1.5 rounded-full"
                          style={{ width: `${Math.min(p.pct, 100)}%`, backgroundColor: color.barra }}
                        />
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {/* Resumen del mes */}
            <View className="gap-4 rounded-3xl border border-[#DCEBEE] bg-white p-5" style={sombraTarjeta}>
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-[#3B5760]">
                    Cierre {nombrePeriodo(periodo)} · {promotor.nombre}
                  </Text>
                  <Text className="text-[32px] font-extrabold" style={{ color: colorBarra(promotor.pct).texto }}>
                    {promotor.pct}%
                  </Text>
                  <Text className="text-sm text-[#3B5760]">de la meta</Text>
                </View>
                <View className="h-16 w-16 rounded-full border-[7px] border-[#E2ECEE] border-t-[#8B7CFF] border-r-[#4FC8E8] border-b-[#6EDC9E]" />
              </View>

              <View className="flex-row gap-2">
                <Dato valor={pesosCortos(promotor.venta)} texto="Venta" />
                <Dato valor={pesosCortos(promotor.meta)} texto="Meta" />
                <Dato valor={promotor.bono > 0 ? formatearPesos(promotor.bono) : "-"} texto="Bono" />
              </View>
            </View>

            <View className="gap-3">
              <View className="flex-row items-center gap-2">
                <Feather name="shopping-bag" size={17} color="#0A6D7D" />
                <Text className="text-base font-bold text-[#10262E]">Por tienda</Text>
              </View>
              <View className="rounded-2xl border border-[#DCEBEE] bg-white pl-4" style={sombraTarjeta}>
                {detalle.map((m, i) => {
                  const pct = porcentaje(m.venta, m.meta);
                  const color = colorBarra(pct);
                  return (
                    <View
                      key={m.idMeta}
                      className={`flex-row items-center gap-3 py-3 pr-4 ${
                        i < detalle.length - 1 ? "border-b border-[#E3EEF0]" : ""
                      }`}
                    >
                      <View className="flex-1">
                        <Text className="text-[15px] font-bold text-[#10262E]" numberOfLines={1}>
                          {m.tienda.nombre} · {m.departamento}
                        </Text>
                        <Text className="text-xs text-[#3B5760]">
                          {pesosCortos(m.venta)} de {pesosCortos(m.meta)}
                          {m.bono > 0 ? ` · bono ${formatearPesos(m.bono)}` : ""}
                        </Text>
                      </View>
                      <View className="min-w-[56px] items-center rounded-lg px-2 py-1" style={{ backgroundColor: color.fondo }}>
                        <Text className="text-sm font-bold" style={{ color: color.texto }}>
                          {pct}%
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Historial de cierres de mes */}
            <View className="gap-3">
              <View className="flex-row items-center gap-2">
                <Ionicons name="trending-up" size={18} color="#0A6D7D" />
                <Text className="text-base font-bold text-[#10262E]">Historial</Text>
              </View>

              <View className="rounded-2xl border border-[#DCEBEE] bg-white pl-4" style={sombraTarjeta}>
                {historial.map((r, i) => {
                  const color = colorBarra(r.pct);
                  return (
                    <View
                      key={r.periodo}
                      className={`gap-2 py-4 pr-4 ${i < historial.length - 1 ? "border-b border-[#E3EEF0]" : ""}`}
                    >
                      <View className="flex-row items-center justify-between">
                        <Text className="text-[15px] font-bold text-[#10262E]">{nombrePeriodo(r.periodo)}</Text>
                        <View className="rounded-full px-2.5 py-0.5" style={{ backgroundColor: color.fondo }}>
                          <Text className="text-xs font-bold" style={{ color: color.texto }}>
                            {r.pct}%
                          </Text>
                        </View>
                      </View>

                      <View className="flex-row justify-between">
                        <View className="flex-row items-center gap-1.5">
                          <Feather name="dollar-sign" size={14} color="#6E8C94" />
                          <Text className="text-sm text-[#3B5760]">{pesosCortos(r.venta)}</Text>
                        </View>
                        <View className="flex-row items-center gap-1.5">
                          <Feather name="target" size={14} color="#6E8C94" />
                          <Text className="text-sm text-[#3B5760]">{pesosCortos(r.meta)}</Text>
                        </View>
                        <View className="flex-row items-center gap-1.5">
                          <Feather name="award" size={14} color="#6E8C94" />
                          <Text className="text-sm text-[#3B5760]">{r.bono > 0 ? formatearPesos(r.bono) : "-"}</Text>
                        </View>
                      </View>

                      {/* Barra de progreso */}
                      <View className="h-2 overflow-hidden rounded-full bg-[#E2ECEE]">
                        <View
                          className="h-2 rounded-full"
                          style={{ width: `${Math.min(r.pct, 100)}%`, backgroundColor: color.barra }}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}

function Dato({ valor, texto }: { valor: string; texto: string }) {
  return (
    <View className="flex-1 items-center rounded-2xl bg-[#EEF6F7] px-2 py-3">
      <Text className="text-base font-bold text-[#10262E]" numberOfLines={1}>
        {valor}
      </Text>
      <Text className="text-xs text-[#3B5760]">{texto}</Text>
    </View>
  );
}

function Vacio({ icono, texto }: { icono: keyof typeof Feather.glyphMap; texto: string }) {
  return (
    <View className="items-center rounded-3xl border border-[#DCEBEE] bg-white px-6 py-10" style={sombraPrincipal}>
      <Feather name={icono} size={28} color="#5C7A82" />
      <Text className="mt-3 text-center text-[15px] text-[#3B5760]">{texto}</Text>
    </View>
  );
}
