import express from "express";
import cookieParser from "cookie-parser";
import { employeeRouter } from "./routes/employee.routes.js";
import { attendanceRouter } from "./routes/attendance.routes.js";

const app = express();

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

// Routers

app.use("/api/v1/employee", employeeRouter);
app.use("/api/v1/attendance", attendanceRouter);

export { app };
