import express from "express";
import bodyParser from "body-parser";
import ejs from "ejs";
import profile from "./models/alumni-data.js";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import gallery from "./models/gallery.js";
import admin from "./models/admin-data.js";
import { compareSync } from "bcrypt";
import event from "./models/events.js";
import session from "express-session";
import flash from "connect-flash";
import passport from "passport";
import configurePassport from "./config/passport.js";
import createRoutes from "./routes/routes.js";

const app=express();
const port = 3000;

app.use(express.json());
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'your-secret-key',
    resave: true,
    saveUninitialized: true
  }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

configurePassport(passport);

app.use('/', createRoutes(passport));

mongoose.connect("mongodb://127.0.0.1:27017/profile")
.then(()=>{
    console.log("Connected to mongodb successfully");
})
.catch(err=>{
    console.log("Error:",err);
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/admin-login');
}

/* Admin Panel */

app.get("/admin-login", (req, res) => {
    res.render("admin-login");
})

app.post("/admin-login",(req,res)=>{
    const user=req.body.username;
    const pass=req.body.password;
    admin.findOne({username:user})
    .then(foundUser=>{
        if(foundUser.password===pass){
            res.render("admin-adduser");
        }
    })
    .catch(err=>{
        console.log("Error finding",err);
    });
});

app.get("/admin-adduser", ensureAuthenticated, (req,res)=>{
    res.render("admin-adduser");
});

app.get("/admin", ensureAuthenticated, async (req,res)=>{
    try{
        const data= await profile.find();
        const dataImages= await gallery.find();
        res.render("admin-user",{data,dataImages});
        }
        catch(err){
            console.log("Error:",err);
            res.render("home");
        }
    });

app.post('/admin-user/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        // Update user verification status
        const user = await profile.findByIdAndUpdate({_id:userId}, { verified: true });

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.json({ message: 'User verified successfully.' });
        console.log("Verified");
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get("/admin-userview", ensureAuthenticated, (req, res) => {
    res.render("admin-user-view");
});


const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: (req, file, callback) => {
      callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    },
  });
const upload = multer({ storage });

app.post("/admin-adduser", upload.single('image'), (req,res)=>{
    const {name,roll,gender,course,branch,phone,father_name,email,dob,year,company,linkedin,instagram}=req.body;
    const image = req.file.filename;
    const newAlumni=new profile({name,roll,gender,course,branch,phone,father_name,email,dob,year,company,linkedin,instagram,image});
    newAlumni.save()
    .then(done=>{
        console.log("saved");
        res.redirect("/admin-adduser");
    })
    .catch(err=>{
        console.log("Error:",err);
    })
});

/* Admin Gallery */

app.get("/admin/gallery", ensureAuthenticated, (req,res)=>{
    const Images=gallery.find()
    .then(Images=>{
        res.render("admin-gallery",{Images});
    })
    .catch(err=>{
        console.log("Error:",err);
    });
});

app.post("/admin/gallery", upload.single('image'), (req,res)=>{
    const image = req.file.filename;
    const newImage=new gallery({image});
    newImage.save()
    .then(done=>{
        res.redirect("/admin-gallery");
    })
    .catch(err=>{
        console.log("Error:", err);
    })
});

app.delete("/admin/gallery/:imageId", (req, res) => {
    const imageId = req.params.imageId;
    const remove=gallery.findOneAndDelete({_id:imageId})
    .then((deletedImage) => {
        if (deletedImage) {
            res.status(200).json({ message: "Image deleted successfully" });
        } else {
            res.status(404).json({ error: "Image not found" });
        }
    })
    .catch(err => {
        console.log("Error:", err);
        res.status(500).json({ error: "Unable to delete the image" });
    });
});

/* Admin Events */

app.get("/admin/events", ensureAuthenticated, (req, res) => {
    const events = event.find()
        .then(events => {
            res.render("admin-events", { events });
        })
        .catch(err => {
            console.log("Error:", err);
        });
});

