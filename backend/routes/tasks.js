import express from "express";
import Task from "../model/Task.js";
import Project from "../model/Project.js";
import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/create/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, type, status, dueDate, users } = req.body;
    if (!Array.isArray(users) || users.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one user must be assigned" });
    }
    let existingTask = await Task.findOne({
      title,
      description,
      project: projectId,
    });
    if (existingTask)
      return res.status(400).json({ message: "Task already exists" });

    const new_Task = new Task({
      title,
      description: description || "",
      type,
      status,
      dueDate,
      users,
      project: new ObjectId(projectId), // Conversion ici
    });

    await new_Task.save();
    console.log(projectId);

    await Project.findByIdAndUpdate(projectId, {
      $push: { tasks: new_Task._id },
    });
   
    res.status(201).json(new_Task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/project/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    const tasks = await Task.find({ project: projectId })
      .populate("project")
      .populate("users");
    res.status(200).json(tasks);
  } catch (err) {
    console.error("Error fetching project tasks:", err);
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { title, description, type, status, dueDate, users } = req.body;
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, type, status, dueDate, users },
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
    // Remove task from project
    await Project.findByIdAndUpdate(deletedTask.project, {
      $pull: { tasks: id },
    });

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Backend - Express

router.get("/auth/me", (req, res) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    
    console.log(token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ id: decoded.id, name: decoded.name });
  } catch (err) {
    res.status(403).json({ message: "Invalid token" });
  }
});

router.get("/user/mytask", async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) return res.status(401).json({ message: "Unauthorized" });
    console.log(token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const tasks = await Task.find({ users: decoded.id }).populate('project');
    res.json(tasks);
  } catch {
    console.error("Error fetching user tasks:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
