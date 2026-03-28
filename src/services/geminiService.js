import { GoogleGenAI } from '@google/genai';

// Initialize with environment key
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

/**
 * Converts a File object to a base64 string
 * @param {File} file 
 * @returns {Promise<string>} Base64 encoded string
 */
const fileToGenerativePart = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // FileReader result includes 'data:mimetype;base64,....'
      const base64Data = reader.result.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type
        }
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Sends prompt to Gemini and structures it strictly as an emergency plan
 * @param {string} text - User's verbal/typed panic text
 * @param {File} [imageFile] - Optional context image
 * @returns {Promise<Object>} { actionPlan: string, dispatchData: Object }
 */
export const runTriageIntelligence = async (text, imageFile) => {
  const systemPrompt = `
You are a highly trained Emergency Medical Dispatch & First-Aid AI.
Review the following distressed input (which may include text and an image of the incident).

Your task is to respond ONLY with a raw JSON object containing these exact exactly 2 properties:
1. "actionPlan": A clean, HTML formatted string detailing 3 to 5 immediate first-aid steps. Use <h3>, <ul>, and <li> tags. Emphasize critical actions with <strong>. Do NOT use markdown code blocks (\`\`\`).
2. "dispatchData": A nested JSON object with "urgency" (Low, Medium, High, Critical), "suggestedUnit" (Ambulance, Fire, Police), and "location" (extracted or inferred string, defaults to 'Unknown Location').

Example Output:
{
  "actionPlan": "<h3>Immediate Steps</h3><ul><li><strong>Stay calm</strong> and ensure scene safety.</li><li>Apply direct pressure...</li></ul>",
  "dispatchData": {
    "urgency": "High",
    "suggestedUnit": "Ambulance",
    "location": "Main St"
  }
}
`;

  try {
    const contents = [];
    contents.push({ text: systemPrompt });
    contents.push({ text: `User Emergency Input: ${text}` });

    if (imageFile) {
      const imagePart = await fileToGenerativePart(imageFile);
      contents.push(imagePart);
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("Empty response from Gemini.");
    
    // Parse the JSON strictly
    return JSON.parse(resultText);

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to process the emergency input. Please call 911 immediately if this is life-threatening.");
  }
};
