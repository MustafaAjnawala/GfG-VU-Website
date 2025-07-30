const mongoose = require("mongoose");

const loginSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: String,
});

const upcomingEventSchema = new mongoose.Schema({
  eventName: String,
  eventDesc: String,
  eventDate: Date,
  eventTime: String,
  eventReg: String,
  eventImage: Buffer,
});

const past_eventSchema = new mongoose.Schema({
  PastEventImage: Buffer,
});

const login = mongoose.model("login", loginSchema);
const upcomingEvents = mongoose.model("upcomingEvent", upcomingEventSchema);
const pastEvent = mongoose.model("past_event", past_eventSchema);

module.exports = { login, upcomingEvents, pastEvent };
