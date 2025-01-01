import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import Signin from "./pages/Signin";
import SignUp from "./pages/SignUp";
import Profile from "./pages/Profile";
import Header from "./components/Header";
import PrivateRoutes from "./components/PrivateRoutes";
import MyKostList from "./pages/MyKostList";
import AddKost from "./pages/AddKost";
import UpdateKost from "./pages/UpdateKost";

const App = () => {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sign-in" element={<Signin />} />
        <Route path="/sign-up" element={<SignUp />} />

        <Route element={<PrivateRoutes />}>
          <Route path="/my-kost" element={<MyKostList />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/addkost" element={<AddKost />} />
          <Route path="/update-kost/:id" element={<UpdateKost />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
