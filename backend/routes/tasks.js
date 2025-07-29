import express from "express";
import Task from "../model/Task.js";
import Project from "../model/Project.js";
import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;
import jwt from "jsonwebtoken";
import { populate } from "dotenv";
import User from "../model/User.js";
import { verifyToken } from "./auth.js";

const router = express.Router();

router.post("/create/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, type, status, dueDate, users, recurrence } =
      req.body;

    console.log(recurrence);
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
      project: new ObjectId(projectId),
      recurrence, // Conversion ici
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
    let tasks = await Task.find({ project: projectId })
      .populate("project")
      .populate("users");

    // Transformer les commentaires avec populate manuel user
    tasks = await Promise.all(
      tasks.map(async (task) => {
        const taskObj = task.toObject();

        taskObj.isRecurring = !!taskObj.recurrence;

        // Si pas de commentaires, on évite erreur
        if (!taskObj.comments) {
          taskObj.comments = [];
          return taskObj;
        }

        // Pour chaque commentaire on va chercher le user par son id dans comment.user
        const newComments = await Promise.all(
          taskObj.comments.map(async (comment) => {
            console.log("comment._id");
            console.log(comment._id);

            const user = await User.findById(comment.user);
            console.log("user");
            console.log(user);
            return {
              text: comment.text,
              createdAt: comment.createdAt,
              name: user?.name || "Unknown",
            };
          })
        );

        taskObj.comments = newComments;
        return taskObj;
      })
    );

    res.status(200).json(tasks);
  } catch (err) {
    console.error("Error fetching project tasks:", err);
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Update basic fields
    task.title = req.body.title;
    task.description = req.body.description;
    task.type = req.body.type;
    task.status = req.body.status;
    task.dueDate = req.body.dueDate;
    task.users = req.body.users;

    // Handle isRecurring field explicitly
    const isRecurring =
      req.body.isRecurring === true || req.body.isRecurring === "true";
    task.isRecurring = isRecurring;

    // Handle recurrence field
    if (isRecurring && req.body.recurrence) {
      task.recurrence = {
        frequency: req.body.recurrence.frequency,
        interval: parseInt(req.body.recurrence.interval, 10) || 1,
        endDate: req.body.recurrence.endDate || null,
      };
    } else {
      // Explicitly clear recurrence when not recurring
      task.recurrence = null;
      task.markModified("recurrence");
    }

    console.log("Task before save:", {
      isRecurring: task.isRecurring,
      recurrence: task.recurrence,
    });

    await task.save();

    console.log("Task after save:", {
      isRecurring: task.isRecurring,
      recurrence: task.recurrence,
    });

    res.status(200).json({ message: "Task updated successfully", task });
  } catch (err) {
    console.error("Task update error:", err);
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

    let tasks = await Task.find({ users: decoded.id })
      .populate("project")
      .populate("users");

    // Transform tasks to add isRecurring property and handle comments - same as project route
    tasks = await Promise.all(
      tasks.map(async (task) => {
        const taskObj = task.toObject();

        // Add isRecurring property
        taskObj.isRecurring = !!taskObj.recurrence;

        // Handle comments with user population (if needed)
        if (!taskObj.comments) {
          taskObj.comments = [];
          return taskObj;
        }

        // Populate comment users
        const newComments = await Promise.all(
          taskObj.comments.map(async (comment) => {
            const user = await User.findById(comment.user);
            return {
              text: comment.text,
              createdAt: comment.createdAt,
              name: user?.name || "Unknown",
            };
          })
        );

        taskObj.comments = newComments;
        return taskObj;
      })
    );

    res.json(tasks);
  } catch (err) {
    console.error("Error fetching user tasks:", err);
    res.status(500).json({ message: err.message });
  }
});
router.post("/:id/comments", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  if (!text) return res.status(400).json({ message: "Comment text required" });

  try {
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Utiliser l'ID du user à partir du token
    const userId = req.user.id;

    task.comments.push({ user: userId, text });
    await task.save();

    // Re-fetch pour renvoyer les commentaires avec le nom du user
    const populatedTask = await Task.findById(id).populate(
      "comments.user",
      "name"
    );

    res.status(201).json(populatedTask.comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export const generateRecurringTasks = async () => {
  const today = new Date().toISOString().split("T")[0];

  const recurringTasks = await Task.find({
    isRecurring: true,
    $or: [
      { recurrence: { frequency: "daily" } },
      { recurrence: { frequency: "weekly" } },
      { recurrence: { frequency: "monthly" } },
    ],
  });

  for (const task of recurringTasks) {
    const lastCompletedDate = task.completedDates.length
      ? new Date(task.completedDates[task.completedDates.length - 1])
      : null;

    const nextDate = getNextDate(
      lastCompletedDate || task.dueDate,
      task.recurrence
    );
    const nextDateStr = nextDate.toISOString().split("T")[0];

    if (nextDateStr === today) {
      const newTask = new Task({
        ...task.toObject(),
        _id: undefined, // Génère un nouvel ID
        dueDate: nextDate,
        status: "pending",
        completedDates: [],
      });
      await newTask.save();
    }
  }
};

function getNextDate(fromDate, recurrence) {
  const date = new Date(fromDate);
  switch (recurrence.frequency) {
    case "daily":
      date.setDate(date.getDate() + recurrence.interval);
      break;
    case "weekly":
      date.setDate(date.getDate() + 7 * recurrence.interval);
      break;
    case "monthly":
      date.setMonth(date.getMonth() + recurrence.interval);
      break;
  }
  return date;
}

router.patch("/tasks/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const task = await Task.findById(id);
    if (!task) return res.status(404).send("Task not found");

    if (task.status === "Completed") {
      return res.status(403).send("Cannot modify a completed task");
    }

    task.status = status;

    if (status === "Completed") {
      task.completedDates.push(new Date());
    }

    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).send("Error updating task status");
  }
});

export default router;
