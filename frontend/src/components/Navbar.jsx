import { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { NavLink, Link } from "react-router-dom";
import { TransactionContext } from "../context/TransactionContext";
import { FiUser } from "react-icons/fi";

const Navbar = () => {
  const baseClass = "flex flex-col items-center gap-1 group";
  const [visible, setVisible] = useState(false);
  const { token } = useContext(TransactionContext);

  return (
    <div className="flex items-center justify-between py-3 px-4 md:px-8 sticky top-0 z-50 bg-white text-black shadow-lg">
      <Link to="/">
        <img src={assets.logo} alt="Logo" className="w-28 h-auto" />
      </Link>

      <div className="flex flex-col items-center">
        <img
          src={assets.company}
          alt="Company Name"
          className="md:h-12 mb-3 object-contain"
        />
        <ul className="hidden sm:flex gap-6 text-base">
          {[
            { name: "GIAO DỊCH", path: "/transaction" },
            { name: "BÁO CÁO", path: "/report" },
          ].map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `${baseClass} ${
                  isActive ? "active" : ""
                } hover:text-amber-500 transition-colors`
              }
            >
              <p>{item.name}</p>
              <hr className="w-2/4 border-none h-[1.5px] bg-amber-400 invisible group-[.active]:visible group-hover:visible transition-all" />
            </NavLink>
          ))}
        </ul>
      </div>

      {/* LOGIN BUTTON */}
      <div className="flex items-center gap-6">
        <Link to={!token ? "/login" : "/user"}>
          <button className="flex items-center justify-center w-12 h-12 rounded-none border border-black bg-white text-black">
            <FiUser className="w-5 h-5" />
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
