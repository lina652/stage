import express from "express";
import User from "../model/User.js";
import bcrypt from "bcrypt";
import Project from "../model/Project.js";
import mongoose from "mongoose";
import { sendMail } from "../utils/mailService.js";
const { ObjectId } = mongoose.Types;

const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    const { name, email, role } = req.body;

    if (!email.endsWith("@gmail.com")) {
      return res
        .status(400)
        .json({ message: "Email must be a Gmail address (@gmail.com)" });
    }

    let existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "user already exists" });

   

    const new_user = new User({ name, email, role });
    console.log(new_user);
    await new_user.save();
    const verificationLink = `http://localhost:5173/set-password/${new_user._id}`;

    await sendMail({
      to: email,
      subject: "Bienvenue sur la plateforme !",
      text: `Bonjour ${name}, votre compte a été créé avec succès. 🎉 ${verificationLink}`,
    });

    res.status(201).json(new_user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



// password setting :

router.post("/set-password/:id", async (req, res) => {
  try {
    const { password } = req.body;
    const { id } = req.params;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Mot de passe trop court (min 6 caractères)" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { password: hashedPassword },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.status(200).json({ message: "Mot de passe défini avec succès" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/read", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.get("/read/:projectId", async (req, res) => {
  try {
    const project = await Project.findById(
      new ObjectId(req.params.projectId)
    ).populate({
      path: "users",
      select: "name email _id", // -_id pour exclure l'ID
    });

    console.log(project.users); // Affiche tous les utilisateurs liés au projet

    res.status(200).json(project.users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, password, role },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id/activate", async (req, res) => {
  try {
    const { activate } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: activate },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
