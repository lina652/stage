import express from "express";
import Project from "../model/Project.js";

const router = express.Router();

router.post("/add", async (req, res) => {
  try {
    const { id, name, client, user } = req.body;

    let existingProject = await Project.findOne({ name, client });

    if (existingProject)
      return res.status(400).json({ message: "Project already exists" });

    const new_project = new Project({
      id,
      name,
      client,
      user: user,
      tasks: [],
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
    const project = await Project.findById(id)
      .populate("user")
      .populate("tasks");
    res.status(200).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.get("/get", async (req, res) => {
  try {
    const projects = await Project.find().populate("user").populate("tasks");
    res.status(200).json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, client, user, task } = req.body;
    const updatedProject = await Project.findByIdAndUpdate(
      id,
      { name, client, user, tasks },
      { new: true }
    )
      .populate("user")
      .populate("tasks");
    if (!updatedProject)
      return res.status(404).json({ message: "Project not found" });
    else res.status(200).json(updatedProject);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
