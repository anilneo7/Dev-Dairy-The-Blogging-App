const {Router}=require("express");
const multer=require("multer");
const path=require("path");
const router=Router();
const Blog=require("../models/blog");
const Comment=require("../models/comment");

const storage=multer.diskStorage({
  destination:function (req,file,cb) {
    cb(null,`./public/uploads/`);
  },
  filename:function (req,file,cb){
    const filename=`${Date.now()}-${file.originalname}`;
    cb(null,filename);
  }
});

//multer instance
const upload=multer({storage:storage});

router.get("/add-new",(req,res)=>{
  return res.render("addBlog",{
    user:req.user,
  })
})

router.post("/",upload.single('coverImage'),async (req,res)=>{
  const {title,body}=req.body;
  const blog=await Blog.create({
    title,
    body,
    coverImageURL:`/uploads/${req.file.filename}`,
    createdBy: req.user._id, // Associate the blog with the current user
  })
  
  //redirecting user to it's blog
  return res.redirect(`/blog/${blog._id}`);
});

// router.get("/:id",async (req,res)=>{
//   const blog=await Blog.findById(req.params.id).populate("createdBy");
//   return res.render("blog",{
//     user:req.user,
//     blog
//   })
// })

router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate("createdBy"); // Populate user details

    //for fetching comments
    const comments=await Comment.find({blogId:req.params.id}).populate("createdBy");
    console.log("comment",comments);
    if (!blog) {
      return res.status(404).send("Blog not found");
    }
    return res.render("blog", {
      user: req.user,
      blog,
      comments
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("An error occurred");
  }
});

//for comments
router.post("/comment/:blogId",async(req,res)=>{
  try {
    // Creating a new comment with the content, blogId, and user ID
    await Comment.create({
      content: req.body.content,
      blogId: req.params.blogId,
      createdBy: req.user._id,
    });
    // Redirecting to the blog page after successful comment creation
    return res.redirect(`/blog/${req.params.blogId}`);
  } catch (error) {
    console.error(error);
    return res.status(500).send("An error occurred while posting the comment.");
  }
})


module.exports=router;
