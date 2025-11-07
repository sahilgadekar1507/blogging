import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Blogs from "./pages/Blogs";
import CreateBlog from "./pages/CreateBlog";
import SingleBlog from "./pages/SingleBlog";
import Navbar from "./components/Navbar";
import EditBlog from "./pages/EditBlog";
import Profile from "./pages/Profile";
// import CreateButton from "./components/CreateButton";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      {/* <CreateButton /> */}
      <Routes>
        <Route path="/" element={<Blogs />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/blog/:id" element={<SingleBlog />} />
        <Route path="/create" element={<CreateBlog />} />
        <Route path="/edit/:id" element={<EditBlog />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}
