import AsyncStorage from "@react-native-async-storage/async-storage";
import { cargarServidor } from "../config/api";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type Rol = "promotor" | "supervisor" | "admin";

type AuthContextType = {
  token: string | null;
  rol: Rol;
  isLoading: boolean;
  signIn: (token: string, rol: Rol) => Promise<void>;
  signOut: () => Promise<void>;
  correo: string | null;
  actualizarRol: (nuevo: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  token: null,
  rol: "promotor",
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
  correo: null,
  actualizarRol: async () => {},
});

const aRol = (valor: string | null): Rol =>
  valor === "supervisor" ? "supervisor" : valor === "admin" ? "admin" : "promotor";

function correoDelToken(token: string | null) {
  if (!token) return null;
  try {
    return atob(token.replace("Basic ", "")).split(":")[0];
  } catch {
    return null;
  }
}

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
        await cargarServidor();
        const [[, savedToken], [, savedRol]] = await AsyncStorage.multiGet([
          "@token",
          "@rol",
        ]);
        setToken(savedToken || null);
        // Si no hay rol guardado ingresa al promotor
        setRol(
          savedRol === "supervisor"
            ? "supervisor"
            : savedRol === "admin"
            ? "admin"
            : "promotor"
        );
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

  const actualizarRol = useCallback(async (nuevo: string) => {
    const r = aRol(nuevo);
    await AsyncStorage.setItem("@rol", r);
    setRol(r);
  }, []);

  const correo = correoDelToken(token);

  return (
    <AuthContext.Provider value={{ token, rol, isLoading, signIn, signOut, correo, actualizarRol }}>
      {children}
    </AuthContext.Provider>
  );
}
