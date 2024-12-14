import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoutes = () => {
  const { currentUser } = useSelector((state) => state.user);
  if (!currentUser) {
    return <Navigate to={"/sign-in"} />;
  }
  return <Outlet />;
};

export default PrivateRoutes;
