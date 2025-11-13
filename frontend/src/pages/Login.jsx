import { useState, useContext, useEffect } from "react";
import { TransactionContext } from "../context/TransactionContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { userApi } from "../../api/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { token, setToken } = useContext(TransactionContext);
  const navigate = useNavigate();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const response = await userApi.login(email, password);

      if (response.data.success) {
        setToken(response.data.token);
        toast.success("Login successful!");
        setTimeout(() => navigate("/"), 1000);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Login failed. Please try again.");
    }
  };

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
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="bg-white border border-gray-300 rounded-xl shadow-inner w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-center text-black mb-6 border-b border-gray-300 pb-2">
          LOGIN
        </h1>

        <form onSubmit={onSubmitHandler} className="space-y-5">
          <div>
            <label className="block text-black font-semibold mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              className="w-full border border-gray-300 rounded-lg p-2 bg-white text-black focus:outline-none focus:border-gray-500"
              type="email"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-black font-semibold mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              className="w-full border border-gray-300 rounded-lg p-2 bg-white text-black focus:outline-none focus:border-gray-500"
              type="password"
              placeholder="Enter password"
              required
            />
          </div>

          <button
            className="w-full py-2 rounded-md bg-black hover:bg-gray-800 text-white font-medium transition-all"
            type="submit"
          >
            Login
          </button>

          <button
            type="button"
            onClick={() => navigate("/register")}
            className="w-full py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-black font-medium transition-all"
          >
            Register
          </button>

          <button
            type="button"
            onClick={onGoogleLogin}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-md bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium shadow-sm transition-all mt-4"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google Logo"
              className="w-5 h-5"
            />
            Đăng nhập với Google
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
