const express = require("express");
const passport = require("passport");
const router = express.Router();

const {
  logonShow,
  registerShow,
  registerDo,
  logoff,
} = require("../controllers/sessionController");

router
.route("/register")
.get(registerShow)
.post(registerDo);

router.post("/logon", (req, res, next) => {
  //console.log("try login:", req.body)

  passport.authenticate("local", (err, user, info) => {
    if (err) {
     // console.error ("Auth error:", err);
      return next(err)
    }
    if (!user) {
      console.log ("login failed:", info);
      req.flash("error", "Wrong email or password")
      return res.redirect("/sessions/logon");
    }
    req.logIn (user, (err) => {
      if (err) {
        console.error("Save session err:", err);
        return next(err)
      }
      console.log("Login success", user);
      return res.redirect("/")
    });

  //successRedirect: "/",
  /// failureRedirect: "/sessions/logon",
  /// failureFlash: true,
  })(req, res, next)
  })

router.get("/logon", logonShow);

router
 // .route("/logoff")
  .post("/logoff", (req, res, next) => {
    req.logout((err) => {
      if(err){
        console.log("logoff err: ", err);
        return res.redirect("/")
      }
      req.session.destroy(() => {
        res.redirect("/")
      })
    })
  });

module.exports = router;