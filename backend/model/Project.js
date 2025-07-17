import mongoose from 'mongoose'

const ProjectSchema= new mongoose. Schema({
    name:{type : String , required:true},
    client:{type:String , required: true},
    users:[{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    tasks:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
    id: { type: String, required: true },
    
},
    {timestamps:true}
);

const Project =mongoose.model('Project', ProjectSchema);
export default Project;