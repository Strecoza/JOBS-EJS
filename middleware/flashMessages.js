module.exports = (req, res, next) => {
    res.locals.info = req.flash("info");
    //res.locals.console.errors = req.flash ("error");
    res.locals.errors = req.flash ("error");
    next();
}