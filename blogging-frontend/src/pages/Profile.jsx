import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../api/axios";
import Loader from "../components/Loader";
import { Link } from "react-router-dom";

export default function Profile() {
  const { user } = useContext(AuthContext);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUserBlogs = async () => {
    try {
      const res = await API.get("/blogs");
      // Filter blogs by author id (because backend doesn't have author filter yet)
      const myBlogs = res.data.filter(
        (b) => b.author?._id === user?.id || b.author?._id === user?._id
      );
      setBlogs(myBlogs);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchUserBlogs();
  }, [user]);

  if (!user) {
    return (
      <div className="h-screen flex justify-center items-center">
        <p className="text-gray-600">Please login to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4">

      {/* ✅ Profile Header */}
      <div className="bg-white shadow p-6 rounded-xl mb-6">
        <h2 className="text-2xl font-bold">👤 {user.name}</h2>
        <p className="text-gray-600 mt-1">📧 {user.email}</p>
      </div>

      <h3 className="text-xl font-bold mb-3">Your Blogs</h3>

      {loading ? (
        <Loader />
      ) : blogs.length === 0 ? (
        <p className="text-gray-500 text-center">No blogs created yet.</p>
      ) : (
        <div className="space-y-4">
          {blogs.map((b) => (
            <div
              key={b._id}
              className="p-4 bg-white shadow rounded-xl flex flex-col md:flex-row justify-between"
            >
              <div>
                <h2 className="text-lg font-semibold">{b.title}</h2>
                <p className="text-gray-600 text-sm">
                  {new Date(b.createdAt).toDateString()}
                </p>
              </div>

              <div className="flex gap-3 mt-3 md:mt-0">
                <Link
                  to={`/blog/${b._id}`}
                  className="px-3 py-1 bg-blue-600 text-white rounded"
                >
                  View
                </Link>
                <Link
                  to={`/edit/${b._id}`}
                  className="px-3 py-1 bg-yellow-500 text-white rounded"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
