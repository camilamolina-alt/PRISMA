import { Text, View } from 'react-native';
import { ProgressChart } from 'react-native-chart-kit';

interface MetricasZonaProps {
  tareasCompletadas: number;
  tareasAsignadas: number;
  alertasHoy: number;
  alertasAyer: number;
}

export default function MetricasZona({ tareasCompletadas, tareasAsignadas, alertasHoy, alertasAyer }: MetricasZonaProps) {
  const cumplimientoZona = tareasAsignadas > 0 ? tareasCompletadas / tareasAsignadas : 0;
  const variacionAlertas = alertasAyer > 0 ? ((alertasHoy - alertasAyer) / alertasAyer) * 100 : 0;

  return (
    <View>
      
      <View className="bg-white p-5 rounded-2xl shadow-sm mb-4 border border-gray-200 flex-row justify-between items-center">
        <View className="flex-1">
          <Text className="text-gray-500 text-base font-medium mb-1">Cumplimiento Zona</Text>
          <Text className="text-3xl font-extrabold text-gray-700 mb-1">
            {Math.round(cumplimientoZona * 100)}%
          </Text>
          <Text className="text-xs text-gray-400">
            Tareas totales : <Text className="font-bold text-gray-600">{tareasAsignadas}</Text>
          </Text>
          <Text className="text-xs text-gray-400">
        Tareas completadas : <Text className="font-bold text-gray-600">{tareasCompletadas}</Text>
        </Text>
        </View>
        <View className="justify-center items-center">
          <ProgressChart
            data={{ labels: [""], data: [cumplimientoZona] }}
            width={90}
            height={90}
            strokeWidth={12}
            radius={28}
            chartConfig={{
              backgroundColor: "#ffffff",
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
            }}
            hideLegend={true}
          />
        </View>
      </View>

     
      <View className="bg-white p-5 rounded-2xl shadow-sm mb-6 border border-gray-200 flex-row justify-between items-center">
        <View className="flex-1 pr-4">
          <Text className="text-gray-500 text-base font-medium mb-1">Stock Crítico</Text>
          <View className={`flex-row items-center px-2 py-1 rounded-md self-start mt-1 ${variacionAlertas < 0 ? 'bg-green-50' : 'bg-red-50'}`}>
            <Text className={`text-xs font-bold ${variacionAlertas < 0 ? 'text-green-600' : 'text-red-600'}`}>
              {variacionAlertas < 0 ? '↓' : '↑'} {variacionAlertas.toFixed(1)}% vs ayer
            </Text>
          </View>
        </View>
        <View className="items-end">
          <Text className="text-4xl font-black text-gray-700">{alertasHoy}</Text>
          <Text className="text-[10px] text-gray-400 font-bold uppercase mt-1">Alertas Activas</Text>
        </View>
      </View>
    </View>
  );
}