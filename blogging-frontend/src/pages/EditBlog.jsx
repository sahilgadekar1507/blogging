import { useState, useEffect } from "react";
import API from "../api/axios";
import { useNavigate, useParams } from "react-router-dom";

export default function EditBlog() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");

  useEffect(() => {
    const loadBlog = async () => {
      const res = await API.get(`/blogs/${id}`);
      setTitle(res.data.title);
      setContent(res.data.content);
      setTags(res.data.tags.join(", "));
    };
    loadBlog();
  }, []);

  const updateBlog = async (e) => {
    e.preventDefault();

    await API.put(`/blogs/${id}`, {
      title,
      content,
      tags: tags.split(",").map((t) => t.trim()),
    });

    navigate(`/blog/${id}`);
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Edit Blog</h2>

      <form onSubmit={updateBlog} className="space-y-4">
        <input
          className="w-full p-3 border rounded-lg"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="w-full p-3 border rounded-lg h-40"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <input
          className="w-full p-3 border rounded-lg"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />

        <button className="w-full bg-green-600 text-white p-3 rounded-lg">
          Update Blog
        </button>
      </form>
    </div>
  );
}
