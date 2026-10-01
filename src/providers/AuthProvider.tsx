import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type AuthContextType = {
  token: string | null;
  isLoading: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  token: null,
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
  const [isLoading, setIsLoading] = useState(true);

  // Al abrir la app: buscar si quedó una sesión guardada
  useEffect(() => {
    async function loadToken() {
      try {
        const saved = await AsyncStorage.getItem("@token");
        setToken(saved || null);
      } catch (e) {
        console.warn(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadToken();
  }, []);

  const signIn = useCallback(async (newToken: string) => {
    await AsyncStorage.setItem("@token", newToken);
    setToken(newToken);
  }, []);

  const signOut = useCallback(async () => {
    await AsyncStorage.removeItem("@token");
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
