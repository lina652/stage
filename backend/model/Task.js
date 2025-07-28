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
        'Completed'],
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
    },
    isRecurring: { type: Boolean, default: false },
recurrence: {
  frequency: { type: String, enum: ['daily', 'weekly', 'monthly' , null], default: null },
  interval: { type: Number, default: 1 },
  endDate: { type: Date },
},
comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    createdAt: { type: Date, default: Date.now }
  }],
completedDates: [Date]
   
},
    {timestamps:true}
);
const Task =mongoose.model("Task", TaskSchema);
export default Task;