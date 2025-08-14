import { Navigate, Outlet } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "../../../firebase";

export default function PrivateRoutes() {
  const [loading, setLoading] = useState(true);
  const [userLogged, setUserLogged] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUserLogged(user);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return <div className="p-4">Carregando...</div>;

  return userLogged ? <Outlet /> : <Navigate to="/Home" />;
}
