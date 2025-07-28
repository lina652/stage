import express from "express";
import Project from "../model/Project.js";
import { verifyToken } from "./auth.js";
import User from "../model/User.js";

const router = express.Router();

router.post("/add", async (req, res) => {
  try {
    const { id, name, client, users } = req.body;

    let existingProject = await Project.findOne({ name });

    if (existingProject)
      return res.status(400).json({ message: "Project already exists" });

    const new_project = new Project({
      id,
      name,
      client,
      users: users ,
    });

    await new_project.save();

    res.status(201).json(new_project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.get("/get/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Charger le projet sans populate imbriqué
    const project = await Project.findById(id)
      .populate("users")
      .populate("tasks");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const projectObj = project.toObject();

    // Pour chaque tâche, on remplace les commentaires par des versions enrichies avec le nom d'utilisateur
    projectObj.tasks = await Promise.all(
      projectObj.tasks.map(async (task) => {
        const newComments = await Promise.all(
          task.comments.map(async (comment) => {
            console.log(comment);
            const user = await User.findById(comment.user);
            console.log("***** dsfdsfsdfs sdfsdfsdf **********************");
            console.log(user);
            console.log("***********sdfdfsd dsfsdfs dsf****************");
            return {
              text: comment.text,
              createdAt: comment.createdAt,
              user: user || "Unknown",
            };
          })
        );
        return { ...task, comments: newComments };
      })
    );

    res.status(200).json(projectObj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/get", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "admin") {
      const projects = await Project.find().populate("users").populate("tasks");
      return res.status(200).json(projects);
    }

    const userProjects = await Project.find({ users: userId })
      .populate("users")
      .populate("tasks");

    res.status(200).json(userProjects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, client, users, tasks } = req.body;
    const updatedProject = await Project.findByIdAndUpdate(
      id,
      { name, client, users, tasks },
      { new: true }
    )
      .populate("users")
      .populate("tasks");
    if (!updatedProject)
      return res.status(404).json({ message: "Project not found" });
    else res.status(200).json(updatedProject);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
