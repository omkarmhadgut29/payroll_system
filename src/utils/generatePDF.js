import fs from "fs";
import PDFDocument from "pdfkit";

export const generatePDF = (pdfFileData) => {
  const doc = new PDFDocument({ compress: false });

  let path = `./public/salary_slip/${pdfFileData.employee_id}`;
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }

  const outputPath = `${path}/${pdfFileData.employee_id}_${pdfFileData.year}_${pdfFileData.month}.pdf`;

  if (fs.existsSync(outputPath)) {
    return {
      message: "Success",
      url: outputPath,
    };
  }

  const writeStream = fs.createWriteStream(outputPath);
  doc.pipe(writeStream);

  doc.fontSize(14).text("Salary Slip", { align: "center" });
  doc.moveDown();

  doc.fontSize(12).text(`Employee ID: ${pdfFileData.employee_id}`);
  doc.fontSize(12).text(`Employee Username: ${pdfFileData.username}`);
  doc.fontSize(12).text(`Employee Fullname: ${pdfFileData.fullname}`);
  doc.fontSize(12).text(`Employee Email: ${pdfFileData.email}`);
  doc.fontSize(12).text(`Basic Salary: Rs ${pdfFileData.basic_salary}`);
  doc.fontSize(12).text(`HRA: Rs ${pdfFileData.HRA}`);
  doc
    .fontSize(12)
    .text(`Basket of Allowance (BOA) : Rs ${pdfFileData.basket_of_allowance}`);
  doc
    .fontSize(12)
    .text(
      `Standard Deductions (TA + Medical) : Rs ${pdfFileData.standard_deductions}`
    );
  doc.fontSize(12).text(`Present Days: ${pdfFileData.presentDays}`);
  doc
    .fontSize(12)
    .text(`Number Of Days In Month: ${pdfFileData.numberOfDaysInMonth}`);
  doc.fontSize(12).text(`Weekends: ${pdfFileData.weekends}`);
  doc
    .fontSize(12)
    .text(`Number Of Days To Payble: ${pdfFileData.numberOfDaysToPayble}`);
  doc
    .fontSize(12)
    .text(`Total Payable Salary: Rs ${pdfFileData.totalPayableSalary}`, {
      underline: true,
    });

  doc.end();

  writeStream.on("finish", () => {
    return {
      message: `PDF saved to: ${outputPath}`,
      url: outputPath,
    };
  });
  doc.on("error", (err) => {
    console.error(`Error creating PDF: ${err}`);
    return {
      message: "error",
      error: `Error creating PDF: ${err}`,
    };
  });

  writeStream.on("error", (err) => {
    console.error(`Error writing to file: ${err}`);
    return {
      message: "error",
      error: `Error writing to file: ${err}`,
    };
  });
};
