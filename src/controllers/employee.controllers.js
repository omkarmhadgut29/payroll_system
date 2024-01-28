import mongoose from "mongoose";
import { Employee } from "../models/employee.models.js";
import jwt from "jsonwebtoken";
import { Payroll } from "../models/payroll.models.js";
import { designationPayroll } from "../constants.js";

const generateAccessAndRefreshToken = async (employee) => {
  try {
    console.log(employee);
    // const user = await User.findOne({ _id: employee });

    const accessToken = await employee.generateAccessToken();
    const refreshToken = await employee.generateRefreshToken();

    employee.refreshToken = refreshToken;
    await employee.save({ validateBeforeSave: false });

    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    console.log(error);
    throw new Error("Something went wrong...");
  }
};

const refreshAccessToken = async (req, res) => {
  const userRefreshToken = req.body.refreshToken;

  if (!userRefreshToken) {
    return res.status(401).json({ message: "Unauthorised access..." });
  }

  const decodedToken = jwt.verify(
    userRefreshToken,
    process.env.REFRESH_TOKEN_SECRETE_KEY
  );

  const user = await Employee.findOne({ _id: decodedToken._id });

  if (!user) {
    return res.status(401).json({ message: "Invalid refresh token." });
  }

  if (userRefreshToken !== user?.refreshToken) {
    user.refreshToken = "";
    await user.save();

    return res.status(401).json({ message: "Refresh token expries or used" });
  }

  const { accessToken, refreshToken } =
    await generateAccessAndRefreshToken(user);

  return res.status(200).json({
    accessToken,
    refreshToken,
  });
};

const registerEmployee = async (req, res) => {
  const {
    username,
    password,
    fullname,
    email,
    mobile,
    designation,
    department,
    status,
  } = req.body;

  if (
    [username, password, fullname, email, designation, department].some(
      (field) => !field || field?.trim() === ""
    ) ||
    !mobile
  ) {
    return res.status(400).json({
      message: "All fields are required...",
    });
  }

  const isEmployeeExists = await Employee.findOne({
    $or: [{ username }, { email }],
  });

  if (isEmployeeExists) {
    return res.status(400).json({
      message: "User already exists...",
    });
  }

  const data = {
    username,
    password,
    fullname,
    email,
    mobile,
    designation,
    department,
    status: status && true,
  };

  const accessToken = req.header("Authorization")?.replace("Bearer ", "");

  if (accessToken) {
    const decodedToken = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRETE_KEY
    );

    if (decodedToken) {
      data.createdBy = decodedToken._id;
    }
  }

  const employee = await Employee.create(data);

  if (!employee) {
    return res.status(500).json({
      message: "Internal server error...",
    });
  }

  let payrollData = designationPayroll[employee.designation];
  payrollData.employee_id = employee._id;
  payrollData.designation = employee.designation;

  const payroll = await Payroll.create(payrollData);

  if (!payroll) {
    return res.status(500).json({
      message: "Internal server error...",
    });
  }

  delete data.password;

  return res.status(201).json({
    message: "Employee created successfully...",
    data,
  });
};

const loginEmployee = async (req, res) => {
  const { username, password } = req.body;

  if ([username, password].some((field) => !field || field?.trim() === "")) {
    return res.status(400).json({
      message: "All fields are required...",
    });
  }

  const employee = await Employee.findOne({ username });

  if (!employee) {
    return res.status(400).json({
      message: "Invalid username...",
    });
  }

  if (!employee.status) {
    return res.status(401).json({
      messeage:
        "Unauthorized request... Your status is inactive. Please contact to admin.",
    });
  }

  const isValidUser = await employee.isPasswordCorrect(password);
  if (!isValidUser) {
    return res.status(404).json({ message: "Password dose not matched...." });
  }

  const { accessToken, refreshToken } =
    await generateAccessAndRefreshToken(employee);

  const employeeData = {
    _id: employee._id,
    username: employee.username,
    fullname: employee.fullname,
    email: employee.email,
  };

  return res.status(200).json({
    message: "User Loged In Successfully...",
    employee: employeeData,
    accessToken,
    refreshToken,
  });
};

