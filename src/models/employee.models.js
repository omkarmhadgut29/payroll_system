import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const employeeSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    fullname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    mobile: {
      type: Number,
      required: true,
    },
    designation: {
      type: String,
      enum: ["senior_developer", "associate_developer", "junior_developer"],
      default: ["junior_developer"],
    },
    date_of_joining: {
      type: Date,
      default: Date.now,
    },
    department: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
    },
  },
  {
    timestamps: true,
  }
);

employeeSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(
    this.password,
    parseInt(process.env.SALT_ROUNDS)
  );
  next();
});

employeeSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

employeeSchema.methods.generateAccessToken = async function () {
  const tokenData = {
    _id: this._id,
    username: this.username,
    email: this.email,
    scrumRole: this.scrumRole,
    department: this.department,
    status: this.status,
  };

  return jwt.sign(tokenData, process.env.ACCESS_TOKEN_SECRETE_KEY, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY_TIME,
  });
};

employeeSchema.methods.generateRefreshToken = async function () {
  const tokenData = {
    _id: this._id,
    username: this.username,
    email: this.email,
    scrumRole: this.scrumRole,
    department: this.department,
    status: this.status,
  };

  return jwt.sign(tokenData, process.env.REFRESH_TOKEN_SECRETE_KEY, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY_TIME,
  });
};

export const Employee = mongoose.model("Employee", employeeSchema);
