import { useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErr("");

    try {
      await API.post("/auth/register", { name, email, password });
      navigate("/login"); // redirect after success
    } catch (error) {
      setErr(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Register</h2>

        {err && <p className="text-red-500 text-sm mb-3">{err}</p>}

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-300"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

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
            placeholder="Password (min 5 char)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition">
            Register
          </button>
        </form>

        <p className="text-center text-sm mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
