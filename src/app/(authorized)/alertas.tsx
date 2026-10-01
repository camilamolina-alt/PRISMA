import { useState } from "react";
import { FlatList, Pressable, ScrollView, Text, View } from "react-native";
import AlertaCard from "../../components/AlertaCard";
import { Alerta, alertasMock, NivelAlerta } from "../../data/alertas";

type Filtro = "todas" | NivelAlerta;

const filtros: { valor: Filtro; etiqueta: string }[] = [
  { valor: "todas", etiqueta: "Todas" },
  { valor: "critico", etiqueta: "Críticas" },
  { valor: "retraso", etiqueta: "Retrasos" },
  { valor: "pendiente", etiqueta: "Pendientes" },
];

export default function Alertas() {
  const [alertas, setAlertas] = useState<Alerta[]>(alertasMock);
  const [filtro, setFiltro] = useState<Filtro>("todas");

  const visibles =
    filtro === "todas" ? alertas : alertas.filter((a) => a.nivel === filtro);
  const nuevas = alertas.filter((a) => a.nueva).length;

  
  const marcarLeida = (id: string) => {
    setAlertas((prev) =>
      prev.map((a) => (a.id === id ? { ...a, nueva: false } : a))
    );
  };

  const marcarTodas = () => {
    setAlertas((prev) => prev.map((a) => ({ ...a, nueva: false })));
  };

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

        {nuevas > 0 && (
          <Pressable onPress={marcarTodas}>
            <Text className="text-sm font-semibold text-blue-500">
              Marcar todas
            </Text>
          </Pressable>
        )}
      </View>

      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}  // asi no baja hasta el final cuando hay poco pero no se 
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

      {/* Lista */}
      <FlatList
        data={visibles}
        keyExtractor={(a) => a.id}
        renderItem={({ item }) => (
          <AlertaCard alerta={item} onPress={() => marcarLeida(item.id)} />
        )}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text className="mt-10 text-center text-gray-400">
            No hay alertas en esta categoría
          </Text>
        }
      />
    </View>
  );
}
