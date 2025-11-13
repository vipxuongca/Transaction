import { TransactionContext } from "./TransactionContext";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const TransactionContextProvider = (props) => {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  // Sync token with localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  const value = {
    token,
    setToken,
  };

  return (
    <TransactionContext.Provider value={value}>
      {props.children}
    </TransactionContext.Provider>
  );
};

export default TransactionContextProvider;
