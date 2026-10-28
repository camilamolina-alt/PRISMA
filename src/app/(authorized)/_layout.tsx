import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs, useRouter } from "expo-router";
import { Pressable } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AlertasProvider } from "../../providers/AlertaProvider";
import { useAuthSession } from "../../providers/AuthProvider";

export default function AuthorizedLayout() {
  const { token, rol } = useAuthSession();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  if (!token) {
    return <Redirect href="/login" />;
  }

  const esSupervisor = rol === "supervisor";

  // Flecha para volver desde las pantallas que no están en la barra
  const botonVolver = () => (
    <Pressable onPress={() => router.back()} style={{ paddingHorizontal: 12 }}>
      <Ionicons name="chevron-back" size={24} color="#208AEF" />
    </Pressable>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AlertasProvider>
        <Tabs
          backBehavior="history"
          screenOptions={{
            headerShown: true,
            tabBarActiveTintColor: "#208AEF",
            tabBarInactiveTintColor: "#64748B",
            tabBarStyle: {
              backgroundColor: "#FFFFFF",
              borderTopWidth: 1,
              borderTopColor: "#E2E8F0",
              height: 60 + insets.bottom,
              paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 10,
              paddingTop: 8,
            },
            tabBarLabelStyle: {
              fontWeight: "600",
              fontSize: 12,
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: "Inicio",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="home-outline" size={size} color={color as string} />
              ),
            }}
          />

          {/* Productos: ahora lo ven promotor Y supervisor */}
          <Tabs.Screen
            name="productos"
            options={{
              title: "Productos",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="cube-outline" size={size} color={color as string} />
              ),
            }}
          />

          <Tabs.Screen
            name="desempeno"
            options={{
              title: "Personal",
              tabBarItemStyle: !esSupervisor ? { display: "none" } : undefined,
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="people-outline" size={size} color={color as string} />
              ),
            }}
          />

          <Tabs.Screen
            name="perfil"
            options={{
              title: "Despacho",
              tabBarItemStyle: !esSupervisor ? { display: "none" } : undefined,
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="map-outline" size={size} color={color as string} />
              ),
            }}
          />
          <Tabs.Screen
            name="chat"
            options={{
            title: "Comunicación",
            tabBarIcon: ({ color, size }) => (
      <Ionicons name="chatbubbles-outline" size={size} color={color as string} />
    ),
  }}
/>

        <Tabs.Screen
          name="conversacion"
          options={{
          tabBarItemStyle: { display: "none" },
          tabBarStyle: { display: "none" },
          headerShown: false,
  }}
/>

          <Tabs.Screen
            name="alertas"
            options={{
              title: "Alertas",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="notifications-outline" size={size} color={color as string} />
              ),
            }}
          />

          <Tabs.Screen
            name="histoChat"
            options={{
              title: "Reportes",
              tabBarItemStyle: esSupervisor ? { display: "none" } : undefined,
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="document-text-outline" size={size} color={color as string} />
              ),
            }}
          />

          <Tabs.Screen
            name="ajustes"
            options={{
              title: "Chats",
              tabBarItemStyle: !esSupervisor ? { display: "none" } : undefined,
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="chatbox-ellipses-outline" size={size} color={color as string} />
              ),
            }}
          />

            
          {/* La pantalla oculta que solo se puede acceder por la barra o quickstart */}
          <Tabs.Screen
            name="tiendas"
            options={{
              tabBarItemStyle: { display: "none" },
              title: "Tiendas",
              headerLeft: botonVolver,
            }}
          />

          <Tabs.Screen
            name="detalle"
            options={{
              tabBarItemStyle: { display: "none" },
              title: "Detalle de tienda",
              headerLeft: botonVolver,
            }}
          />
        </Tabs>
      </AlertasProvider>
    </GestureHandlerRootView>

    
  );




}