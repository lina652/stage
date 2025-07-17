import mongoose from 'mongoose'

const TaskSchema=new mongoose.Schema({
    title:{type:String , required: true},
    description:{type:String },
    type:{
        type:String,
        enum:['Story Image',
        'Animated Story',
        'Post',
        'Reel',
        'Landscape Video',
        'Cover Photo'],
        required:true
    },
    status:{
        type:String,
        enum:['To Do',
        'In Progress',
        'In Review',
        'Approved',
        'Rejected',
        'Published'],
        default:'To Do',
        required:true
    },
    dueDate:{
        type:Date
    },
    users:[{
        type: mongoose.Schema.Types.ObjectId,
        ref :"User",
        required:true}],

    project: { // Added missing project field
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true
    }   
   
},
    {timestamps:true}
);
const Task =mongoose.model("Task", TaskSchema);
export default Task;