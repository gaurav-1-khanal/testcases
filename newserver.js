const app = require("./newserver");
const mongoose = require("mongoose");

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

module.exports = app;
