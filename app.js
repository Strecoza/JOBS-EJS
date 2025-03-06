require ("express-async-errors");
require ("dotenv").config();

const mongoose = require("mongoose");
const express = require("express");
const path = require("path");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const flash = require("connect-flash");
const csrf = require("csurf");
const cookieParser = require("cookie-parser");

//url for testing
let mongoURL = process.env.MONGO_URI;
if (process.env.NODE_ENV == "test") {
  mongoURL = process.env.MONGO_URI_TEST;
}
mongoose.connect( mongoURL, { userNewUrlParser: true, useUnifiedTopology: true,})

//middleware to store flash-msg and user
const storeLocals = require("./middleware/storeLocals");

const connectDB = require("./db/connect");
const secretWordRouter = require("./routes/secretWord");
const auth = require("./middleware/auth");
const jobsRouter = require("./routes/jobs");



//attacks protection
const helmet = require("helmet");
const xssClean = require("xss-clean");
const rateLimit = require("express-rate-limit");

//passport initialise
const passport = require("passport");
const passportInit = require("./passport/passportInit");

const app = express();

//connect cookie-parser
app.use(cookieParser(process.env.SESSION_SECRET));
app.use(express.urlencoded({ extended: true }));
app.use(express.json())

//console.log("CSRF connected:", typeof csrf);
//CSRF protection
app.use(csrf({ cookie: true}));
app.use(helmet());
app.use(xssClean());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

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
  uri: mongoURL,
  collection: "mySessions",
});
store.on("error", (error) => {
  console.error("Session store error:", error);
});
  
const sessionParams = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: store,
  cookie: { secure: false, sameSite: "strict" },
};
if (app.get("env") === "production") {
  app.set("trust proxy", 1);
  sessionParams.cookie.secure = true;
}
  
app.use(session(sessionParams));

//passport connection
passportInit();
app.use(passport.initialize());
app.use(passport.session());


//csrf token
app.use((req, res, next) => {
  if (req.csrfToken) {
    res.locals._csrf = req.csrfToken();
  } else {
    console.warn("No csrf token")
  }
  next();});

//middleware for req.user
app.use((req,res,next)=> {
  console.log("app.js req.user before render=" , req.user)
  res.locals.user = req.user;
  next();
})

app.use((req,res,next) => {
  if (req.path == "/multiply"){
    res.set("Content-type", "application/json")
  } else {
    res.set ("Content-type", "text/html")
  }
  next()
})
  
// Setup flash middleware
app.use(flash());
app.use(storeLocals);

//main page
app.get("/", (req, res) => {
  res.render("index");
});

//API test
app.get("/multiply", (req, res) => {
  const result = req.query.first * req.query.second;
  res.json({ result });
});

//test middleware
//app.use((req, res, next) => {
  //if (req.path == "/multiply") {
  //  res.set("Content-Type", "application/json");
 // } else {
  //  res.set("Content-Type", "text/html");
  //}
  //next();
//});

//other routes
app.use("/sessions", require("./routes/sessionRoutes"));
app.use("/secretWord", auth, secretWordRouter);
app.use("/jobs", auth, jobsRouter);

// 404 handler
app.use((req, res) => {
    res.status(404).send(`That page (${req.url}) was not found.`);
});
  
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send("server error:" + err.message);
});

//await require("./db/connect")(process.env.MONGO_URI);
//const port = process.env.PORT || 3000;
//app.listen(port, () =>
    //console.log(`Server is listening on port ${port}...`));

const port = process.env.PORT || 3000;
const start = () => {
  try {
    require("./db/connect")(mongoURL);
    return app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`),
    );
  } catch (error) {
    console.log(error);
  }
};

start();

//module.exports = { app };