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
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ message: "Email must be a valid address" });
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
    const userId = req.params.id;

    // Get the user before updating
    const userToModify = await User.findById(userId);
    if (!userToModify) return res.status(404).json({ message: "User not found." });

    // Count active admins in the same project
    const countAdmins = await User.countDocuments({
      project: userToModify.project,
      role: 'admin',
      isActive: true,
    });

    const isLastAdmin = countAdmins === 1 && userToModify.role === 'admin' && userToModify.isActive === true;

    const removingAdminRole = role && role !== 'admin';
    // We don’t check for deactivation here, as it’s handled in a different route

    if (isLastAdmin && removingAdminRole) {
      return res.status(400).json({ message: "Cannot downgrade the last active admin." });
    }

    // Proceed with the update
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email, password, role },
      { new: true }
      );
      await sendMail({
        to: updatedUser.email,
        subject: "Votre compte a été modifié",
        text: `Bonjour ${updatedUser.name},\n\nVotre compte a été mis à jour par un administrateur.\n\nNouveaux détails :\n- Nom : ${updatedUser.name}\n- Email : ${updatedUser.email}\n- Rôle : ${updatedUser.role}\n\nMerci de vérifier que tout est correct.`,
      });
 
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.get("/validate-reset-token/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Lien invalide ou utilisateur introuvable" });
    }

    res.status(200).json({ message: "Lien valide" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id/activate", async (req, res) => {
  try {
    const { activate } = req.body;
    const userId = req.params.id;

    const userToModify = await User.findById(userId);
    if (!userToModify) return res.status(404).json({ message: "User not found." });

    const countAdmins = await User.countDocuments({
      project: userToModify.project,
      role: 'admin',
      isActive: true,
    });

    const isLastAdmin = countAdmins === 1 && userToModify.role === 'admin' && userToModify.isActive === true;

    // Prevent deactivation of the last active admin
    if (isLastAdmin && activate === false) {
      return res.status(400).json({ message: "Cannot deactivate the last active admin." });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isActive: activate },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



export default router;
