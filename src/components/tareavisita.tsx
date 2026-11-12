import { Text, View } from 'react-native';


interface TareaVisitaProps {
  tienda: string;
  completadas: number;
  asignadas: number;
}

export default function TareasVisitaCard({ tienda, completadas, asignadas }: TareaVisitaProps) {
  const porcentaje = asignadas > 0 ? Math.round((completadas / asignadas) * 100) : 0;
  
  return (
    <View className="bg-white p-4 rounded-xl mb-3 border border-gray-100 shadow-sm">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="font-semibold text-gray-800 text-sm">{tienda}</Text>
        <Text className="text-sm font-bold text-green-600">{porcentaje}%</Text>
      </View>
      <View className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <View 
          className="h-full bg-green-500 rounded-full" 
          style={{ width: `${porcentaje}%` }} 
        />
      </View>
      <Text className="text-xs text-gray-400 mt-2">
        {completadas} de {asignadas} tareas completadas
      </Text>
    </View>
  );
}