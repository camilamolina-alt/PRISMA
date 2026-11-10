import HomePromotor from "../../components/HomePromotor";
import HomeSupervisor from "../../components/HomeSupervisor";
import HomeAdmin from "../../components/HomeAdmin";
import { useAuthSession } from "../../providers/AuthProvider";
import { Text } from "react-native";

export default function HomeScreen() {
  const { rol } = useAuthSession();

  return rol === "supervisor" ? <HomeSupervisor /> : rol === "admin" ? <HomeAdmin /> : <HomePromotor />;
}