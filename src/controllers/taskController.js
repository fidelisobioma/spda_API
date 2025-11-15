const prisma = require("../config/prisma");

//get tasks
const getTasks = async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { authorId: req.user.id },
    });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTaskById = async (req, res) => {
  const { id } = req.params;

  try {
    const task = await prisma.task.findUnique({
      where: { id: Number(id) },
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // (optional) ensure the logged-in user owns this task
    if (task.authorId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

//create task
const createTask = async (req, res) => {
  const { title, description, startTime, endTime } = req.body;

  try {
    const task = await prisma.task.create({
      data: {
        title,
        description,
        startTime: startTime ? new Date(startTime) : null,
        endTime: endTime ? new Date(endTime) : null,
        authorId: req.user.id,
      },
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//update task
const updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, startTime, endTime } = req.body;

  try {
    const existing = await prisma.task.findUnique({
      where: { id: Number(id) },
    });
    if (!existing || existing.authorId !== req.user.id)
      return res.status(403).json({ message: "Not auhtorized" });

    const updated = await prisma.task.update({
      where: { id: Number(id) },
      data: {
        title,
        description,
        startTime: startTime ? new Date(startTime) : null,
        endTime: endTime ? new Date(endTime) : null,
      },
    });
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//delete task
const deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await prisma.task.findUnique({
      where: { id: Number(id) },
    });

    if (!existing || existing.authorId !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    await prisma.task.delete({ where: { id: Number(id) } });
    res.status(200).json({ message: "task deleted" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//mark task complete
const toggleComplete = async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Only author can update
    if (task.authorId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { completed: !task.completed },
    });

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  toggleComplete,
};
