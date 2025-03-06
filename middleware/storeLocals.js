const storeLocals = (req, res, next) => {
  console.log("StoreLocal req.session.passport:", req.session.passport)
  console.log("StoreLocal req.user:", req.user)
    if (req.user) {
      res.locals.user = req.user;
    } else {
      console.log("No req.user in storeLocals.js")
      res.locals.user = null;
    }
    res.locals.info = req.flash("info");
    res.locals.errors = req.flash("error");
    next();
  };
  
  module.exports = storeLocals;