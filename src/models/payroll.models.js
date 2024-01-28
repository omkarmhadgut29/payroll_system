import mongoose, { Schema } from "mongoose";

const payrollSchema = new Schema(
  {
    employee_id: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
    },
    basic_salary: {
      type: Number,
      required: true,
    },
    standard_deductions: {
      type: Number,
      required: true,
    },
    house_rent_allowance: {
      type: Number,
      required: true,
    },
    basket_of_allowance: {
      type: Number,
      required: true,
    },
    designation: {
      type: String,
      enum: ["senior_developer", "associate_developer", "junior_developer"],
      default: ["junior_developer"],
    },
  },
  {
    timestamps: true,
  }
);

export const Payroll = mongoose.model("Payroll", payrollSchema);
