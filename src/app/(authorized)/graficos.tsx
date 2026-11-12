import { useState } from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';


import RutaDiariaCard from '@/components/ruta';
import TareasVisitaCard from '@/components/tareavisita';
import MetricasZona from '@/components/zona';

export default function App() {
  
  const [datos] = useState({
    ruta: { visitadas: 1, asignadas: 3 },
    zona: { completadas: 2, asignadas: 10},
    stock: { alertasHoy: 8, alertasAyer: 5 },
    visitas: [
    { id: 1, tienda: "Falabella Mall Plaza Trébol", completadas: 1, asignadas: 2 },
    { id: 2, tienda: "Líder Hualpén", completadas: 3, asignadas: 5 },
    { id: 3, tienda: "Sodimac Los Ángeles", completadas: 1, asignadas: 3 }
    ]
  });

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      
      
      

      <ScrollView className="flex-1 p-4">
        <Text className="text-2xl font-bold text-gray-800 mb-1">Supervisión de Zona</Text>
       

        
        <RutaDiariaCard 
            tiendasVisitadas={datos.ruta.visitadas} 
            tiendasAsignadas={datos.ruta.asignadas} 
        />

        
        <MetricasZona 
            tareasCompletadas={datos.zona.completadas}
            tareasAsignadas={datos.zona.asignadas}
            alertasHoy={datos.stock.alertasHoy}
            alertasAyer={datos.stock.alertasAyer}
        />

        
        <Text className="text-lg font-bold text-gray-800 mb-3 ml-1">Tareas por Visita</Text>
        {datos.visitas.map((v) => (
          <TareasVisitaCard 
            key={v.id} 
            tienda={v.tienda} 
            completadas={v.completadas} 
            asignadas={v.asignadas} 
          />
        ))}
        
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}