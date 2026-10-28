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

  const visibles =
    filtro === "todas" ? alertas : alertas.filter((a) => a.nivel === filtro);
  const nuevas = alertas.filter((a) => a.nueva).length;

  return (
    <View className="flex-1 bg-gray-50 px-4 pt-4">
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Text className="text-xl font-bold text-gray-800">Alertas</Text>
          {nuevas > 0 && (
            <View className="ml-2 rounded-full bg-red-100 px-2 py-0.5">
              <Text className="text-xs font-bold text-red-600">
                {nuevas} NUEVAS
              </Text>
            </View>
          )}
        </View>

        <View className="items-end">
          <Text
            className={`text-xs font-semibold ${
              conectado ? "text-green-600" : "text-red-500"
            }`}
          >
            {conectado ? "● En vivo" : "● Sin conexión"}
          </Text>
          {nuevas > 0 && (
            <Pressable onPress={marcarTodas}>
              <Text className="text-sm font-semibold text-blue-500">
                Marcar todas
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        className="mb-3"
      >
        {filtros.map((f) => (
          <Pressable
            key={f.valor}
            onPress={() => setFiltro(f.valor)}
            className={`mr-2 rounded-full px-4 py-2 ${
              filtro === f.valor ? "bg-blue-500" : "bg-white"
            }`}
          >
            <Text
              className={`font-semibold ${
                filtro === f.valor ? "text-white" : "text-gray-700"
              }`}
            >
              {f.etiqueta}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <FlatList
        data={visibles}
        keyExtractor={(a) => a.id}
        renderItem={({ item }) => (
          <AlertaCard alerta={item} onPress={() => marcarLeida(item.id)} />
        )}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={false} onRefresh={recargar} />}
        ListEmptyComponent={
          <Text className="mt-10 text-center text-gray-400">
            No hay alertas en esta categoría
          </Text>
        }
      />
    </View>
  );
}