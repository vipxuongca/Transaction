import { TransactionContext } from "./TransactionContext";
import { useState, useContext, useEffect } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { userApi, transactionApi } from "../../api/api";

const TransactionContextProvider = (props) => {
  // import context
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  // states

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
