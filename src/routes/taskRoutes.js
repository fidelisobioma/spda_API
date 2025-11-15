const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getTaskById,
  toggleComplete,
} = require("../controllers/taskController");

const router = express();

router.use(protect); //protect all routes below

//get tasks
router.get("/", getTasks);

//get single task
router.get("/:id", getTaskById);

//create task
router.post("/", createTask);

//update task
router.put("/:id", updateTask);

//delete task
router.delete("/:id", deleteTask);

//mark task complete
router.put("/:id/complete", toggleComplete);

module.exports = router;
