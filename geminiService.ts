
import { GoogleGenAI } from "@google/genai";
import { LeaveRequest } from "./types";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getAdminInsights(requests: LeaveRequest[]) {
  if (requests.length === 0) return "No records found to analyze for today.";

  const dataSummary = requests.map(r => ({
    student: r.studentName,
    reason: r.reason,
    status: r.status,
    type: r.type,
    requestedAt: new Date(r.requestedAt).toISOString(),
    exitedAt: r.exitedAt ? new Date(r.exitedAt).toISOString() : null,
    returnedAt: r.returnedAt ? new Date(r.returnedAt).toISOString() : null,
  }));

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        Analyze the following school leave records and provide a professional executive summary.
        
        Specifically, please analyze and report on:
        1. The average duration of completed leaves (from exit to return).
        2. Peak times of the day when students are requesting to leave.
        3. Common themes or recurring reasons specifically for EMERGENCY leaves.
        4. Any unusual patterns or potential policy misuse.

        Be concise but insightful. Limit to 200 words.
        
        Data: ${JSON.stringify(dataSummary)}
      `,
      config: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Insights Error:", error);
    return "Unable to generate AI insights at this moment due to a connection error.";
  }
}
