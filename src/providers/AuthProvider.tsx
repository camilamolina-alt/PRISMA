import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type Rol = "promotor" | "supervisor";

type AuthContextType = {
  token: string | null;
  rol: Rol;
  isLoading: boolean;
  signIn: (token: string, rol: Rol) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  token: null,
  rol: "promotor",
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
});

// Hook para leer la sesión desde cualquier pantalla
export function useAuthSession() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [rol, setRol] = useState<Rol>("promotor");
  const [isLoading, setIsLoading] = useState(true);

  // busca si la sesion esta guardada, carga deloende del token
  useEffect(() => {
    async function loadSession() {
      try {
        const [[, savedToken], [, savedRol]] = await AsyncStorage.multiGet([
          "@token",
          "@rol",
        ]);
        setToken(savedToken || null);
        // Si no hay rol guardado ingresa al promotor
        setRol(savedRol === "supervisor" ? "supervisor" : "promotor");
      } catch (e) {
        console.warn(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadSession();
  }, []);

  const signIn = useCallback(async (newToken: string, newRol: Rol) => {
    await AsyncStorage.multiSet([
      ["@token", newToken],
      ["@rol", newRol],
    ]);
    setRol(newRol);
    setToken(newToken);
  }, []);

  const signOut = useCallback(async () => {
    await AsyncStorage.multiRemove(["@token", "@rol"]);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, rol, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
