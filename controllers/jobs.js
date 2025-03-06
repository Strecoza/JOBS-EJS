const Job = require("../models/Job");

//Get all jobs
const getJobs = async (req, res, next) => {
    try{
        console.log("Jobs list:", req.user)
        const jobs = await Job.find({ createdBy: req.user._id});
        return res.render("jobs", {jobs})
    } catch (err) {
        console.error("getJobs err:", err)
        return next(err);
    }
};

//Get job form
const showNewJobForm = (req, res) => {
    return res.render("jobForm", {jobs: null,  _csrf: req.csrfToken() })
};

//Create new job
const createJob = async (req, res, next) => {
    try{
        await Job.create({ ...req.body, createdBy: req.user._id});
        return res.redirect("/jobs")
    } catch (err) {
        console.error("createJob error:", err)
        req.flash("error", "Job cann't be created");
        //res.render("/job/new");
        return res.render("jobForm", { job: req.body });
    }
};

//show the edit form
const showEditJobForm = async (req, res, next ) => {
    try{
        const job = await Job.findOne({_id: req.params.id, createdBy: req.user._id});
    if (!job) {
        req.flash("error", "Job not find");
        return res.redirect("/jobs");
    }
    return res.render("jobs", { job });
    } catch (err){
        console.log("showEditJobForm error:", err)
        return next (err);
    }
}

//update job
const updateJob = async (req, res, next) => {
    try{
        await Job.findOneAndUpdate(
            {
                _id: req.params.id, 
                createdBy: req.user._id
            }, req.body
        ); 
        return res.redirect("/jobs")
    } catch (err) {
        console.error("Update job error:", err)
        req.flash("error", "Update error");
        return res.redirect(`/jobs/edit/${req.params.id}`)
    }
}

//delete job
const deleteJob = async (req, res, next) => {
    try {
        await Job.findOneAndDelete({
            _id: req.params.id, 
            createdBy: req.user._id});
        res.redirect("/jobs");
    } catch (err) {
        console.error("Delete job error:", err)
        req.flash("error", "Delete error")
        return res.redirect("/jobs");
    }
}

module.exports = {
    getJobs,
    showNewJobForm,
    createJob,
    showEditJobForm,
    updateJob,
    deleteJob,
}

