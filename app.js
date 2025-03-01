require ("express-async-errors");
require ("dotenv").config();


const url = process.env.MONGO_URI;
const express = require("express");
const path = require("path");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const flash = require("connect-flash");
//middleware to store flash-msg and user
const storeLocals = require("./middleware/storeLocals");

const connectDB = require("./db/connect");
const secretWordRouter = require("./routes/secretWord");
const auth = require("./middleware/auth");

//passport initialise
const passport = require("passport");
const passportInit = require("./passport/passportInit");

const app = express();

//connect mongoDB
connectDB(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

//Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//connect middleware for POST-requests
app.use(express.urlencoded({ extended: true }));
//app.use(require("body-parser").urlencoded({ extended: true }));
app.use(express.json())

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
    resave: false,//true,
    saveUninitialized: false,//true,
    store: store,
    cookie: { secure: false, sameSite: "strict" },
  };
  if (app.get("env") === "production") {
    app.set("trust proxy", 1);
    sessionParams.cookie.secure = true;
  }
  
app.use(session(sessionParams));
  
// Setup flash middleware
//app.use(require("connect-flash")());
app.use(flash());
app.use(storeLocals);

passportInit();
app.use(passport.initialize());
app.use(passport.session());

//main page
app.get("/", (req, res) => {
  res.render("index");
});

app.use("/sessions", require("./routes/sessionRoutes"));
app.use("/secretWord", auth, secretWordRouter);
  
// Middleware to make flash messages available in views
app.use((req, res, next) => {
    res.locals.info = req.flash("info");
    res.locals.errors = req.flash("error");
    next();
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


//await require("./db/connect")(process.env.MONGO_URI);
const port = process.env.PORT || 5500;
app.listen(port, () =>
    console.log(`Server is listening on port ${port}...`));