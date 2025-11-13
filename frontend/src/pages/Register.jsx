import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { userApi } from "../../api/api";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const navigate = useNavigate();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      if (password !== password2) {
        toast.error("Passwords do not match");
        return;
      }

      const response = await userApi.register(email, password);

      if (response.data.success) {
        toast.success("Account registered successfully!");
        navigate("/login");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="bg-white border border-gray-300 rounded-xl shadow-inner w-full max-w-md p-8">
        <h1 className="text-3xl font-semibold mb-6 text-center text-black tracking-wide">
          REGISTER ACCOUNT
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

          <div>
            <label className="block text-black font-semibold mb-1">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <input
              onChange={(e) => setPassword2(e.target.value)}
              value={password2}
              className="w-full border border-gray-300 rounded-lg p-2 bg-white text-black focus:outline-none focus:border-gray-500"
              type="password"
              placeholder="Re-enter password"
              required
            />
          </div>

          <button
            className="w-full py-2 rounded-md bg-black text-white font-medium hover:bg-gray-800 transition-all shadow-md"
            type="submit"
          >
            Register
          </button>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="w-full py-2 rounded-md border border-gray-300 text-black hover:bg-gray-100 transition-all"
          >
            Back to Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
