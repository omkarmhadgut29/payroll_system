export const DB_NAME = "payroll_system";

const setPayrollDetails = (values) => {
  const payrollDetails = {
    basic_salary: values[0],
    standard_deductions: values[1],
    house_rent_allowance: values[2],
    basket_of_allowance: values[3],
  };

  return payrollDetails;
};

export const senior_developer_payroll = setPayrollDetails([
  50000, 3000, 10000, 20000,
]);
export const associate_developer_payroll = setPayrollDetails([
  30000, 2000, 8000, 10000,
]);
export const junior_developer_payroll = setPayrollDetails([
  20000, 1000, 5000, 5000,
]);

export const designationPayroll = {
  senior_developer: senior_developer_payroll,
  associate_developer: associate_developer_payroll,
  junior_developer: junior_developer_payroll,
};

export function getWeekendCount(year, month) {
  const lastDay = new Date(year, month, 0);
  const daysInMonth = lastDay.getDate();

  const weekends = Array.from({ length: daysInMonth }, (_, day) =>
    new Date(year, month - 1, day + 1).getDay()
  ).filter((dayOfWeek) => dayOfWeek === 0 || dayOfWeek === 6).length;

  return weekends;
}
// formating attendace data
export const attendanceOfUser = (attendanceRecords) => {
  return attendanceRecords.reduce((acc, record) => {
    const date = new Date(record.date_and_time);

    const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;

    if (!acc[formattedDate]) {
      acc[formattedDate] = {
        punch_in: null,
        punch_out: null,
        working_hours: 0,
        count: 0,
      };
    }

    if (record.type === "punch_in") {
      acc[formattedDate].punch_in = record.date_and_time;
    } else if (record.type === "punch_out") {
      acc[formattedDate].punch_out = record.date_and_time;

      const punchInTime = new Date(acc[formattedDate].punch_in);
      const punchOutTime = new Date(record.date_and_time);

      const workingHours = punchOutTime.getHours() - punchInTime.getHours();

      acc[formattedDate].working_hours += workingHours;
      acc[formattedDate].count += 1;
    }

    return acc;
  }, {});
};
