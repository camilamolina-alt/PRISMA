import "../../global.css";
import { Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import AuthProvider, { useAuthSession } from "../providers/AuthProvider";

SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

// Tiempo mínimo que se ve la pantalla de carga (en milisegundos)
const SPLASH_MIN_MS = 1500;

// Tiene que ir fuera del layout principal o no funciona
function RootNavigator() {
  const { isLoading } = useAuthSession();
  const [minTimePassed, setMinTimePassed] = useState(false);

  // Cuenta el tiempo mínimo; el return limpia el timer si el componente se desmonta
  useEffect(() => {
    const timer = setTimeout(() => setMinTimePassed(true), SPLASH_MIN_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  // Mientras carga la sesión O no pasa el tiempo mínimo: pantalla de carga
  if (isLoading || !minTimePassed) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#208AEF",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: "#FFFFFF", fontSize: 96, fontWeight: "800" }}>
          P
        </Text>
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
