import { Routes, Route, useLocation } from "react-router-dom";
import {
  Home,
  Login,
  Register,
  UserDashboard,
} from "./pages";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import SearchBar from "./components/SearchBar.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TopScroll from "./components/TopScroll.jsx";
import AdBanner from "./components/ad/AdBanner.jsx";

const App = () => {
  const location = useLocation();
  const isUserRoute = location.pathname.startsWith("/user");
  return (
    <div className="relative min-h-screen">
      <ToastContainer position="top-left" autoClose={1500} />
      <Navbar />
      <AdBanner />
      <TopScroll />

      {location.pathname === "/shop" && <SearchBar />}

      {/* Apply padding only if not in /user */}
      <div className={isUserRoute ? "" : "px-4 lg:px-[4vw]"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/shop" element={<Collection />} />
          <Route path="/product/:productId" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/place-order/:orderId" element={<PlaceOrder />} />
          <Route path="/orders/:orderId" element={<OrderDetail />} />
          <Route path="/policy" element={<Policy />} />
          <Route path="/user/*" element={<UserDashboard />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/stripe" element={<Stripe />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>

      <Footer />
    </div>
  );
};

export default App;
