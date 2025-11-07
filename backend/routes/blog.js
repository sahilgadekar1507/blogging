import express from 'express';
import Blog from '../models/Blog.js';
import auth from '../middleware/auth.js';

const router = express.Router();    
router.get("/", async (req, res) => {


    try {
        const { search } = req.query;

        if (!search) {
            // Return all blogs if no search term is provided
            const blogs = await Blog.find({}).populate("author", "name email");
            return res.json(blogs);
        }

        const searchRegex = new RegExp(search, "i");

        let contentMatchBlogs = await Blog.find(
            { $text: { $search: search } },
            { score: { $meta: "textScore" } } // get score for sorting
        )
        .sort({ score: { $meta: "textScore" } }) // sort by relevance
        .populate("author", "name email");

        let tagMatchBlogs = await Blog.find({ 
            tags: { $regex: searchRegex } 
        }).populate("author", "name email");

        const allBlogsForAuthorCheck = await Blog.find({}).populate("author", "name email");

        const authorMatchBlogs = allBlogsForAuthorCheck.filter((b) => {
            // Check if author and author name exist, and match the regex
            return (
                b.author && 
                b.author.name && 
                b.author.name.match(searchRegex)
            );
        });


        // --- 4. Combine and Deduplicate Results ---
        const allResults = [
            ...contentMatchBlogs, 
            ...tagMatchBlogs, 
            ...authorMatchBlogs
        ];
        
        const uniqueBlogIds = new Set();
        const finalBlogs = allResults.filter(blog => {
            const idString = blog._id.toString();
            if (uniqueBlogIds.has(idString)) {
                return false; // Skip duplicates
            }
            uniqueBlogIds.add(idString);
            return true; // Keep unique blog
        });

        return res.json(finalBlogs);

    } catch (error) {
        // console.error("Search Error:", error);
        res.status(500).json({ message: "Server error during search" });
    }
});


router.post("/", auth, async (req, res) => {
    const {title, content, tags } = req.body;

    try {
        const blog = await Blog.create({
            title,
            content,
            tags,
            author: req.user.id,
        });
        
        res.status(201).json({msssage: "Blog Created!", blog});
    } catch (error) {
        // console.error(error);
        res.status(500).json({message: "Server error!"});
    }
});




router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate(
      "author",
      "name email"
    );

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    let blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // check if logged-in user is blog author
    if (blog.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to update this blog" });
    }

    const { title, content, tags } = req.body;
    blog.title = title || blog.title;
    blog.content = content || blog.content;
    blog.tags = tags || blog.tags;

    await blog.save();

    res.json({ message: "Blog updated", blog });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // check author
    if (blog.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this blog" });
    }

    await blog.deleteOne();

    res.json({ message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;