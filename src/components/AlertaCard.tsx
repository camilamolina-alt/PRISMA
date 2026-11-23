import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, Text, View } from "react-native";
import { Alerta, NivelAlerta } from "../data/alertas";


const estilos: Record<
  NivelAlerta,
  {
    etiqueta: string;
    gradiente: [string, string];
    sombra: string; // rgb para la sombra del icono
    fondoPill: string;
    textoPill: string;
  }
> = {
  critico: {
    etiqueta: "Crítica",
    gradiente: ["#FF6B6B", "#E02F3F"],
    sombra: "224, 47, 63",
    fondoPill: "#FDE2E4",
    textoPill: "#A3161F",
  },
  retraso: {
    etiqueta: "Atención",
    gradiente: ["#FFB547", "#F07C00"],
    sombra: "240, 124, 0",
    fondoPill: "#FFF1DC",
    textoPill: "#8A4B00",
  },
  pendiente: {
    etiqueta: "Aviso",

    gradiente: ["#2DD4BF", "#0D9488"],
    sombra: "13, 148, 136",
    fondoPill: "#DDF5F3",
    textoPill: "#075A66",
  },
};

function IconoNivel({ nivel }: { nivel: NivelAlerta }) {
  if (nivel === "critico") return <Ionicons name="warning-outline" size={22} color="white" />;
  if (nivel === "retraso") return <MaterialCommunityIcons name="truck-fast-outline" size={22} color="white" />;
  return <Feather name="clipboard" size={20} color="white" />;
}


// Colores de la tarjeta según el rol (lo manda la pantalla de alertas); por defecto, los del promotor
type TemaTarjeta = { borde: string; tinta: string; gris: string; sombra: string };
const temaBase: TemaTarjeta = { borde: "#E4E2EE", tinta: "#1B1733", gris: "#6B6787", sombra: "70, 54, 168" };

type Props = {
  alerta: Alerta;
  onPress?: () => void;
  destacada?: boolean; // la critica
  tema?: TemaTarjeta;
};

export default function AlertaCard({ alerta, onPress, destacada = false, tema = temaBase }: Props) {
  const e = estilos[alerta.nivel];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${e.etiqueta}: ${alerta.titulo}, ${alerta.detalle}, ${alerta.hace}${
        alerta.nueva ? ", nueva" : ""
      }`}
      onPress={onPress}
      className={`mb-3 flex-row items-center gap-3 rounded-2xl bg-white p-3.5 active:opacity-80 ${
        destacada ? "border-2 border-[#F5A3A3]" : "border"
      }`}
      style={
        destacada
          ? { boxShadow: "0 8px 20px rgba(196, 32, 47, 0.16)" }
          : { borderColor: tema.borde, boxShadow: `0 4px 12px rgba(${tema.sombra}, 0.08)` }
      }
    >

      <LinearGradient
        colors={e.gradiente}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
          alerta.nueva ? { boxShadow: `0 4px 10px rgba(${e.sombra}, 0.3)` } : { opacity: 0.55 },
        ]}
      >
        <IconoNivel nivel={alerta.nivel} />
      </LinearGradient>

      <View className="flex-1 gap-1">
        <View className="flex-row items-center gap-2">
          <View className="rounded-lg px-2 py-0.5" style={{ backgroundColor: e.fondoPill }}>
            <Text className="text-xs font-bold" style={{ color: e.textoPill }}>
              {e.etiqueta}
            </Text>
          </View>
          <Text className="text-xs" style={{ color: tema.gris }}>
            {alerta.hace}
          </Text>
        </View>

        <Text
          className={`text-[15px] ${alerta.nueva ? "font-bold" : "font-semibold"}`}
          style={{ color: alerta.nueva ? tema.tinta : tema.gris }}
        >
          {alerta.titulo}
        </Text>
        <Text className="text-sm" style={{ color: tema.gris }}>
          {alerta.detalle}
        </Text>
      </View>

      
      {alerta.nueva && <View className="h-2.5 w-2.5 rounded-full bg-[#F03E4E]" />}
      <Feather name="chevron-right" size={22} color={destacada ? "#A3161F" : tema.gris} />
    </Pressable>
  );
}
