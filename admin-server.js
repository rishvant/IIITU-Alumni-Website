import express from "express";
import ejs from "ejs";

const app=express();
const port=3000;

app.set("view engine","ejs");
app.use(express.static("public"));

app.get("/admin",(req,res)=>{
    res.render("admin-gallery");
});


app.listen(port,()=>{
    console.log("Listening on port 3000");
})