import { Router } from "express";
import {
  deleteEmployee,
  getEmployee,
  getEmployees,
  loginEmployee,
  registerEmployee,
  updateEmployee,
} from "../controllers/employee.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerEmployee);

router.route("/login").post(loginEmployee);

router.route("/").get(getEmployees);
router
  .route("/:_id")
  .get(getEmployee)
  .patch(verifyJWT, updateEmployee)
  .delete(verifyJWT, deleteEmployee);

export const employeeRouter = router;
