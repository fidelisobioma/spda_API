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

//create task
const createTask = async (req, res) => {
  const { title, description } = req.body;

  try {
    const task = await prisma.task.create({
      data: { title, description, authorId: req.user.id },
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//update task
const updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;
  try {
    const existing = await prisma.task.findUnique({
      where: { id: Number(id) },
    });
    if (!existing || existing.authorId !== req.user.id)
      return res.status(403).json({ message: "Not auhtorized" });

    const updated = await prisma.task.update({
      where: { id: Number(id) },
      data: { title, description },
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

module.exports = { getTasks, createTask, updateTask, deleteTask };
