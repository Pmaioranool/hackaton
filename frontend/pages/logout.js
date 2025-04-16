import { useEffect, useContext } from "react";
import { useRouter } from "next/router";
import UserContext from "./component/UserContext";

const Logout = () => {
  const router = useRouter();
  const { logout } = useContext(UserContext);

  useEffect(() => {
    logout();
    router.push("/");
  }, [logout, router]);

  return null;
};

export default Logout;
