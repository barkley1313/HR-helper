import { GoogleGenAI, Type, Schema } from "@google/genai";
import { TeamIdentity } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const teamIdentitySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    teamName: {
      type: Type.STRING,
      description: "A creative, fun, or professional name for the team based on the context or random inspiration.",
    },
    motto: {
      type: Type.STRING,
      description: "A short, catchy, one-sentence motto for the team.",
    },
  },
  required: ["teamName", "motto"],
};

export const generateTeamIdentity = async (memberNames: string[]): Promise<TeamIdentity> => {
  if (!apiKey) {
    console.warn("API Key is missing. Returning fallback data.");
    return {
      teamName: `Team ${Math.floor(Math.random() * 1000)}`,
      motto: "Ready to conquer!"
    };
  }

  try {
    const prompt = `Create a creative team name and a short motto for a group of people named: ${memberNames.join(', ')}. Keep it fun and work-appropriate.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: teamIdentitySchema,
        thinkingConfig: { thinkingBudget: 0 } // Disable thinking for faster simple creative tasks
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from AI");
    }

    return JSON.parse(text) as TeamIdentity;
  } catch (error) {
    console.error("Error generating team identity:", error);
    // Fallback in case of error
    return {
      teamName: "Awesome Team",
      motto: "Together we achieve more."
    };
  }
};
