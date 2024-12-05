const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const session = require('express-session');
const startScraping = require("./scraper/scrape");

dotenv.config();

const app = express();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Successfully connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error: ", err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(session({
    secret: 'super-secret-key', // i know this is not safe
    resave: false,
    saveUninitialized: true
}));

app.set("view engine", "ejs");

app.use("/", require("./routes/web"));
app.use("/api", require("./routes/api"));

startScraping();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));