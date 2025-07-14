import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import cors from "cors";
import auth from "./routes/auth.js";
import users from "./routes/users.js";
import projects from "./routes/projects.js";
import tasks from "./routes/tasks.js";


dotenv.config();

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173", 
    credentials: true, 
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/auth", auth);
app.use("/users", users);
app.use("/projects", projects);
app.use("/tasks", tasks);


app.listen(5000, () => {
  connectDB();
  console.log("server started at http://localhost:5000");
});
