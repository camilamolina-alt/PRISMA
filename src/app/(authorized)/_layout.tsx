import { Redirect } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAuthSession } from "../../providers/AuthProvider";

export default function AuthorizedLayout() {
  const { token } = useAuthSession();

  // El guardia: sin sesión, al login
  if (!token) {
    return <Redirect href="/login" />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          headerShown: true,
          drawerActiveTintColor: "#208AEF",
        }}
      >
        <Drawer.Screen
          name="index"
          options={{ drawerLabel: "Inicio", title: "Inicio" }}
        />
        <Drawer.Screen
          name="perfil"
          options={{ drawerLabel: "Perfil", title: "Perfil" }}
        />
        <Drawer.Screen
          name="productos"
          options={{ drawerLabel: "Productos", title: "Productos" }}
        />
        <Drawer.Screen
          name="chat"
          options={{ drawerLabel: "Chat", title: "Chat" }}
        />
        <Drawer.Screen
          name="histoChat"
          options={{
            drawerLabel: "Historial de Chat",
            title: "Historial de Chat",
          }}
        />
        <Drawer.Screen
          name="alertas"
          options={{ drawerLabel: "Alertas", title: "Alertas" }}
        />
        <Drawer.Screen
          name="ajustes"
          options={{ drawerLabel: "Ajustes", title: "Ajustes" }}
        />
        {/* Existe, pero no aparece en el menú */}
        <Drawer.Screen
          name="detalle"
          options={{ title: "Detalle", drawerItemStyle: { display: "none" } }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
