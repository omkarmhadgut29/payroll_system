import { Router } from "express";
import {
  addAttendanceType,
  createSalarySlip,
  getAttendance,
} from "../controllers/attendance.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router
  .route("/:employee_id")
  .post(verifyJWT, addAttendanceType)
  .get(verifyJWT, getAttendance);

router.route("/salary_slip/:employee_id").post(verifyJWT, createSalarySlip);

export const attendanceRouter = router;
