import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  };

  return (
    <nav className="w-full p-4 bg-gray-600 text-white flex justify-between items-center">
      {/* Logo */}
      <Link to="/" className="text-xl font-bold">
        Blog App
      </Link>

      {/* Right Side Buttons */}
      <div className="flex items-center gap-4">

        {/* ✅ If NO USER → Show Login + Register */}
        {!user && (
          <>
            <Link to="/login" className="hover:underline">
              Login
            </Link>
            <Link to="/register" className="hover:underline">
              Register
            </Link>
          </>
        )}

        {/* ✅ If USER LOGGED IN → Show Profile + Logout */}
        {user && (
          <>
           <Link
      to="/create"
      className="bg-yellow-500 px-3 py-1 rounded hover:bg-yellow-600 text-black"
    >
      Create Blog
    </Link>
            <Link to="/profile" className="hover:underline">
              Profile
            </Link>
               

            

            <button
              onClick={handleLogout}
              className="bg-gray-500 px-3 py-1 rounded hover:bg-gray-400"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
