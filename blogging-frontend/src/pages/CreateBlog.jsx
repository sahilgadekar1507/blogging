import { useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function CreateBlog() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/blogs", {
        title,
        content,
        tags: tags.split(",").map((t) => t.trim()),
      });
      navigate("/");
    } catch (err) {
      console.log(err.response?.data);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Create New Blog</h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          type="text"
          className="w-full p-3 border rounded-lg"
          placeholder="Blog Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          className="w-full p-3 border rounded-lg h-40"
          placeholder="Blog Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />

        <input
          type="text"
          className="w-full p-3 border rounded-lg"
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />

        <button className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700">
          Publish Blog
        </button>
      </form>
    </div>
  );
}
