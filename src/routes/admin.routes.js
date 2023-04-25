const express = require("express");
const passport = require("passport");
const { createFoodstuff } = require("../controller/admin.controller");
const upload = require('./../validation/multer');
const router = express.Router();
require('../middleware/auth');


router.post("/createfoodstuff", upload.single('image'), createFoodstuff);


module.exports = router;