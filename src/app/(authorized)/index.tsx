import { Pressable, Text, View } from "react-native";
import { useAuthSession } from "../../providers/AuthProvider";

export default function Home() {
  const { token, signOut } = useAuthSession();

  return (
    <View className="flex-1 items-center justify-center bg-white px-8">
      <Text className="mb-2 text-xl font-bold text-blue-500">Inicio</Text>
      <Text className="mb-6 text-center text-gray-500">
        Sesión activa: {token}
      </Text>

      <Pressable
        className="rounded-xl bg-gray-800 px-6 py-3"
        onPress={signOut}
      >
        <Text className="font-semibold text-white">Cerrar sesión</Text>
      </Pressable>
    </View>
  );
}
