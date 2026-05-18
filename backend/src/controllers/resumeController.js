const extractTextFromFile = require("../services/pdfParserService");
const analyzeResumeWithGemini = require("../services/geminiService");

const parseResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No file uploaded",
      });
    }

    const rawText = await extractTextFromFile(req.file);

    if (!rawText.trim()) {
      return res.status(400).json({
        error: "Could not extract text from the file.",
      });
    }

    const parsedData = await analyzeResumeWithGemini(rawText);

    return res.json({
      success: true,
      data: parsedData,
    });
  } catch (err) {
    console.error("Error:", err.message);

    return res.status(500).json({
      error: "Failed to parse resume",
      details: err.message,
    });
  }
};

module.exports = {
  parseResume,
};
