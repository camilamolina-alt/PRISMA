import "../../global.css";
import { Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import AuthProvider, { useAuthSession } from "../providers/AuthProvider";
import { AlertasProvider } from "../providers/AlertaProvider"; 

SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});


const SPLASH_MIN_MS = 1500;

// Tiene que ir fuera del layout principal o no funciona
function RootNavigator() {
  const { isLoading } = useAuthSession();
  const [minTimePassed, setMinTimePassed] = useState(false);


  useEffect(() => {
    const timer = setTimeout(() => setMinTimePassed(true), SPLASH_MIN_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);


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


  return (
    <AlertasProvider>
      <Slot />
    </AlertasProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}