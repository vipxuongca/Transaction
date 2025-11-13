import { Routes, Route, useLocation } from "react-router-dom";
import { Login, Register, Report, Transaction, User, NotFound } from "./pages";
import Navbar from "./components/Navbar.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TopScroll from "./components/TopScroll.jsx";

const App = () => {
  const location = useLocation();
  const isUserRoute = location.pathname.startsWith("/user");
  const token = localStorage.getItem("token") || ""; // Example token check

  return (
    <div className="relative min-h-screen">
      <ToastContainer position="top-left" autoClose={1500} />
      <Navbar />
      <TopScroll />

      {token === "" ? (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
          <Login />
        </div>
      ) : (
        <>
          <div className={isUserRoute ? "" : "px-4 lg:px-[4vw]"}>
            <Routes>
              <Route path="/register" element={<Register />} />
              <Route path="/report" element={<Report />} />
              <Route path="/transaction" element={<Transaction />} />
              <Route path="/" element={<Transaction />} />
              <Route path="/user" element={<User />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
