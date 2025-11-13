import React, { useEffect, useState } from "react";
import { userApi } from "../../api/api";
import Swal from "sweetalert2";

const UserPage = () => {
  const [user, setUser] = useState(null);

  // Fetch user info
  const fetchUser = async () => {
    try {
      const res = await userApi.single(); // use the proper API helper
      setUser(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to fetch user info", "error");
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // Logout user
  const logout = async () => {
    try {
      await userApi.logout();
    } catch (err) {
      console.error("Logout failed:", err);
    }
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">User Profile</h1>
      <div className="border p-4 rounded">
        <p>
          <span className="font-semibold">Email:</span> {user.email}
        </p>
        <p>
          <span className="font-semibold">Provider:</span>{" "}
          {user.provider || "local"}
        </p>
        <p>
          <span className="font-semibold">Provider ID:</span>{" "}
          {user.provider_id || "-"}
        </p>
        <button
          onClick={logout}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default UserPage;
