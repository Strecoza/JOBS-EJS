require("express-async-errors");
require("dotenv").config();

const url = process.env.MONGO_URI;
const express = require("express");
const app = express();
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const flash = require("connect-flash");

//Set EJS as the view engine
app.set("view engine", "ejs");
//app.use(express.urlencoded({ extended: true }));
app.use(require("body-parser").urlencoded({ extended: true }));

// Setup MongoDB session store
const store = new MongoDBStore({
    // may throw an error, which won't be caught
    uri: url,
    collection: "mySessions",
  });
  store.on("error", (error) => {
    console.error("Session store error:", error);
  });
  
  const sessionParams = {
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    store: store,
    cookie: { secure: false, sameSite: "strict" },
  };
  if (app.get("env") === "production") {
    app.set("trust proxy", 1);
    sessionParams.cookie.secure = true;
  }
  
app.use(session(sessionParams));
  
// Setup flash middleware
app.use(require("connect-flash")());
//app.use(flash());
  
// Middleware to make flash messages available in views
app.use((req, res, next) => {
    res.locals.info = req.flash("info");
    res.locals.errors = req.flash("error");
    next();
});
  
// Routes for secretWord
app.get("/secretWord", (req, res) => {
    if (!req.session.secretWord) {
      req.session.secretWord = "syzygy";
    }
    res.locals.info = req.flash("info");
    res.locals.errors = req.flash("error");
    res.render("secretWord", { secretWord: req.session.secretWord });
  });
  
app.post("/secretWord", (req, res) => {
    if (req.body.secretWord.toUpperCase()[0] == "P") {
      req.flash("error", "That word won't work!");
      req.flash("error", "You can't use words that start with p.");
    } else {
      req.session.secretWord = req.body.secretWord;
      req.flash("info", "The secret word was changed.");
    }
    res.redirect("/secretWord");
  });
  
// 404 handler
app.use((req, res) => {
    res.status(404).send(`That page (${req.url}) was not found.`);
});
  
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send(err.message);
});


  
const port = process.env.PORT || 5500;
app.listen(port, () =>
    console.log(`Server is listening on port ${port}...`));