const getEmployees = async (req, res) => {
  const employees = await Employee.aggregate([
    {
      $lookup: {
        from: "employees",
        localField: "createdBy",
        foreignField: "_id",
        as: "createdByEmployee",
        pipeline: [
          {
            $project: {
              username: 1,
              email: 1,
              designation: 1,
              fullname: 1,
            },
          },
        ],
      },
    },
    {
      $project: {
        username: 1,
        email: 1,
        designation: 1,
        fullname: 1,
        createdByEmployee: 1,
        date_of_joining: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  if (!employees) {
    return res.status(500).json({
      message: "Internal server error...",
    });
  }

  return res.status(200).json({
    message: "Success...",
    employees,
  });
};

const getEmployee = async (req, res) => {
  const { _id } = req.params;
  const employee = await Employee.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(_id),
      },
    },
    {
      $lookup: {
        from: "employees",
        localField: "createdBy",
        foreignField: "_id",
        as: "createdByEmployee",
        pipeline: [
          {
            $project: {
              username: 1,
              email: 1,
              designation: 1,
              fullname: 1,
            },
          },
        ],
      },
    },
    {
      $project: {
        username: 1,
        email: 1,
        designation: 1,
        fullname: 1,
        createdByEmployee: 1,
      },
    },
  ]);

  if (!employee || employee?.length < 1) {
    return res.status(404).json({
      message: "Employee not found...",
    });
  }

  return res.status(200).json({
    message: "Success...",
    employee,
  });
};

const updateEmployee = async (req, res) => {
  const { _id } = req.params;

  const { fullname, mobile, designation } = req.body;

  if ([fullname, mobile, designation].every((field) => !field) || !_id) {
    return res.status(400).json({
      message: "To update employee required data...",
    });
  }

  const dataToUpdate = { fullname, mobile, designation };

  const employee = await Employee.findByIdAndUpdate(_id, dataToUpdate);

  if (!employee) {
    return res.status(404).json({
      message: "Employee not found...",
    });
  }

  if (designation) {
    console.log(designation);
    const payroll = await Payroll.findOne({ employee_id: employee._id });
    if (payroll.designation !== designation) {
      console.log(designation);
      let payrollData = designationPayroll[designation];

      payroll.basic_salary = payrollData.basic_salary;
      payroll.standard_deductions = payrollData.standard_deductions;
      payroll.house_rent_allowance = payrollData.house_rent_allowance;
      payroll.basket_of_allowance = payrollData.basket_of_allowance;
      payroll.designation = designation;
      await payroll.save();

      // future scope...
      // if designation changes then if salary_slip is created for this month
      // should be delete
      // const outputPath = `./public/salary_slip/${payroll.employee_id}`;

      // if (fs.existsSync(outputPath)) {
      //   fs.rmSync(outputPath, { recursive: true, force: true });
      // }
    }
  }

  console.log(req.user._id);
  console.log(employee.updatedBy);
  employee.updatedBy = req.user._id;
  console.log(employee);

  await employee.save({ validateBeforeSave: false });

  return res.status(200).json({
    message: "Success...",
    username: employee.username,
    email: employee.email,
    fullname: fullname || employee.fullname,
    mobile: mobile || employee.mobile,
    designation: designation || employee.designation,
  });
};

const deleteEmployee = async (req, res) => {
  const { _id } = req.params;

  const employee = await Employee.findByIdAndDelete(_id);

  if (!employee) {
    return res.status(404).json({
      message: "Employee not found...",
    });
  }

  const payroll = await Payroll.findOneAndDelete({
    employee_id: _id,
  });

  if (!payroll) {
    return res.status(500).json({
      message: "Payroll for above employee not found...",
    });
  }

  return res.status(200).json({
    message: "Employee deleted successfully...",
  });
};

export {
  registerEmployee,
  loginEmployee,
  getEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee,
  refreshAccessToken,
};