app.get("/admin/events/add", ensureAuthenticated, (req, res) => {
    res.render("admin-addevent");
});

app.get("/admin/events/:id", (req, res) => {
    const eventId = req.params.id;
    event.findById(eventId)
        .then(event => {
            res.render("admin-editevent", { event });
        })
        .catch(err => {
            console.log("Error:", err);
        });
});

app.post("/admin/events/add", upload.single('image'), (req, res) => {
    const { title, summary, date, detail } = req.body;
    const image = req.file.filename;
    const newEvent = new event({ title, summary, date, detail, image })
    newEvent.save()
        .then(event => {
            res.redirect("/admin/events");
        })
        .catch(err => {
            console.log("Error:", err);
        });
});

app.post("/admin/events/:id", upload.single('image'), (req, res) => {
    const userId = req.params.id;
    const { title, summary, date, detail } = req.body;
    const image = req.filename;
    event.findByIdAndUpdate(userId, { title, summary, date, detail, image })
        .then(() => {
            res.redirect("/admin/events");
        })
        .catch(err => {
            console.log("Error:", err);
        });
});

app.delete("/admin/events/:eventId", (req, res) => {
    const eventId = req.params.eventId;
    const remove=event.findOneAndDelete({_id:eventId})
    .then((deletedEvent) => {
        if (deletedEvent) {
            res.status(200).json({ message: "Event deleted successfully" });
        } else {
            res.status(404).json({ error: "Event not found" });
        }
    })
    .catch(err => {
        console.log("Error:", err);
        res.status(500).json({ error: "Unable to delete the Event" });
    });
});

/* Alumni directory */

app.get("/", (req, res) => {
    const images = gallery.find()
        .then((images) => {
            res.render("home", { images });
        })
        .catch((err) => {
            console.log(err);
        });
});

app.get("/directory", async (req,res)=>{
    try{
    const profiles= await profile.find();
    res.render("directory",{profiles});
    }
    catch(err){
        console.log("Errro:",err);
        res.render("home");
    }
});

app.get("/directory/:id",(req,res)=>{
    const user=profile.findById(req.params.id)
    .then((user)=>{
        res.render("directory-profile",{user});
    })
    .catch(err=>{
        console.log("Error:",err);
        res.render("directory");
    })
});

app.get("/search", async (req, res) => {
    const searchQuery = req.query.search;

    try {
        const searchResults = await profile.find({ name: { $regex: new RegExp(searchQuery, 'i') } });

        // Render the search results page
        res.render("search", { results: searchResults });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

app.get("/gallery", (req, res) => {
    const images = gallery.find()
        .then((images) => {
            res.render("gallery", { images });
        })
        .catch((err) => {
            console.log(err);
        });
});

/* Events */

app.get("/events", (req, res) => {
    const events = event.find()
        .then(events => {
            res.render("events", { events });
        })
        .catch(err => {
            console.log("Error:", err);
        });
});

app.get("/events/:eventId", (req, res) => {
    const eventId = req.params.eventId;

    event.findById({ eventId })
        .then(event => {
            if (!event) {
                return res.status(404).send("Event not found");
            }

            res.render("event-page", { event });
        })
        .catch(err => {
            console.log("Error:", err);
            res.status(500).send("Internal Server Error");
        });
});

/* User login/register */

app.get("/register", (req, res) => {
    res.render("user-register");
});

app.get("/profile/:id", (req, res) => {
    const userId = req.params.id;
    profile.findById(userId)
        .then(data => {
            res.render("user-profile", { data });
        })
        .catch(err => {
            console.log("Error:", err);
        });
});

const isAuthenticated = (req, res, next) => {
  if (req.session.isAuthenticated) {
    next();
  } else {
    res.redirect('/');
  }
};

app.listen(port,()=>{
    console.log(`Listening on port ${port}`);
});