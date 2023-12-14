import mongoose from "mongoose";
const Schema=mongoose.Schema;

const imagesSchema=new Schema({
    image:String
});

const gallery=mongoose.model("gallery",imagesSchema);

export default gallery;