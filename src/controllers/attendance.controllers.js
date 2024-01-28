import mongoose from "mongoose";
import { Attendance } from "../models/attendance.models.js";
import { attendanceOfUser, getWeekendCount } from "../constants.js";
import { Payroll } from "../models/payroll.models.js";
import { generatePDF } from "../utils/generatePDF.js";

/**
 * @param {employee_id, type, date_and_time} req
 */
// Adding attendance type as: "punch_in" or "punch_out"
const addAttendanceType = async (req, res) => {
  const { employee_id } = req.params;
  const { type, date_and_time } = req.body;

  if ([employee_id, type].some((field) => !field || field?.trim() === "")) {
    return res.status(400).json({
      message: "All fields are required...",
    });
  }

  const data = {
    employee_id,
    type,
  };

  // req.body date_and_time format eg: "Wed Jan 21 2024 20:53:31 GMT+0530 (India Standard Time)"
  if (date_and_time && date_and_time?.trim !== "") {
    data.date_and_time = date_and_time;
  }

  const attendance = await Attendance.create(data);

  if (!attendance) {
    return res.status(500).json({
      message: "Internal server error...",
    });
  }

  return res.status(201).json({
    message: "Attendance added...",
  });
};

/**
 * @param {employee_id} req
 */
const getAttendance = async (req, res) => {
  try {
    const { employee_id } = req.params;

    const attendanceRecords = await Attendance.aggregate([
      {
        $match: {
          employee_id: new mongoose.Types.ObjectId(employee_id),
        },
      },
      {
        $sort: {
          date_and_time: 1,
        },
      },
    ]);

    if (!attendanceRecords || attendanceRecords?.length < 1) {
      return res.status(404).json({
        message: "Attendance of user not found...",
      });
    }

    // formating database data as per requirement
    const attendance = attendanceOfUser(attendanceRecords);
    let total_working_hours = 0;
    let count = 0;
    Object.keys(attendance).forEach((date) => {
      if (attendance[date].count > 0) {
        total_working_hours += attendance[date].working_hours;
        count++;
      }
    });

    attendance.average_working_hours = total_working_hours / count;

    res.status(200).json(attendance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * @param {employee_id, year, month} req
 */
const createSalarySlip = async (req, res) => {
  const { employee_id } = req.params;
  const { year, month } = req.body;

  if ([year, month].some((field) => !field || field?.trim() === "")) {
    return res.status(401).json({
      message: "Year and month is required...",
    });
  }

  const attendanceRecords = await Attendance.aggregate([
    {
      $match: {
        employee_id: new mongoose.Types.ObjectId(employee_id),
      },
    },
  ]);

  if (!attendanceRecords || attendanceRecords?.length < 1) {
    return res.status(404).json({
      message: "Attendance of user not found...",
    });
  }

  const attendance = attendanceOfUser(attendanceRecords);

  const presentDays = Object.keys(attendance).filter((key) =>
    key.includes(`${year}-${month}`)
  ).length;

  const numberOfDaysInMonth = new Date(year, month, 0).getDate();

  const weekends = getWeekendCount(year, month);

  const numberOfDaysToPayble = presentDays + weekends;

  const payroll = await Payroll.aggregate([
    {
      $match: {
        employee_id: new mongoose.Types.ObjectId(employee_id),
      },
    },
    {
      $lookup: {
        from: "employees",
        localField: "employee_id",
        foreignField: "_id",
        as: "employeeDetails",
        pipeline: [
          {
            $project: {
              username: 1,
              email: 1,
              fullname: 1,
            },
          },
        ],
      },
    },
  ]);

  if (!payroll) {
    return res.status(500).json({
      message: "Internal server error...",
    });
  }

  const monthlySalary =
    payroll[0].basic_salary +
    payroll[0].house_rent_allowance +
    payroll[0].basket_of_allowance -
    payroll[0].standard_deductions;

  const totalPayableSalary = Math.round(
    (numberOfDaysToPayble * monthlySalary) / numberOfDaysInMonth
  );

  const pdfFileData = {
    employee_id,
    username: payroll[0].employeeDetails[0].username,
    fullname: payroll[0].employeeDetails[0].fullname,
    email: payroll[0].employeeDetails[0].email,
    basic_salary: payroll[0].basic_salary,
    HRA: payroll[0].house_rent_allowance,
    basket_of_allowance: payroll[0].basket_of_allowance,
    standard_deductions: payroll[0].standard_deductions,
    presentDays,
    numberOfDaysInMonth,
    weekends,
    numberOfDaysToPayble,
    totalPayableSalary,
    year,
    month,
  };

  const pdf = generatePDF(pdfFileData);
  if (!pdf) {
    return createSalarySlip(req, res);
  }

  if (pdf?.message === "error") {
    return res.status(500).json({
      message: pdf?.error || "Internal server error...",
    });
  }

  pdfFileData.url = pdf.url;

  return res.status(200).json(pdfFileData);
};

export { addAttendanceType, getAttendance, createSalarySlip };
