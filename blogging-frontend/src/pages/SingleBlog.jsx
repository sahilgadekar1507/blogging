import { useEffect, useState, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import Loader from "../components/Loader";
import { AuthContext } from "../context/AuthContext";

export default function SingleBlog() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // ✅ Safe context check
  const auth = useContext(AuthContext);
  const user = auth?.user;

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBlog = async () => {
    try {
      const res = await API.get(`/blogs/${id}`);
      setBlog(res.data);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBlog();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold">{blog.title}</h1>
      <p className="text-gray-600 mt-2">
        {blog.author?.name} • {new Date(blog.createdAt).toDateString()}
      </p>

      <p className="mt-6 text-lg">{blog.content}</p>

      <div className="flex flex-wrap gap-2 mt-4">
        {blog.tags?.map((t, i) => (
          <span key={i} className="px-3 py-1 bg-gray-200 rounded-full text-sm">
            #{t}
          </span>
        ))}
      </div>

      {/* ✅ Only show edit/delete if user is author */}
      {user && user.id === blog.author?._id && (
        <div className="flex gap-4 mt-6">
          <Link
            to={`/edit/${blog._id}`}
            className="px-4 py-2 bg-yellow-500 text-white rounded"
          >
            Edit
          </Link>
          <button
            onClick={async () => {
              await API.delete(`/blogs/${blog._id}`);
              navigate("/");
            }}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
