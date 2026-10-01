import { useRouter } from 'expo-router';
import { FlatList, Image, SafeAreaView, StatusBar, Text, TouchableOpacity, View } from 'react-native';

// Estructura de datos simulada para los chats del historial
interface ChatItem {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  avatar: string;
  isOnline: boolean;
}

const MOCK_CHATS: ChatItem[] = [
  {
    id: '1',
    name: 'Coordinador',
    lastMessage: 'Hola jefe, voy a acercarme cuando haga el cambio de tienda...',
    time: 'Hoy',
    unreadCount: 0,
    avatar: 'https://unsplash.com',
    isOnline: true,
  },
  {
    id: '2',
    name: 'Soporte Técnico',
    lastMessage: 'Su requerimiento #4029 ha sido solucionado con éxito.',
    time: 'Ayer',
    unreadCount: 1,
    avatar: 'https://unsplash.com',
    isOnline: false,
  },
  {
    id: '3',
    name: 'Logística Regional',
    lastMessage: 'El material P.O.P ya va en camino hacia Mall Plaza Trébol.',
    time: '28 Oct',
    unreadCount: 0,
    avatar: 'https://unsplash.com',
    isOnline: true,
  },
];

export default function HistoChatScreen() {
  const router = useRouter();

  const renderItem = ({ item }: { item: ChatItem }) => (
    <TouchableOpacity 
      onPress={() => router.push('/chat')}
      className="flex-row items-center p-4 border-b border-gray-100 active:bg-gray-50"
    >
      {/* Contenedor de Avatar con Indicador de Conexión */}
      <View className="relative">
        <Image 
          source={{ uri: item.avatar }} 
          className="w-12 h-12 rounded-full bg-gray-200"
        />
        {item.isOnline && (
          <View className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
        )}
      </View>

      {/* Textos informativos de la conversación */}
      <View className="flex-1 ml-4">
        <View className="flex-row justify-between items-baseline">
          <Text className="text-base font-semibold text-gray-800">{item.name}</Text>
          <Text className="text-xs text-gray-400">{item.time}</Text>
        </View>
        <View className="flex-row justify-between items-center mt-1">
          <Text 
            numberOfLines={1} 
            className={`text-sm flex-1 mr-2 ${item.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}
          >
            {item.lastMessage}
          </Text>
          
          {/* Globo de mensajes no leídos */}
          {item.unreadCount > 0 && (
            <View className="bg-blue-500 rounded-full h-5 px-1.5 justify-center items-center min-w-[20px]">
              <Text className="text-white text-xs font-bold">{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      
      {/* Listado del historial */}
      <FlatList
        data={MOCK_CHATS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center p-10">
            <Text className="text-gray-400 text-center">No hay chats en tu historial</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
