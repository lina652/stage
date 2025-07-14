import express from "express";
import Task from "../model/Task.js";

const router = express.Router();

router.post("/create/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, type, status, dueDate, user } = req.body;
    let existingTask = await Task.findOne({ title, description ,project: projectId});
    if (existingTask)
      return res.status(400).json({ message: "Task already exists" });

    const new_Task = new Task({
      title,
      description:description || "",
      type,
      status,
      dueDate,
      user,
      project: projectId
    });
    await Project.findByIdAndUpdate(
      projectId,
      { $push: { tasks: new_Task._id } });
    await new_Task.save();
    res.status(201).json(new_Task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/read", async (req, res) => {
  try {
    const tasks = await Task.find();
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { title, description, type, status, dueDate, user } = req.body;
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, type, status, dueDate, user },
      { new: true }
    );
    if (!updatedTask)
      return res.status(404).json({ message: "Task not found" });
    res.status(200).json(updatedTask);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// In tasks.js (backend)
router.get("/project/:projectId", async (req, res) => {
  const tasks = await Task.find({ project: req.params.projectId });
  res.json(tasks);
});

export default router;
