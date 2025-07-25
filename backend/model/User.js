import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema (
    {
        name: {type :String , required : true},
        email:{type: String , required : true , unique:true },
        password:{type: String , required : true},
        role:{
            type :String, 
            enum:['user' , 'admin']
        },
        isActive: { type: Boolean, default: true }
},

{
    timestamps: true 
}
);

  

const User = mongoose.model("User" , UserSchema);
export default User; 