import { useContext } from "react";
import { assets } from "../assets/assets";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { TransactionContext } from "../context/TransactionContext";
import { FiLogOut } from "react-icons/fi";
import Swal from "sweetalert2";

const Navbar = () => {
  const baseClass = "flex flex-col items-center gap-1 group";
  const { token, setToken } = useContext(TransactionContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    Swal.fire({
      title: "Bạn có chắc muốn đăng xuất?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Đăng xuất",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) {
        setToken(null); // Clear token
        Swal.fire("Đã đăng xuất!", "", "success");
        navigate("/login");
      }
    });
  };

  return (
    <div className="flex items-center justify-between py-3 px-4 md:px-8 sticky top-0 z-50 bg-white text-black shadow-lg">
      <Link to="/">
        <img src={assets.logo} alt="Logo" className="w-28 h-auto" />
      </Link>

      <div className="flex flex-col items-center">
        <ul className="hidden sm:flex gap-6 text-base">
          {[
            { name: "GIAO DỊCH", path: "/transaction" },
            { name: "BÁO CÁO", path: "/report" },
          ].map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `${baseClass} ${isActive ? "active" : ""} hover:text-amber-500 transition-colors`
              }
            >
              <p className="text-2xl">{item.name}</p>
              <hr className="w-2/4 border-none h-[1.5px] bg-amber-400 invisible group-[.active]:visible group-hover:visible transition-all" />
            </NavLink>
          ))}
        </ul>
      </div>

      {/* LOGOUT BUTTON */}
      <div className="flex items-center gap-6">
        {token ? (
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-12 h-12 rounded-none border border-black bg-white text-black hover:bg-gray-100 transition-all"
          >
            <FiLogOut className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="flex items-center justify-center w-12 h-12 rounded-none border border-black bg-white text-black hover:bg-gray-100 transition-all"
          >
            <FiLogOut className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
