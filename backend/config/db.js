import mongoose from 'mongoose';


export const connectDB = async () => {
    try{
        const conn=await mongoose.connect(process.env.MONGO_URI); // connects the backend to mongoDB using the URL stored in env as MONGO_URI        console.log(`MongoDB Connected: ${conn.connection.host}`);
        console.log(`MongoDB Connected`);
    } catch(error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    } }