import mongoose from "mongoose";
const Schema=mongoose.Schema;

const profileSchema=new Schema({
    name:String,
    father_name:String,
    profession:String,
    gender:String,
    email:String,
    roll:Number,
    phone:Number,
    dob:Date,
    course:String,
    branch:String,
    year:Number,
    linkedin:String,
    instagram:String,
    github:String,
    company:String,
    image:String,
    verified:{
        type:Boolean,
        default:false,
    },
});

const profile=mongoose.model("profile",profileSchema);

export default profile;