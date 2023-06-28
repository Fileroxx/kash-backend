const express = require("express");
const userController = require("../controllers/userController");
const authenticateToken = require("../middlewares/authentication");

const router = express.Router();

router.get("/users", userController.getUsers);
router.get("/:id", authenticateToken, userController.getUserById);
router.post("/ativo", authenticateToken, userController.createAtivo);
router.get("/ativo", authenticateToken, userController.getAtivos);

module.exports = router;
