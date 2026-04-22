const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/users", authMiddleware, userController.createUser);

router.post("/api/users", authMiddleware, userController.createUser);

router.get("/users", authMiddleware, userController.getUsers);

router.get("/api/users", authMiddleware, userController.getUsers);

router.get("/users/:id", authMiddleware, userController.getUser);

router.get("/api/users/:id", authMiddleware, userController.getUser);

router.put("/users/:id", authMiddleware, userController.updateUser);

router.put("/api/users/:id", authMiddleware, userController.updateUser);

router.delete("/users/:id", authMiddleware, userController.deleteUser);

router.delete("/api/users/:id", authMiddleware, userController.deleteUser);

module.exports = router;