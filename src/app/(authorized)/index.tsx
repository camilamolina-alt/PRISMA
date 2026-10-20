import HomePromotor from "../../components/HomePromotor";
import HomeSupervisor from "../../components/HomeSupervisor";
import { useAuthSession } from "../../providers/AuthProvider";

export default function HomeScreen() {
  const { rol } = useAuthSession();

  // Cada rol ve su propio inicio
  return rol === "supervisor" ? <HomeSupervisor /> : <HomePromotor />;
}