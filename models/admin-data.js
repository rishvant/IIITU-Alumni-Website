import mongoose from "mongoose";
import bcrypt from "bcrypt";

const Schema=mongoose.Schema;

const adminSchema=new Schema({
    username:String,
    password:String
});

adminSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

const admin=mongoose.model("admin",adminSchema);

export default admin;