import mongoose from "mongoose";
const Schema=mongoose.Schema;

const eventSchema=new Schema({
    title:String,
    summary: String,
    date: Date,
    detail:String,
    image:String,
});

const event=mongoose.model("event",eventSchema);

export default event;