import mongoose, { Schema } from "mongoose";

const attendanceSchema = new Schema(
  {
    employee_id: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
    },
    type: {
      type: String,
      enum: ["punch_in", "punch_out"],
      default: "punch_in",
    },
    date_and_time: {
      type: String,
      default: Date(),
    },
    status: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Attendance = mongoose.model("Attendance", attendanceSchema);
