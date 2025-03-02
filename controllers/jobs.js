const Job = require("../models/Job");

//Get all jobs
const getJobs = async (req, res) => {
    const jobs = await Job.find({ createdBy: req.user._id});
    res.render("job", {jobs})
};

//Get job form
const showNewJobForm = (res, req) => {
    res.render("job", {job: null})
};

//Create new job
const createJob = async (req, res) => {
    try{
        await Job.create({ ...req.body, createdBy: req.user._id});
        res.redirect("/jobs")
    } catch (err) {
        req.flash("error", "Job cann't be created");
        res.render("/job/new")
    }
};

//show the edit form
const showEditJobForm = async (req, res) => {
    const job = await Job.findOne({_id: req.params._id, createdBy: req.user._id});
    if (!job) {
        req.flash("error", "Job not find");
        return res.redirect("/jobs")
    }
    res.render("job", {job})
}

//update job
const updateJob = async (req, res) => {
    try{
        await Job.findOneAndUpdate(
            {
                _id: req.params.id, createdBy: req.user._id
            }, req.body
        ); res.redirect("/jobs")
    } catch (err) {
        req.flash("error", "Update error");
        return res.redirect(`/jobs/edit/${req.params.id}`)
    }
}

//delete job
const deleteJob = async (req, res) => {
    await Job.findOneAndDelete({_id: req.params.id, createdBy: req.user._id});
    res.redirect("/jobs")
}

module.exports = {
    getJobs,
    showNewJobForm,
    createJob,
    showEditJobForm,
    updateJob,
    deleteJob,
}

