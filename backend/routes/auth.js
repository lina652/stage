import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../model/User.js'
const router = express.Router();



router.post("/login" , async(req,res) =>{
    try{
        const{email, password}=req.body;
        const user = await User.findOne({email});
        if (!user ) return  res.status(400).json({message: "Invalid credentials"});

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({message: "Invlid credentials"});

        const token = jwt.sign({ is: user._id}, process.env.JWT_SECRET, {  expiresIn: "1h"});

        res.cookie("token",token,{ httpOnly: true});

        res.status(200).json({ message: "Login successful", token, role: user.role });


    }
    catch (error){
        res.status(500).json({message: error.message});
    }
});




router.post("/logout", (req,res) => {

    res.cookie("token", "", {httpOnly: true , expires: new Date(0) });
    res.status(200).json({ message: "Logged out" });
});


export default router;

