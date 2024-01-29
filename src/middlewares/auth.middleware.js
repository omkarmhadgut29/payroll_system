import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Employee } from "../models/employee.models.js";

const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const accessToken = req.header("Authorization")?.replace("Bearer ", "");

    if (!accessToken) {
      return res.status(401).json({ messeage: "Unauthorized request..." });
    }

    const decodedToken = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRETE_KEY
    );

    if (!decodedToken) {
      return res.status(401).json({ messeage: "Unauthorized request..." });
    }

    const user = await Employee.findById(decodedToken._id);
    if (!user.status) {
      return res.status(401).json({
        messeage: "Unauthorised request...",
      });
    }

    req.user = decodedToken;

    next();
  } catch (error) {
    return res.status(500).json({
      messeage: "Something went wrong...",
    });
  }
});

export { verifyJWT };
