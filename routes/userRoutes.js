const express = require("express");
const userController = require("../controllers/userController");
const authenticateToken = require("../middlewares/authentication");

const router = express.Router();

router.get("/users", userController.getUsers);
router.get("/:token", userController.getUserByToken);
router.post("/ativo", authenticateToken, userController.createAtivo);
router.get("/ativo", authenticateToken, userController.getAtivos);

module.exports = router;
