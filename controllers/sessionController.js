const User = require("../models/User");
const parseVErr = require("../util/parseValidationErrs");

const registerShow = (req, res) => {
   console.log("CSRF token on server:", req.csrfToken()); 
   return res.render("register", {_csrf: req.csrfToken()});
};

const registerDo = async (req, res, next) => {
  if (req.body.password != req.body.password1) {
    req.flash("error", "The passwords entered do not match.");
    return res.render("register", {  errors: req.flash("error") });
  }
  try {
    const user = new User(req.body);
    await user.validate();
    await user.save();
    return res.redirect("/");
  } catch (e) {
    if (e.name === "ValidationError") {
      parseVErr(e, req);
    } else if (e.name === "MongoServerError" && e.code === 11000) {
      req.flash("error", "That email address is already registered.");
    } else {
      return next(e);
    }
    return res.render("register", {  errors: req.flash("error") });
  }
};

const logoff = (req, res) => {
  req.session.destroy(function (err) {
    if (err) {
      console.log(err);
    }
    return res.redirect("/");
  });
};

const logonShow = (req, res) => {
  console.log("req.user with login:", req.user);
  console.log("Current session", req.user)
  if (req.user) {
    return res.redirect("/");
  }
  return res.render("logon", 
    {errors: req.flash("error"), 
    info: req.flash("info"),}
  );
};

module.exports = {
  registerShow,
  registerDo,
  logoff,
  logonShow,
};