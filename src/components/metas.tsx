import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { colorPorcentaje, Indicadores, leerIndicadores } from "../lib/indicadores";
import { useAuthSession } from "../providers/AuthProvider";

const sombraTarjeta = { boxShadow: "0 4px 12px rgba(10, 85, 104, 0.08)" };

export default function Metas() {
  const { token } = useAuthSession();
  const [datos, setDatos] = useState<Indicadores | null>(null);
  const [error, setError] = useState(false);
  const [ancho, setAncho] = useState(0);

  useFocusEffect(
    useCallback(() => {
      if (!token) return;
      leerIndicadores(token)
        .then((d) => {
          setDatos(d);
          setError(false);
        })
        .catch(() => setError(true));
    }, [token])
  );

  if (error) {
    return (
      <Tarjeta titulo="Hoy en ruta" icono="map-pin">
        <Text className="py-4 text-center text-[15px] text-[#C4202F]">No se pudieron cargar los indicadores</Text>
      </Tarjeta>
    );
  }

  if (!datos) {
    return (
      <Tarjeta titulo="Hoy en ruta" icono="map-pin">
        <ActivityIndicator color="#0A6D7D" style={{ paddingVertical: 24 }} />
      </Tarjeta>
    );
  }

  const conRuta = datos.rutas.filter((r) => r.asignadas > 0);
  const barras = conRuta.map((r) => ({
    value: r.porcentaje,
    label: r.nombre.split(" ")[0],
    frontColor: colorPorcentaje(r.porcentaje).barra,
    topLabelComponent: () => (
      <Text className="mb-1 text-xs font-bold text-[#10262E]">{r.porcentaje}%</Text>
    ),
  }));
  const anchoBarra = 28;
  const espacio = Math.max(18, Math.min(48, (ancho - 60 - barras.length * anchoBarra) / Math.max(barras.length, 1)));

  return (
    <View className="gap-6">
      <Tarjeta titulo="Ruta diaria por promotor" subtitulo="Tiendas visitadas hoy / tiendas asignadas" icono="map-pin">
        {conRuta.length === 0 ? (
          <Text className="py-4 text-center text-[15px] text-[#3B5760]">Ningún promotor tiene tiendas asignadas</Text>
        ) : (
          <View onLayout={(e) => setAncho(e.nativeEvent.layout.width)}>
            {ancho > 0 && (
              <BarChart
                data={barras}
                width={ancho - 50}
                height={170}
                barWidth={anchoBarra}
                spacing={espacio}
                initialSpacing={12}
                barBorderTopLeftRadius={6}
                barBorderTopRightRadius={6}
                maxValue={100}
                noOfSections={4}
                yAxisLabelSuffix="%"
                yAxisLabelWidth={40}
                yAxisThickness={0}
                xAxisThickness={1}
                xAxisColor="#DCEBEE"
                rulesColor="#E3EEF0"
                yAxisTextStyle={{ color: "#6E8C94", fontSize: 11 }}
                xAxisLabelTextStyle={{ color: "#3B5760", fontSize: 12 }}
                isAnimated
              />
            )}
            <View className="mt-3 gap-1">
              {conRuta.map((r) => (
                <Text key={r.correo} className="text-sm text-[#3B5760]">
                  <Text className="font-semibold text-[#10262E]">{r.nombre}</Text>: {r.visitadas} de {r.asignadas} tiendas
                </Text>
              ))}
            </View>
          </View>
        )}
      </Tarjeta>

      <Tarjeta titulo="Tareas por tienda" subtitulo="Completadas / asignadas en la jornada" icono="check-square">
        {datos.tiendas.length === 0 ? (
          <Text className="py-4 text-center text-[15px] text-[#3B5760]">No hay tareas en la jornada</Text>
        ) : (
          <View className="gap-4">
            {datos.tiendas.map((t) => {
              const color = colorPorcentaje(t.porcentaje);
              return (
                <View
                  key={t.idTienda}
                  className="gap-1.5"
                  accessible
                  accessibilityLabel={`${t.nombre} ${t.ubicacion ?? ""}: ${t.completadas} de ${t.asignadas} tareas, ${t.porcentaje} por ciento`}
                >
                  <View className="flex-row items-baseline justify-between gap-2">
                    <Text className="flex-1 text-[15px] font-semibold text-[#10262E]" numberOfLines={1}>
                      {t.nombre}
                      {t.ubicacion ? <Text className="font-normal text-[#3B5760]"> · {t.ubicacion}</Text> : null}
                    </Text>
                    <Text className="text-sm font-bold" style={{ color: color.texto }}>
                      {t.completadas}/{t.asignadas} · {t.porcentaje}%
                    </Text>
                  </View>
                  <View className="h-2.5 overflow-hidden rounded-full bg-[#E2ECEE]">
                    <View style={{ width: `${t.porcentaje}%`, height: "100%", borderRadius: 999, backgroundColor: color.barra }} />
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </Tarjeta>
    </View>
  );
}

function Tarjeta({
  titulo,
  subtitulo,
  icono,
  children,
}: {
  titulo: string;
  subtitulo?: string;
  icono: keyof typeof Feather.glyphMap;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-4 rounded-3xl border border-[#DCEBEE] bg-white p-5" style={sombraTarjeta}>
      <View className="flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#E3F5F5]">
          <Feather name={icono} size={20} color="#0A6D7D" />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-bold text-[#10262E]">{titulo}</Text>
          {subtitulo && <Text className="text-sm text-[#3B5760]">{subtitulo}</Text>}
        </View>
      </View>
      {children}
    </View>
  );
}
