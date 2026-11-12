import { Text, View } from 'react-native';
import { ProgressChart } from 'react-native-chart-kit';


interface RutaProps {
  tiendasVisitadas: number;
  tiendasAsignadas: number;
}

export default function RutaDiariaCard({ tiendasVisitadas, tiendasAsignadas }: RutaProps) {
  const avance = tiendasAsignadas > 0 ? tiendasVisitadas / tiendasAsignadas : 0;
  const porcentaje = Math.round(avance * 100);

  return (
    <View className="bg-white p-5 rounded-2xl shadow-sm mb-4 flex-row justify-between items-center border border-gray-200">
      <View className="flex-col justify-center">
        <Text className="text-gray-500 text-base font-medium mb-1">Ruta Diaria</Text>
        <Text className="text-4xl font-extrabold text-gray-700 mb-1">{porcentaje}%</Text>
        <Text className="text-xs text-gray-400">
          Tiendas visitadas : <Text className="font-bold text-gray-600">{tiendasVisitadas}</Text>
        </Text>
        <Text className="text-xs text-gray-400">
          Tiendas por visitar : <Text className="font-bold text-gray-600">{tiendasAsignadas}</Text>
        </Text>
      </View>
      <View className="justify-center items-center">
        <ProgressChart
          data={{ labels: [""], data: [avance] }}
          width={100}
          height={100}
          strokeWidth={14}
          radius={32}
          chartConfig={{
            backgroundColor: "#ffffff",
            backgroundGradientFrom: "#ffffff",
            backgroundGradientTo: "#ffffff",
            color: (opacity = 1) => `rgba(164, 204, 252, ${opacity})`,
          }}
          hideLegend={true}
        />
      </View>
    </View>
  );
}