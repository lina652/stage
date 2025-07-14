import express from'express'
import User from '../model/User.js'

const router=express.Router();

router.post("/create", async (req,res) => {
    try{
        const {name,email,password,role} = req.body;
        
        let existingUser = await User.findOne({ email});
        if (existingUser) return res.status(400).json({message: "user already exists"});

        const new_user= new User ({name , email , password,role});
        await new_user.save()

        res.status(201).json(new_user);

    }
    catch(err){
        res.status(500).json({message : err.message});
    }
});

router.get("/read", async (req,res) => {
    try{
        const users= await User.find();
        res.status(200).json(users);
    }
    catch (err){res.status(500).json({ message: err.message });}
});

router.put("/:id" , async(req,res) =>{
    try{
        const{ name, email, password, role}=req.body;
        const updatedUser = await User.findByIdAndUpdate(req.params.id,{name, email, password, role},{new:true})
        res.status(200).json(updatedUser);
    }
    catch (err){res.status(500).json({ message: err.message });}
});

router.put("/:id/activate", async(req,res) =>{
    try{
        const {activate}= req.body;
        const updatedUser= await User.findByIdAndUpdate(req.params.id , { isActive: activate },{new:true})
        res.status(200).json(updatedUser);

    }
    catch(err){
        res.status(500).json({message: err.message});
    }
});

export default router; 