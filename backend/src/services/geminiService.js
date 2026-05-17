const { GoogleGenerativeAI } = require("@google/generative-ai");

const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

  const result = await model.generateContent(prompt);

  const responseText = result.response.text().trim();

  return JSON.parse(responseText);
};

module.exports = analyzeResumeWithGemini;
