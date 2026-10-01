import { Redirect, Tabs } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { useAuthSession } from "../../providers/AuthProvider";

export default function AuthorizedLayout() {
  const { token, rol } = useAuthSession();

  if (!token) {
    return <Redirect href="/login" />;
  }

  const esSupervisor = rol === "supervisor";

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: true,
          tabBarActiveTintColor: "#208AEF",
          tabBarInactiveTintColor: "#64748B",
          tabBarStyle: {
            backgroundColor: "#FFFFFF",
            borderTopWidth: 1,
            borderTopColor: "#E2E8F0",
            height: 60,
            paddingBottom: 8,
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
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="productos"
          options={{
            title: "Productos",
            tabBarItemStyle: esSupervisor ? { display: "none" } : undefined,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="cube-outline" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="desempeno"
          options={{
            title: "Personal",
            tabBarItemStyle: !esSupervisor ? { display: "none" } : undefined,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="people-outline" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="perfil"
          options={{
            title: "Despacho",
            tabBarItemStyle: !esSupervisor ? { display: "none" } : undefined,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="map-outline" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="chat"
          options={{
            title: "Comunicación",
            tabBarItemStyle: esSupervisor ? { display: "none" } : undefined,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="chatbubbles-outline" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="alertas"
          options={{
            title: "Alertas",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="notifications-outline" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="histoChat"
          options={{
            title: "Reportes",
            tabBarItemStyle: esSupervisor ? { display: "none" } : undefined,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="document-text-outline" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="ajustes"
          options={{
            title: "Chats",
            tabBarItemStyle: !esSupervisor ? { display: "none" } : undefined,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="chatbox-ellipses-outline" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="detalle"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  );
}