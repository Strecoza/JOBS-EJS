const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getJobs,
  showNewJobForm,
  createJob,
  showEditJobForm,
  updateJob,
  deleteJob,
} = require("../controllers/jobs");

//GET all jobs
router.get("/", auth, getJobs);

//Job form get
router.get("/new", auth, showNewJobForm);
//Add new job
router.post("/", auth, createJob);
//Edit job form
router.get("/edit/:edit", auth, showEditJobForm);
//Update job
router.post("/update/:id", auth, updateJob);
//Delete job
router.post("/delete/:id", auth, deleteJob);

module.exports = router;