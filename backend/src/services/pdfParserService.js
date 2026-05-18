const { PDFParse } = require("pdf-parse");
const mammoth = require("mammoth");

const extractTextFromFile = async (file) => {
  const { mimetype, buffer, originalname } = file;

  let rawText = "";

  if (mimetype === "application/pdf") {
    const parser = new PDFParse({ data: buffer });

    const data = await parser.getText();

    rawText = data.text;
  } else if (
    mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    originalname.endsWith(".docx")
  ) {
    const result = await mammoth.extractRawText({ buffer });

    rawText = result.value;
  } else {
    throw new Error("Unsupported file type. Please upload a PDF or DOCX.");
  }

  return rawText;
};

module.exports = extractTextFromFile;
