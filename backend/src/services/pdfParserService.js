const mammoth = require("mammoth");

const ensurePdfGlobals = () => {
  if (!globalThis.DOMMatrix) {
    const { DOMMatrix, DOMPoint, DOMRect } = require("@napi-rs/canvas/geometry");

    globalThis.DOMMatrix = DOMMatrix;
    globalThis.DOMPoint = DOMPoint;
    globalThis.DOMRect = DOMRect;
  }

  if (!globalThis.ImageData) {
    globalThis.ImageData = class ImageData {};
  }

  if (!globalThis.Path2D) {
    globalThis.Path2D = class Path2D {};
  }
};

const extractTextFromFile = async (file) => {
  const { mimetype, buffer, originalname } = file;

  let rawText = "";

  if (mimetype === "application/pdf") {
    ensurePdfGlobals();
    const { PDFParse } = require("pdf-parse");
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
