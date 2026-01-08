
import { GoogleGenAI, Type } from "@google/genai";
import { Employee, Shift } from "../types";

export const analyzeWages = async (employees: Employee[], shifts: Shift[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const context = `
    Employee Data: ${JSON.stringify(employees)}
    Shift History: ${JSON.stringify(shifts)}
  `;

  const prompt = `
    Analyze the following payroll and shift data for a small business. 
    Provide a professional summary including:
    1. Total wage expenditure.
    2. Most active employees.
    3. Efficiency insights (e.g., if anyone is working too many hours).
    4. Budgeting advice for the next month.
    Keep the response concise and formatted in Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: context + "\n" + prompt,
      config: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
      },
    });

    return response.text || "Could not generate analysis.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The AI analyzer is currently unavailable. Please check your network or try again later.";
  }
};
