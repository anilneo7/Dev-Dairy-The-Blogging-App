const {Schema,model}=require("mongoose");
const {createHmac,randomBytes}=require("crypto");
const {createTokenForUser,validateToken}=require("../services/authentication");

const userSchema=new Schema({
  fullName:{
    type:String,
    required:true
  },
  email:{
    type:String,
    required:true,
    unique:true
  },
  password:{
    type:String,
    required:true
  },
  salt:{
    type:String,
  },
  profileImageURL:{
    type:String,
    default:"/images/defaultProfileImg.png"
  },
  role:{
    type:String,
    enum:["USER","ADMIN"],
    default:"USER"
  }
},{timestamps:true});

//using salt and pepper hash

userSchema.pre("save",function(next){
  const user=this;//this= current user
  if(!user.isModified("password")) return;

  //if password is modified created it's hash
  const salt=randomBytes(16).toString();
  const hashedPassword=createHmac("sha256",salt)
  .update(user.password)
  .digest("hex");

  this.salt=salt;
  this.password=hashedPassword;
  
  next();
})

//static function to validate user entered password
userSchema.static("matchPasswordAndGenerateToken",async function(email,password){
  const user=await this.findOne({email});
  if(!user) throw new Error('User not found!');

  //if user's email matches then validate it

  //1-get user's salt & password form DB
  const salt=user.salt;
  const hashedPassword=user.password;

  //2-hash user entered password using same algo and salt
  const userProvidedHash=createHmac("sha256",salt)
  .update(password)
  .digest("hex");

  //3-compare both hashes
  if(hashedPassword!==userProvidedHash) throw new Error("Incorrect password!")

//  //if password matches then return a user object.
//   return {...user._doc,password: undefined ,salt: undefined};
//   //why _doc in ...user._doc?

  //if password matches, create jwt for user
  const token=createTokenForUser(user);
  return token;
});


//model
const User=model('user',userSchema);

module.exports={User};