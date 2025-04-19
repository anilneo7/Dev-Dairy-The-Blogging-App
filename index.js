require("dotenv").config();
const express = require("express");
const path=require("path");//module for template engine
const app=express();
const userRoute=require("./routes/user");
const blogRoute=require("./routes/blog");
const mongoose=require("mongoose");
const cookieParser=require("cookie-parser");
const {checkForAuthenticationCookie}=require("./middlewares/authentication");
const Blog=require("./models/blog")

const PORT=8008;
                    

//connecting to mongoose
mongoose.connect(process.env.MONGO_URL)
.then((e)=>console.log("MongoDB Connected!"));

//middleware
// Middleware to parse JSON bodies
app.use(express.json());
// Middleware to parse URL-encoded bodies (for form submissions)
app.use(express.urlencoded({ extended: true }));
//is cookie-parser a middleware?
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));
//middleware that tells express that serve public folder as static
app.use(express.static(path.resolve("./public")));


//setting templating engine
app.set("view engine","ejs");
app.set("views",path.resolve("./views"));

//routes
//why we are passing user object here?
//ans-The user object is being passed to the template (home.ejs) to make user-specific data available when rendering the view.
app.get("/",async (req,res)=>{
  const allBlogs=await Blog.find({});
  res.render("home",{
    user:req.user,
    blog:allBlogs,
  });
})

//REGISTERING ROUTES

//any route starting from '/user' (eg '/user/signin') will use userRoute
app.use("/user",userRoute);
app.use("/blog",blogRoute);


app.listen(PORT,()=>{console.log(`Server started on port ${PORT}`);});
