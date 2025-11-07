import { useState, useContext } from "react";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { setUser } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErr("");

    try {
      const res = await API.post("/auth/login", { email, password });

      // Save token + user
      localStorage.setItem("token", res.data.accessToken || res.data.accessToken);
      localStorage.setItem("user", JSON.stringify(res.data.user || {}));

      setUser(res.data.user);
      navigate("/");
    } catch (error) {
      setErr(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>

        {err && <p className="text-red-500 text-sm mb-3">{err}</p>}

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-300"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-300"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition">
            Login
          </button>
        </form>

        <p className="text-center text-sm mt-4">
          Don’t have an account?{" "}
          <a href="/register" className="text-blue-600 underline">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}
