import express from "express";
import Task from "../model/Task.js";
import Project from "../model/Project.js";
import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;
import jwt from "jsonwebtoken";
import { populate } from "dotenv";

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
      .populate("users")
      .populate("comments.user");
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

    const tasks = await Task.find({ users: decoded.id }).populate('project').populate("users").populate('comments.user')
    res.json(tasks);
  } catch {
    console.error("Error fetching user tasks:", err);
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/comments', async (req, res) => {
  const { id } = req.params;
  const { userId, text } = req.body; // userId from auth or client
  if (!text) return res.status(400).json({ message: "Comment text required" });

  try {
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.comments.push({ user: userId, text });
    await task.save();

    res.status(201).json(task.comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});






export const generateRecurringTasks = async () => {
  const today = new Date().toISOString().split('T')[0];

  const recurringTasks = await Task.find({
    isRecurring: true,
    $or: [
      { recurrence: { frequency: 'daily' } },
      { recurrence: { frequency: 'weekly' } },
      { recurrence: { frequency: 'monthly' } }
    ]
  });

  for (const task of recurringTasks) {
    const lastCompletedDate = task.completedDates.length
      ? new Date(task.completedDates[task.completedDates.length - 1])
      : null;

    const nextDate = getNextDate(lastCompletedDate || task.dueDate, task.recurrence);
    const nextDateStr = nextDate.toISOString().split('T')[0];

    if (nextDateStr === today) {
      const newTask = new Task({
        ...task.toObject(),
        _id: undefined, // Génère un nouvel ID
        dueDate: nextDate,
        status: 'pending',
        completedDates: []
      });
      await newTask.save();
    }
  }
};

function getNextDate(fromDate, recurrence) {
  const date = new Date(fromDate);
  switch (recurrence.frequency) {
    case 'daily':
      date.setDate(date.getDate() + recurrence.interval);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7 * recurrence.interval);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + recurrence.interval);
      break;
  }
  return date;
}


router.patch('/tasks/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const task = await Task.findById(id);
    if (!task) return res.status(404).send("Task not found");

    
    if (task.status === 'Completed') {
      return res.status(403).send("Cannot modify a completed task");
    }

    
    task.status = status;

   
    if (status === 'Completed') {
      task.completedDates.push(new Date());
    }

    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).send("Error updating task status");
  }
});


export default router;