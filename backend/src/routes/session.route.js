const express = require("express");
const sessionController = require("../controllers/session.controller");

const router = express.Router();

router.post("/", sessionController.createSession);
router.get("/:code", sessionController.getSession);
router.get("/:code/participants", sessionController.getSessionParticipants);
router.post("/:code/join", sessionController.joinSession);

// New matching endpoints
router.post("/:code/match", sessionController.computeSessionMatches);
router.get("/:code/matches", sessionController.getSessionMatches);

module.exports = router;
