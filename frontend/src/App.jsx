import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import Signin from "./pages/Signin";
import Profile from "./pages/Profile";
import Header from "./components/Header";
import PrivateRoutes from "./components/PrivateRoutes";
import MyKostList from "./pages/MyKostList";
import AddKost from "./pages/AddKost";
import UpdateKost from "./pages/UpdateKost";
import Kost from "./pages/Kost";
import Search from "./pages/Search";
import CheckoutPage from "./pages/CheckoutPage";
import MyOrder from "./pages/MyOrder";
import Tenant from "./pages/Tenant";
import Favorite from "./pages/Favorite";
import Stats from "./pages/Stats";
import Features from "./pages/Features";
import Signup from "./pages/Signup";

const App = () => {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sign-in" element={<Signin />} />
        <Route path="/sign-up" element={<Signup />} />
        <Route path="/kost/:id" element={<Kost />} />
        <Route path="/search" element={<Search />} />
        <Route path="/checkout/:id" element={<CheckoutPage />} />
        <Route path="/favorit" element={<Favorite />} />
        <Route path="/features" element={<Features />} />

        <Route element={<PrivateRoutes />}>
          <Route path="/my-kost" element={<MyKostList />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/addkost" element={<AddKost />} />
          <Route path="/update-kost/:id" element={<UpdateKost />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/my-orders" element={<MyOrder />} />
          <Route path="/tenant" element={<Tenant />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
