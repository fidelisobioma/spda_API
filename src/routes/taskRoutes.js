const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

const router = express();

router.use(protect); //protect all routes below

//get tasks
router.get("/", getTasks);

//create task
router.post("/", createTask);

//update task
router.put("/:id", updateTask);

//delete task
router.delete("/:id", deleteTask);

module.exports = router;
