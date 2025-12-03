import { GoogleGenAI } from "@google/genai";

// Fix: Use process.env.API_KEY directly when initializing the client.
// Assume the variable is pre-configured and valid.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const BACKGROUND_SCENARIOS = [
  "The Doha Corniche skyline during the day with air shows, maroon and white smoke trails, and Qatari flags waving.",
  "The Doha skyline at night with spectacular fireworks, laser lights in Qatari colors, and a festive atmosphere.",
  "Katara Cultural Village with its iconic pigeon towers and amphitheater, decorated with Qatar National Day banners and flowers.",
  "A luxurious traditional Qatari Majlis setting with rich Sadu patterns, golden coffee pots, and maroon flags.",
  "Souq Waqif's vibrant traditional alleyways filled with festive decorations, hanging lanterns, and Qatari flags.",
  "Lusail City's futuristic architecture (Katara Towers) with maroon lighting and a modern high-tech celebration vibe.",
  "The historic Al Zubarah Fort surrounded by a field of national day flowers and flags, blending heritage with celebration."
];

export const generateQatarNationalDayImage = async (base64Image: string): Promise<string> => {
  try {
    // 1. Dynamic MIME Type Detection
    // Matches data:image/png;base64, or data:image/jpeg;base64, etc.
    const mimeMatch = base64Image.match(/^data:(image\/[a-zA-Z+]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    
    // 2. Extract Base64 Data correctly
    const base64Data = base64Image.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');

    const randomScenario = BACKGROUND_SCENARIOS[Math.floor(Math.random() * BACKGROUND_SCENARIOS.length)];

    // 3. Refined Prompt for Image Editing
    const prompt = `
      Edit this image to create a festive Qatar National Day 2025 celebration photo.
      
      Instructions:
      1. FOREGROUND: Keep the person(s) in the original photo exactly as they are. Do not alter their faces or clothing significantly. Maintain realism.
      2. BACKGROUND: Replace the current background completely with this scene: ${randomScenario}
      3. INTEGRATION: Ensure the lighting on the person matches the new background.
      4. STYLE: High-quality, photorealistic, patriotic Qatari theme (Maroon #8A1538 and White).
      
      Output ONLY the resulting image.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', 
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType, // Use the actual detected mime type
              data: base64Data,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    // 4. Robust Response Handling
    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
        const content = candidates[0].content;
        if (content && content.parts) {
            // Priority: Look for the image
            for (const part of content.parts) {
                if (part.inlineData) {
                    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                }
            }
            
            // Fallback: Check if the model returned text (refusal or error)
            const textPart = content.parts.find(p => p.text);
            if (textPart && textPart.text) {
                console.warn("Gemini returned text:", textPart.text);
                // Return a user-friendly error based on the model's response
                throw new Error(`لم يتم إنشاء الصورة. استجابة النموذج: ${textPart.text.substring(0, 100)}...`);
            }
        }
    }

    throw new Error("لم يتم استلام أي بيانات للصورة من الخادم.");
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};