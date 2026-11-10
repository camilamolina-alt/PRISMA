import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect, useCallback } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import AlertaCard from "../../components/AlertaCard";
import { Alerta, NivelAlerta } from "../../data/alertas";
import { API_URL } from "../../config/api";
import { useAuthSession } from "../../providers/AuthProvider";
import { Client } from "@stomp/stompjs";

type Filtro = "todas" | NivelAlerta;

interface AlertaViva {
  id: string;
  nivel: NivelAlerta;
  titulo: string;
  detalle: string;
  fecha: string;
  nueva: boolean;
}

const filtros: { valor: Filtro; etiqueta: string }[] = [
  { valor: "todas", etiqueta: "Todas" },
  { valor: "critico", etiqueta: "Críticas" },
  { valor: "retraso", etiqueta: "Retrasos" },
  { valor: "pendiente", etiqueta: "Pendientes" },
];

function haceTiempo(fecha: string): string {
  const ms = new Date(fecha).getTime();
  if (Number.isNaN(ms)) return "";
  const min = Math.floor((Date.now() - ms) / 60000);
  if (min < 1) return "ahora";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  return `hace ${Math.floor(h / 24)} d`;
}

import { useAlertas } from "../../providers/AlertaProvider"; // Hook para las alertas 

export default function Alertas() {
  const { alertas: vivas, conectado, recargar, marcarLeida, marcarTodas } =
    useAlertas();
  const [filtro, setFiltro] = useState<Filtro>("todas");

  const alertas: Alerta[] = vivas.map((a) => ({
    id: a.id,
    nivel: a.nivel,
    titulo: a.titulo,
    detalle: a.detalle,
    hace: haceTiempo(a.fecha),
    nueva: a.nueva,
  }));

  const nuevas = alertas.filter((a) => a.nueva).length;

  // Cuantas hay de cada nivel (para la barra de colores del header)
  const cuenta = {
    critico: alertas.filter((a) => a.nivel === "critico").length,
    retraso: alertas.filter((a) => a.nivel === "retraso").length,
    pendiente: alertas.filter((a) => a.nivel === "pendiente").length,
  };

  // La critica nueva mas reciente 
  const destacada =
    filtro === "todas" ? alertas.find((a) => a.nivel === "critico" && a.nueva) : undefined;

  const visibles = (
    filtro === "todas" ? alertas : alertas.filter((a) => a.nivel === filtro)
  ).filter((a) => a.id !== destacada?.id);

  return (
    <View className="flex-1 bg-[#F3F2FB]">
      <StatusBar style="light" />

      <FlatList
        data={visibles}
        keyExtractor={(a) => a.id}
        renderItem={({ item }) => (
          <View className="px-4">
            <AlertaCard alerta={item} onPress={() => marcarLeida(item.id)} />
          </View>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={false} onRefresh={recargar} />}
        ListHeaderComponent={
          <>
            {/* Header  */}
            <LinearGradient
              colors={["#4636A8", "#5743C2", "#4F6FD0", "#3F96C4"]}
              locations={[0, 0.45, 0.8, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                paddingHorizontal: 18,
                paddingTop: 58,
                paddingBottom: 64,
                borderBottomLeftRadius: 32,
                borderBottomRightRadius: 32,
                gap: 22,
                overflow: "hidden",
              }}
            >
       
              <View className="absolute -right-16 -top-12 h-52 w-52 rounded-full bg-[#FFFFFF1A]" />

  
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-2xl font-extrabold text-white">Alertas</Text>
                  <Text className="mt-0.5 text-sm text-[#E2DDFB]">
                    <Text style={{ color: conectado ? "#6EDC9E" : "#FF9AA2" }}>● </Text>
                    {conectado ? "En vivo" : "Sin conexión"}
                    {nuevas > 0 ? `, ${nuevas} ${nuevas === 1 ? "nueva" : "nuevas"}` : ""}
                  </Text>
                </View>

                {nuevas > 0 && (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Marcar todas como leídas"
                    className="h-11 w-11 items-center justify-center rounded-full border border-[#FFFFFF59] bg-[#FFFFFF29]"
                    onPress={marcarTodas}
                  >
                    <Ionicons name="checkmark-done" size={22} color="white" />
                  </Pressable>
                )}
              </View>
              <View className="rounded-[20px] border border-[#FFFFFF33] bg-[#FFFFFF1F] px-5 py-4">
                <Text className="text-[15px] font-semibold text-[#E2DDFB]">Alertas activas</Text>
                <Text className="text-[32px] font-extrabold text-white">{alertas.length}</Text>

                <View className="mt-3 h-2 flex-row gap-[3px] overflow-hidden rounded-full bg-[#FFFFFF26]">
                  {cuenta.critico > 0 && <View style={{ flex: cuenta.critico }} className="bg-[#FF6B6B]" />}
                  {cuenta.retraso > 0 && <View style={{ flex: cuenta.retraso }} className="bg-[#FFB547]" />}
                  {cuenta.pendiente > 0 && <View style={{ flex: cuenta.pendiente }} className="bg-[#5EEAD4]" />}
                </View>

                <View className="mt-2.5 flex-row flex-wrap gap-x-4 gap-y-1">
                  <Leyenda color="#FF6B6B" texto={`${cuenta.critico} críticas`} />
                  <Leyenda color="#FFB547" texto={`${cuenta.retraso} retrasos`} />
                  <Leyenda color="#5EEAD4" texto={`${cuenta.pendiente} pendientes`} />
                </View>
              </View>
            </LinearGradient>

            <View className="-mt-9 gap-5 px-4 pb-3">
              {/* solo si hay alguna critica sin leer  */}
              {destacada ? (
                <AlertaCard alerta={destacada} destacada onPress={() => marcarLeida(destacada.id)} />
              ) : null}

              {/* Filtros*/}
              <View
                className="flex-row gap-1 rounded-2xl border border-[#E4E2EE] bg-white p-1.5"
                style={{ boxShadow: "0 4px 12px rgba(70, 54, 168, 0.08)" }}
              >
                {filtros.map((f) => {
                  const activo = filtro === f.valor;
                  return (
                    <Pressable
                      key={f.valor}
                      accessibilityRole="tab"
                      accessibilityState={{ selected: activo }}
                      onPress={() => setFiltro(f.valor)}
                      className={`flex-1 items-center rounded-xl py-2.5 ${activo ? "bg-[#4636A8]" : ""}`}
                      style={activo ? { boxShadow: "0 4px 10px rgba(70, 54, 168, 0.3)" } : undefined}
                    >
                      <Text
                        numberOfLines={1}
                        className={`text-[13px] font-semibold ${activo ? "text-white" : "text-[#6B6787]"}`}
                      >
                        {f.etiqueta}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text className="text-base font-bold text-[#1B1733]">Recientes</Text>
            </View>
          </>
        }
        ListEmptyComponent={
          <View className="mx-4 items-center rounded-2xl border border-[#E4E2EE] bg-white px-5 py-8">
            <Feather name="check-circle" size={32} color="#1F9D55" />
            <Text className="mt-2 font-bold text-[#1B1733]">Todo en orden</Text>
            <Text className="mt-1 text-center text-sm text-[#6B6787]">
              No hay alertas en esta categoría
            </Text>
          </View>
        }
      />
    </View>
  );
}

function Leyenda({ color, texto }: { color: string; texto: string }) {
  return (
    <View className="flex-row items-center gap-1.5">
      <View className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      <Text className="text-xs text-[#E2DDFB]">{texto}</Text>
    </View>
  );
}