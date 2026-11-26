import TarjetaCatalogo from "@/components/TarjetaCatalogo";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Catalogo() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView className="flex-1 bg-[#EEF2FA]" contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
      <StatusBar style="light" />

      <LinearGradient
        colors={["#0B1B3F", "#13285C", "#1E3A8A", "#2F5BB7"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingHorizontal: 20,
          paddingTop: insets.top + 16,
          paddingBottom: 48,
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
        }}
      >
        <View className="flex-row items-center">
          <Pressable
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
            accessibilityRole="button"
            accessibilityLabel="Volver"
            className="h-11 w-11 items-center justify-center rounded-full border border-[#FFFFFF40] bg-[#FFFFFF26]"
          >
            <Feather name="chevron-left" size={24} color="white" />
          </Pressable>
          <View className="ml-4 flex-1">
            <Text className="text-2xl font-bold text-white">Catálogo</Text>
            <Text className="text-sm text-[#E3EAF8]">Fotos de los productos</Text>
          </View>
        </View>
      </LinearGradient>

      <View className="-mt-6 px-5">
        <TarjetaCatalogo />
      </View>
    </ScrollView>
  );
}
