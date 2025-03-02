require ("express-async-errors");
require ("dotenv").config();

const url = process.env.MONGO_URI;
const express = require("express");
const path = require("path");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");
//middleware to store flash-msg and user
const storeLocals = require("./middleware/storeLocals");

const connectDB = require("./db/connect");
const secretWordRouter = require("./routes/secretWord");
const auth = require("./middleware/auth");
const jobsRouter = require("./routes/jobs");

//attacks protection
const csrf = require("host-csrf");
const helmet = require("helmet");
const xssClean = require("xss-clean");
const rateLimit = require("express-rate-limit");

//passport initialise
const passport = require("passport");
const passportInit = require("./passport/passportInit");

const app = express();

//connect cookie-parser
app.use(cookieParser(process.env.SESSION_SECRET));

//CSRF protection
app.use(csrf());
  //{protected_operations: ["POST"],development_mode: process.env.NODE_ENV !=="production"}));
app.use(helmet());
app.use(xssClean());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

app.use(express.urlencoded({ extended: true }));
app.use(express.json())

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

// Setup MongoDB session store
const store = new MongoDBStore({
  // may throw an error, which won't be caught
  uri: process.env.MONGO_URI,
  collection: "mySessions",
});
store.on("error", (error) => {
  console.error("Session store error:", error);
});
  
const sessionParams = {
  secret: process.env.SESSION_SECRET,
  resave: false,
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
//other routes
app.use("/sessions", require("./routes/sessionRoutes"));
app.use("/secretWord", auth, secretWordRouter);
app.use("/jobs", auth, jobsRouter);
  
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
const port = process.env.PORT || 3000;
app.listen(port, () =>
    console.log(`Server is listening on port ${port}...`));