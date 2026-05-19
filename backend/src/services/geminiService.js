const { GoogleGenerativeAI } = require("@google/generative-ai");
const AppError = require("../utils/AppError");

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const normalizeGeminiError = (err) => {
  const message = err?.message || "";

  if (
    message.includes("API key expired") ||
    message.includes("API_KEY_INVALID")
  ) {
    return new AppError(
      "Gemini API key is expired or invalid. Please update GEMINI_API_KEY in backend/.env.",
      502,
    );
  }

  if (message.includes("API key not valid")) {
    return new AppError(
      "Gemini API key is not valid. Please update GEMINI_API_KEY in backend/.env.",
      502,
    );
  }

  return err;
};

const isRetryableError = (err) => {
  const message = err?.message?.toLowerCase() || "";

  return (
    message.includes("503") ||
    message.includes("overloaded") ||
    message.includes("high demand") ||
    message.includes("busy") ||
    message.includes("unavailable") ||
    message.includes("rate limit") ||
    message.includes("timeout")
  );
};

const analyzeResumeWithGemini = async (rawText) => {
  const model = client.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  const prompt = `
Extract the following details from this resume and return ONLY a valid JSON object with no extra text, no markdown, no backticks:

{
  "name": "",
  "designation": "",
  "companyName": "",
  "address": "",
  "mobileNumber": "",
  "officialEmail": "",
  "whatsappNumber": "",
  "yearsOfExperience": "",
  "shortSummary": ""
}

Rules:
- If a field is not found, set it to null
- For shortSummary: give a 2-3 line summary of the candidate's interests/skills, projects and work experience based on the resume
- For whatsappNumber: if not explicitly mentioned, copy mobileNumber
- For yearsOfExperience: extract number as a string (e.g. "10"), infer from work history dates if not stated explicitly
- Return ONLY the JSON object, nothing else

Resume text:
${rawText}
`;

  const MAX_RETRIES = 5;

  let result;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      result = await model.generateContent(prompt);
      break;
    } catch (err) {
      const normalizedError = normalizeGeminiError(err);

      if (!isRetryableError(normalizedError) || attempt === MAX_RETRIES) {
        throw normalizedError;
      }

      console.log(
        `Gemini temporarily unavailable. Retrying ${attempt}/${MAX_RETRIES}...`,
      );

      // exponential backoff
      await sleep(1000 * attempt);
    }
  }

  let responseText = result.response.text().trim();

  // remove triple-backtick code fences
  responseText = responseText
    .replace(/```(?:json)?\n?/g, "")
    .replace(/```/g, "")
    .trim();

  // to locate the first JSON object in the response text and parse it
  const firstBrace = responseText.indexOf("{");
  if (firstBrace === -1) {
    throw new Error(`No JSON object found in model response: ${responseText}`);
  }

  for (let i = responseText.length - 1; i >= firstBrace; i--) {
    if (responseText[i] !== "}") continue;
    const candidate = responseText.substring(firstBrace, i + 1);
    try {
      return JSON.parse(candidate);
    } catch (e) {}
  }

  // As a last resort, throw with response included to aid debugging
  throw new Error(`Could not parse JSON from model response: ${responseText}`);
};

module.exports = analyzeResumeWithGemini;
