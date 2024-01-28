// const fs = require("fs");
// const PDFDocument = require("pdfkit");

import fs from "fs";
import PDFDocument from "pdfkit";

// Sample data for the salary slip
export const generatePDF = () => {
  const salaryData = {
    employeeName: "John Doe",
    employeeId: "EMP001",
    basicSalary: 5000,
    allowances: 2000,
    deductions: 500,
    netSalary: 7500,
  };

  // Create a PDF document
  const doc = new PDFDocument();

  // Pipe the PDF to a file
  const outputPath = "salary_slip.pdf";
  const writeStream = fs.createWriteStream(outputPath);
  doc.pipe(writeStream);

  // Add content to the PDF
  doc.fontSize(14).text("Salary Slip", { align: "center" });
  doc.moveDown();

  doc.fontSize(12).text(`Employee Name: ${salaryData.employeeName}`);
  doc.fontSize(12).text(`Employee ID: ${salaryData.employeeId}`);
  doc.fontSize(12).text(`Basic Salary: $${salaryData.basicSalary}`);
  doc.fontSize(12).text(`Allowances: $${salaryData.allowances}`);
  doc.fontSize(12).text(`Deductions: $${salaryData.deductions}`);
  doc
    .fontSize(12)
    .text(`Net Salary: $${salaryData.netSalary}`, { underline: true });

  // Finalize the PDF
  doc.end();

  // Handle the end event to log completion
  writeStream.on("finish", () => {
    console.log(`PDF saved to: ${outputPath}`);
    return {
      message: `PDF saved to: ${outputPath}`,
    };
  });

  // Handle errors during PDF creation
  doc.on("error", (err) => {
    console.error(`Error creating PDF: ${err}`);
    return {
      message: "error",
      error: `Error creating PDF: ${err}`,
    };
  });

  // Close the write stream
  writeStream.on("error", (err) => {
    console.error(`Error writing to file: ${err}`);
    return {
      message: "error",
      error: `Error writing to file: ${err}`,
    };
  });
};
