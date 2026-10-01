import { Pressable, Text, View } from "react-native";
import { Alerta, NivelAlerta } from "../data/alertas";

// Un "diccionario" de estilos por nivel. Las clases van COMPLETAS (no armadas
// por pedazos): Tailwind solo genera las que ve escritas tal cual en el código.
const estilos: Record<
  NivelAlerta,
  {
    etiqueta: string;
    fondo: string;
    borde: string;
    barra: string;
    pill: string;
    textoPill: string;
    tiempo: string;
  }
> = {
  critico: {
    etiqueta: "CRÍTICO",
    fondo: "bg-red-50",
    borde: "border-red-200",
    barra: "bg-red-500",
    pill: "bg-red-100",
    textoPill: "text-red-600",
    tiempo: "text-red-600",
  },
  retraso: {
    etiqueta: "RETRASO",
    fondo: "bg-yellow-50",
    borde: "border-yellow-200",
    barra: "bg-yellow-500",
    pill: "bg-yellow-100",
    textoPill: "text-yellow-700",
    tiempo: "text-yellow-700",
  },
  pendiente: {
    etiqueta: "PENDIENTE",
    fondo: "bg-blue-50",
    borde: "border-blue-200",
    barra: "bg-blue-500",
    pill: "bg-blue-100",
    textoPill: "text-blue-600",
    tiempo: "text-blue-600",
  },
};

type Props = {
  alerta: Alerta;
  onPress?: () => void;
};

export default function AlertaCard({ alerta, onPress }: Props) {
  const e = estilos[alerta.nivel];

  return (
    <Pressable
      onPress={onPress}
      className={`mb-3 flex-row overflow-hidden rounded-2xl border ${e.fondo} ${e.borde} ${
        alerta.nueva ? "" : "opacity-60"
      }`}
    >
      {/* Barra de color del costado */}
      <View className={`w-1.5 ${e.barra}`} />

      <View className="flex-1 p-3">
        <View className="mb-1 flex-row items-center">
          <View className={`rounded px-2 py-0.5 ${e.pill}`}>
            <Text className={`text-xs font-bold ${e.textoPill}`}>
              {e.etiqueta}
            </Text>
          </View>
        </View>

        <Text className="text-base font-bold text-gray-900">
          {alerta.titulo}
        </Text>

        <Text className="mt-1 text-xs text-gray-500">
          {alerta.detalle} ·{" "}
          <Text className={`font-bold ${e.tiempo}`}>{alerta.hace}</Text>
        </Text>
      </View>

      <View className="justify-center pr-3">
        <Text className="text-2xl text-gray-400">›</Text>
      </View>
    </Pressable>
  );
}
