const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const sanitizeHtml = require("sanitize-html");
const multer = require("multer");
const path = require("path");
const { login, upcomingEvents, pastEvent } = require("./models/models");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;
let sec = 0;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("views")); // Serve static HTML files from the 'views' directory

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Middleware to parse request body
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("Connected to MongoDB");
});

//route to load the homepage and its contents
app.get("/", async (req, res) => {
  sec = 0;
  try {
    const upcoming_events = await upcomingEvents.find({});
    const past_events = await pastEvent.find();
    res.status(200).render("index", {
      upcomingEvents: upcoming_events,
      pastEvents: past_events,
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post("/login", async (req, res) => {
  let { username, password } = req.body;

  // Sanitizing both parameters from harmful HTML tags
  username = sanitizeHtml(username);
  password = sanitizeHtml(password);

  try {
    const userData = await login.findOne({ username });
    if (userData && userData.password === password) {
      sec = 1;
      return res.redirect("/panel");
    } else {
      return res.status(401).send("Invalid username or password");
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/panel", async (req, res) => {
  if (sec === 1) {
    try {
      const upcomingEvent = await upcomingEvents.find();
      const pastEvents = await pastEvent.find();
      res.render("panel", { upcomingEvents: upcomingEvent, pastEvents });
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).send("Internal Server Error");
    }
  } else {
    return res.status(500).send("Unauthorized Access");
  }
});

//post request to add a new event into the list
app.post("/add-event", upload.single("eventImage"), async (req, res) => {
  const { eventName, eventDesc, eventDate, eventTime, eventReg } = req.body;
  const eventImage = req.file ? req.file.buffer : null;

  try {
    await upcomingEvents.create({
      eventName: sanitizeHtml(eventName),
      eventDesc: sanitizeHtml(eventDesc),
      eventDate: sanitizeHtml(eventDate),
      eventTime: sanitizeHtml(eventTime),
      eventReg: sanitizeHtml(eventReg),
      eventImage,
    });
    res.redirect("/panel");
  } catch (error) {
    console.error("Error adding event:", error);
    res.status(500).send("Internal Server Error");
  }
});

//to delete the respective upcoming event and details
app.post("/delete-event", async (req, res) => {
  const { eventID } = req.body;
  try {
    await upcomingEvents.findByIdAndDelete(eventID);
    res.redirect("/panel");
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).send("Internal Server Error");
  }
});

//post req to add an image to the past event list
app.post("/add-past-event", upload.single("eventImage"), async (req, res) => {
  const eventImage = req.file ? req.file.buffer : null;
  try {
    await pastEvent.create({ PastEventImage: eventImage });
    res.redirect("/panel");
  } catch (error) {
    console.error("Error adding event:", error);
    res.status(500).send("Internal Server Error");
  }
});

//to delete the respective past event image
app.post("/delete-past-event", async (req, res) => {
  const { eventID } = req.body;
  const isValidObjectId = mongoose.Types.ObjectId.isValid(eventID);
  if (!eventID || !isValidObjectId) {
    return res.status(400).send("Invalid or missing Event ID");
  }
  try {
    await pastEvent.findByIdAndDelete(eventID);
    res.redirect("/panel");
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/logout", (req, res) => {
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server is up annd running on http://localhost:${port}`);
});
