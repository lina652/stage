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
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref :"User"},

   
},
    {timeStamps:true}
);
const Task =mongoose.model("Task", TaskSchema);
export default Task;