import { useContext, useEffect } from "react";
import { TransactionContext } from "../context/TransactionContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { setToken } = useContext(TransactionContext);
  const navigate = useNavigate();

  const onGoogleLogin = () => {
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    window.open(
      "http://localhost:8080/auth/google/login",
      "GoogleLogin",
      `width=${width},height=${height},top=${top},left=${left}`
    );
  };

  useEffect(() => {
    const messageListener = (event) => {
      if (event.origin !== "http://localhost:8080") return;
      const { token, email } = event.data;
      if (token) {
        setToken(token);
        toast.success(`Logged in as ${email}`);
        navigate("/");
        window.removeEventListener("message", messageListener);
      }
    };

    window.addEventListener("message", messageListener);
    return () => window.removeEventListener("message", messageListener);
  }, [navigate, setToken]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6 sm:px-12">
      <div className="bg-white border border-gray-300 rounded-2xl shadow-md w-full max-w-2xl p-12 sm:p-16">
        <h1 className="text-4xl font-bold text-center text-black mb-12 border-b border-gray-300 pb-4">
          Đăng nhập
        </h1>

        <div className="flex flex-col items-center gap-6">
          <button
            type="button"
            onClick={onGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-4 px-8 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 font-medium shadow-md transition-all text-lg"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google Logo"
              className="w-6 h-6"
            />
            Đăng nhập với Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
