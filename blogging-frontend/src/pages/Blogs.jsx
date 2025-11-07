import { useEffect, useState } from "react";
import API from "../api/axios";
import Loader from "../components/Loader";
import { Link } from "react-router-dom";

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/blogs?search=${search}`);
      setBlogs(res.data);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBlogs();
  }, [search]);

  return (
    <div className="max-w-3xl mx-auto p-4">
        
      
      {/* ✅ Search Bar */}
      <input
        type="text"
        placeholder="Search blogs..."
        className="w-full p-3 border rounded-lg mb-4"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <Loader />
      ) : (
        <div className="space-y-4">
          {blogs.length === 0 && (
            <p className="text-center text-gray-500">No blogs found.</p>
          )}

          {blogs.map((b) => (
            <Link
              to={`/blog/${b._id}`}
              key={b._id}
              className="block p-4 bg-white rounded-xl shadow hover:shadow-md transition"
            >
              <h2 className="text-xl font-bold">{b.title}</h2>
              <p className="text-gray-700 mt-2">{b.content.slice(0, 120)}...</p>

              <p className="mt-2 text-sm">
                ✍️ {b.author?.name} • {new Date(b.createdAt).toDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
