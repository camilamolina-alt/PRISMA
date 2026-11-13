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
  const esAdmin = rol === "admin";

  //volevr a las pantallas por si no esta en la barra 
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

          {/* Productos */}
          <Tabs.Screen
            name="productos"
            options={{
              title: "Productos",
              headerShown: false,
              tabBarItemStyle: esAdmin ? { display: "none" } : undefined,
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="cube-outline" size={size} color={color as string} />
              ),

            }}
          />

          {/* Desempeño */}
          <Tabs.Screen
            name="desempeno"
            options={{
              title: "Personal",
              headerShown: false, // tiene su propio header turquesa
              tabBarItemStyle: !esSupervisor ? { display: "none" } : undefined,
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="people-outline" size={size} color={color as string} />
              ),
            }}
          />

          {/* Despacho */}
          <Tabs.Screen
            name="perfil"
            options={{
              title: "Despacho",
              tabBarItemStyle: { display: "none" }, // vacia por ahora, oculta para todos
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="map-outline" size={size} color={color as string} />
              ),
            }}
          />

          {/*Chat*/}
          <Tabs.Screen
            name="chat"
            options={{
              title: "Comunicación",
              headerShown: false, // ya tiene su propio header morado
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="chatbubbles-outline" size={size} color={color as string} />
              ),
            }}


          />
          <Tabs.Screen
            name="reporte"
            options={{
              tabBarItemStyle: { display: "none" },
              tabBarStyle: { display: "none" },
              headerShown: false,
            }}
          />



          {/* Reporte de cierre del día */}
          <Tabs.Screen
            name="reporteSin"
            options={{
              tabBarItemStyle: { display: "none" },
              tabBarStyle: { display: "none" },
              headerShown: false,
            }}
          />

          {/* Reporte de problema */}
          <Tabs.Screen
            name="reporteProb"
            options={{
              tabBarItemStyle: { display: "none" },
              tabBarStyle: { display: "none" },
              headerShown: false,
            }}
          />
          {/* Conversacion , remitente */}
          <Tabs.Screen
            name="conversacion"
            options={{
              tabBarItemStyle: { display: "none" },
              tabBarStyle: { display: "none" },
              headerShown: false,
            }}
          />



          {/* Gestión de promos/precios/tareas (supervisor) */}
          <Tabs.Screen
            name="promos"
            options={{
              tabBarItemStyle: { display: "none" },
              tabBarStyle: { display: "none" },
              headerShown: false,
            }}
          />

          {/* Documentos: inicio con acciones y recientes (supervisor) */}
          <Tabs.Screen
            name="documentos"
            options={{
              tabBarItemStyle: { display: "none" },
              tabBarStyle: { display: "none" },
              headerShown: false,
            }}
          />
          <Tabs.Screen
            name="listaDocumentos"
            options={{
              tabBarItemStyle: { display: "none" },
              tabBarStyle: { display: "none" },
              headerShown: false,
            }}
          />

          {/* Documentos: subir planillas Excel (supervisor) */}
          <Tabs.Screen
            name="planillas"
            options={{
              tabBarItemStyle: { display: "none" },
              tabBarStyle: { display: "none" },
              headerShown: false,
            }}
          />

          {/* Ver promociones por cadena (supervisor) */}
          <Tabs.Screen
            name="verPromos"
            options={{
              tabBarItemStyle: { display: "none" },
              tabBarStyle: { display: "none" },
              headerShown: false,
            }}
          />



          {/* Alertas */}
          <Tabs.Screen
            name="alertas"
            options={{
              title: "Alertas",
              headerShown: false, // ya tiene su propio header morado
              tabBarItemStyle: esAdmin ? { display: "none" } : undefined,
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="notifications-outline" size={size} color={color as string} />
              ),
            }}
          />

          {/* Historial de chats*/}
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

          {/* Ajustes */}
          <Tabs.Screen
            name="ajustes"
            options={{
              title: "Chats",
              tabBarItemStyle: { display: "none" }, // repetia "Comunicación", oculta para todos
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="chatbox-ellipses-outline" size={size} color={color as string} />
              ),
            }}
          />


          {/* pantalla oculta que solo se puede acceder por la barra o quickstart */}
          <Tabs.Screen
            name="tiendas"
            options={{
              tabBarItemStyle: { display: "none" },
              title: "Tiendas",
              headerLeft: botonVolver,
            }}
          />
          <Tabs.Screen
            name="gestionUser"
            options={{
              tabBarItemStyle: { display: "none" },
              title: "Gestión de usuarios",
              headerLeft: botonVolver,
            }}
          />

          {/*Detalles de tiendas*/}
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