const express = require("express");
const ratePlanController = require("../controllers/ratePlan.controller");

const router = express.Router();

router.get("/", ratePlanController.list);

module.exports = router;
