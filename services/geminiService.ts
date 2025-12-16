import { GoogleGenAI, Modality } from "@google/genai";
import { ProjectInfo, ShowcaseScene, ProjectType, Character, LocationAsset, Poster, ScriptBeat, TwistOption, BudgetLineItem } from "../types";
import { INDIAN_CINEMA_BEATS } from "../constants";

// --- API KEY MANAGEMENT ---

// Safe storage access to prevent crashes in restricted iframes/incognito
const safeGetItem = (key: string): string | null => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(key);
    }
  } catch (e) {
    console.warn(`Unable to access localStorage for ${key}`, e);
  }
  return null;
};

const getApiKey = (): string => {
  // Check Environment Variable (Build time) OR Local Storage (Runtime)
  // This fixes the issue where Netlify vars might not inject correctly without a rebuild
  const key = process.env.API_KEY || safeGetItem('gemini_api_key') || '';
  return key;
};

const getAIClient = () => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API Key is missing. Please add it in the app settings or profile menu.");
  }
  return new GoogleGenAI({ apiKey });
};

// Relaxed safety settings for creative content
const SAFETY_SETTINGS = [
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' }
];

// Helper to extract base64 image from response (GenerateContentResponse)
const extractImageFromResponse = (response: any): string | null => {
  for (const candidate of response.candidates || []) {
    if (candidate.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData && part.inlineData.data) {
           return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
  }
  return null;
};

// --- GENERIC IMAGE GENERATOR HELPER ---
// Tries primary model, then falls back to pro model if needed.
const generateImageWithFallback = async (
  contents: any, 
  aspectRatio: string
): Promise<string | null> => {
  const ai = getAIClient();
  
  // CORRECT MODELS FOR IMAGE GENERATION
  // Do NOT use 'gemini-1.5-flash' here as it does not generate images.
  const models = ["gemini-2.5-flash-image", "gemini-3-pro-image-preview"];
  
  let lastError: any = null;

  for (const model of models) {
    try {
      console.log(`Attempting image generation with ${model}...`);
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          imageConfig: { aspectRatio },
          safetySettings: SAFETY_SETTINGS as any
        }
      });
      const image = extractImageFromResponse(response);
      if (image) {
        console.log(`Success: Generated image with ${model}`);
        return image;
      } else {
        console.warn(`Model ${model} returned no image data.`);
      }
    } catch (e: any) {
      console.warn(`Image generation failed with model ${model}.`, e.message);
      
      // Check specifically for Rate Limit / Quota errors
      const isQuotaError = e.message?.includes('429') || 
                           e.message?.includes('Quota exceeded') || 
                           e.message?.includes('RESOURCE_EXHAUSTED');

      if (isQuotaError) {
         console.error("Quota exceeded for image generation.");
         // Stop the loop immediately to avoid further errors
         throw new Error("QUOTA_EXCEEDED: Free Tier limit reached. Please wait 1-2 minutes before trying again.");
      }

      lastError = e;
    }
  }
  
  // If we get here, all models failed (and weren't quota errors that threw early)
  console.error("All image generation attempts failed. Last error:", lastError);
  if (lastError) {
     throw new Error(`Image Gen Failed: ${lastError.message || "Check API Key & Quota"}`);
  }
  return null;
};

export const generateSlideContent = async (
  project: ProjectInfo,
  slideTitle: string,
  currentContent: string
): Promise<string> => {
  try {
    const ai = getAIClient();
    // TEXT MODEL
    const model = "gemini-2.5-flash"; 
    
    const langInstruction = project.language === 'ml' 
      ? "Write the output content strictly in Malayalam language (മലയാളം)." 
      : "Write the output in English.";

    let role = "expert film producer";
    if (project.projectType === ProjectType.STARTUP_PITCH) role = "venture capital consultant";
    if (project.projectType === ProjectType.DOCUMENTARY) role = "documentary researcher";

    let prompt = `
      You are an ${role} helping to write a pitch deck.
      
      Project Details:
      Type: ${project.projectType}
      Title: ${project.title}
      Genre/Category: ${project.genre}
      Logline: ${project.logline}
      Creator: ${project.director}
      
      FULL CONTEXT (Script/Plan):
      ${project.fullScript ? project.fullScript.substring(0, 20000) : "No full details provided, use logline."}

      Task: Write professional, compelling content for a pitch deck slide titled "${slideTitle}".
      
      Context/Existing Content: ${currentContent || "None provided yet."}

      Requirements:
      - ${langInstruction}
      - Keep it concise (under 150 words).
      - Use industry-standard terminology for ${project.projectType}.
      - Make it persuasive.
      - Return ONLY the content text, no markdown formatting like **bold** headers if possible.
    `;

    if (slideTitle.includes("Budget") || slideTitle.includes("ROI") || slideTitle.includes("Financial")) {
      prompt += `
        SPECIAL INSTRUCTION: Analyze the project complexity. Estimate a realistic budget/financials.
        For Movies: Estimate in Crores (₹ Cr) for Indian Context.
        For Startups: Estimate in USD/INR ($ or ₹) for seed/Series A funding.
        Break down costs appropriately.
      `;
    }

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text?.trim() || "";
  } catch (error: any) {
    console.error("Content Gen Error:", error);
    return "Error generating content. Please check your API Key.";
  }
};

export const refineScript = async (
  currentScript: string, 
  instruction: string,
  language: 'en' | 'ml' = 'en'
): Promise<string> => {
  try {
    const ai = getAIClient();
    const model = "gemini-2.5-flash";

    const langDirective = language === 'ml' 
      ? "STRICTLY OUTPUT IN MALAYALAM (മലയാളം). Do not translate to English technical terms like INT/EXT unless typical for the format. If the input is Malayalam, keep it Malayalam."
      : "Output in English.";

    const prompt = `
      You are a professional Screenwriter and Script Doctor compatible with International and Indian (Mollywood) standards.
      
      Language Requirement: ${langDirective}
      
      Current Script Segment:
      ${currentScript.substring(0, 25000)}

      User Instruction: "${instruction}"

      Task:
      Rewrite or format the script based on the instruction.
      - If the instruction is "Auto Format", convert the text into standard screenplay format (Scene Headings CAPS, Character names centered/CAPS, Dialogue centered).
      - If the instruction is "Enhance Dialogue", improve the dialogue flow.
      - If the language is Malayalam, ensure the screenplay format is maintained (using English for technical terms like EXT./INT. is okay, but dialogue/action should be Malayalam).
      
      Return ONLY the refined script text. Do not add conversational filler.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text?.trim() || "";
  } catch (error: any) {
    console.error("Script Refine Error:", error);
    return "";
  }
};

export const generateVisualPrompt = async (
  project: ProjectInfo,
  slideTitle: string,
  slideContent: string,
  extraStyle?: string
): Promise<string> => {
  try {
    const ai = getAIClient();
    const model = "gemini-2.5-flash";

    const prompt = `
      Act as a visual prompt engineer for high-end AI image generators.
      
      Project Concept:
      Type: ${project.projectType}
      Title: ${project.title}
      Genre: ${project.genre}
      
      Visual Context:
      Subject: ${slideTitle}
      Description: ${slideContent}
      
      Specific Style Instructions: ${extraStyle || "Cinematic, Photorealistic"}

      Task: Write a highly detailed, descriptive image prompt.
      
      Requirements:
      - ALWAYS write the prompt in ENGLISH.
      - Include camera angles, lighting, color palette, and mood.
      - Focus on the visual essence of the subject.
      - Output ONLY the prompt string.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text?.trim() || "";
  } catch (error: any) {
    console.error("Prompt Gen Error:", error);
    return "Cinematic shot, 8k resolution, highly detailed, dramatic lighting --ar 16:9";
  }
};

export const generateSlideImage = async (imagePrompt: string, aspectRatio: '16:9'|'1:1'|'2:3' = '16:9'): Promise<string | null> => {
  // Map custom aspect ratios
  let targetRatio = "16:9";
  if (aspectRatio === '1:1') targetRatio = "1:1";
  if (aspectRatio === '2:3') targetRatio = "3:4"; 

  const contents = { parts: [{ text: imagePrompt }] };
  return generateImageWithFallback(contents, targetRatio);
};

// Specialized Poster Generator
export const generatePosterImage = async (
  poster: Poster,
  project: ProjectInfo
): Promise<string | null> => {
  
  // Prepare Prompt
  let refInstructions = "";
  const parts: any[] = [];

  if (poster.characterRefId) {
    const char = project.characters?.find(c => c.id === poster.characterRefId);
    if (char && char.imageUrl) {
       const base64Data = char.imageUrl.split(',')[1];
       if (base64Data) {
          parts.push({ inlineData: { mimeType: "image/png", data: base64Data } });
          refInstructions = `REFERENCE CHARACTER: Use the facial features and identity of the character in the attached image. `;
       }
    }
  } else if (poster.referenceImageUrl) {
    const base64Data = poster.referenceImageUrl.split(',')[1];
    if (base64Data) {
       parts.push({ inlineData: { mimeType: "image/png", data: base64Data } });
       refInstructions = `REFERENCE IMAGE: Use the style or character features from the attached image as a key reference. `;
    }
  }

  const fullPrompt = `
    Create a High Quality Movie Poster.
    ${refInstructions}
    
    Details:
    Title: ${poster.title}
    Tagline: ${poster.tagline}
    Visual Description: ${poster.prompt}
    Style: ${poster.style}
    
    Requirements: 
    - Cinematic lighting, professional composition.
    - High resolution text rendering for the Title if possible.
    - ${refInstructions ? "Maintain strict consistency with the reference image provided." : ""}
  `;

  parts.push({ text: fullPrompt });

  let targetRatio = "3:4";
  if (poster.aspectRatio === '16:9') targetRatio = "16:9";
  if (poster.aspectRatio === '1:1') targetRatio = "1:1";
  if (poster.aspectRatio === '2:3') targetRatio = "3:4";

  return generateImageWithFallback({ parts }, targetRatio);
};


// Specialized Character Generator
export const generateCharacterImage = async (
  character: Character,
  prompt: string
): Promise<string | null> => {

  const parts: any[] = [];
  let refInstructions = "";

  // 1. Face / Identity Reference
  if (character.referenceImageUrl) {
    const base64Data = character.referenceImageUrl.split(',')[1];
    if (base64Data) {
      parts.push({
        inlineData: { mimeType: "image/png", data: base64Data }
      });
      refInstructions += "REFERENCE IMAGE 1 (FACE/IDENTITY): Use this image as the strict reference for the character's facial features and identity. ";
    }
  }

  // 2. Pose / Action Reference
  if (character.actionReferenceImageUrl) {
    const base64Data = character.actionReferenceImageUrl.split(',')[1];
    if (base64Data) {
      parts.push({
        inlineData: { mimeType: "image/png", data: base64Data }
      });
      refInstructions += "REFERENCE IMAGE 2 (POSE/BODY): Use this image as the reference for the character's pose, body language, and action. ";
    }
  }

  const fullPrompt = `
    ${refInstructions}
    
    Generate a Character Design / Portrait.
    Description: ${prompt}
    
    ${refInstructions ? "Ensure consistency with provided reference images." : ""}
  `;

  parts.push({ text: fullPrompt });

  let targetRatio = "1:1";
  if (character.aspectRatio === '16:9') targetRatio = "16:9";
  if (character.aspectRatio === '2:3') targetRatio = "3:4";

  return generateImageWithFallback({ parts }, targetRatio);
};

// Specialized Storyboard Generator
export const generateStoryboardImage = async (
  project: ProjectInfo,
  scene: ShowcaseScene
): Promise<string | null> => {

  // 1. Prepare Technical Specs
  const techSpecs = [
    scene.lensType ? `${scene.lensType} lens` : '',
    scene.cameraAngle ? `${scene.cameraAngle} shot` : '',
    scene.shotSize ? `${scene.shotSize}` : '',
    scene.imageStyle ? `Art Style: ${scene.imageStyle}` : '',
    scene.colorGrade ? `Color Grading/Mood: ${scene.colorGrade}` : ''
  ].filter(Boolean).join(", ");

  const textPrompt = `
    Create a Wide 16:9 Cinematic Storyboard Image.
    Scene Action: ${scene.action}
    Camera & Visual Specs: ${techSpecs}
    General Style: ${scene.imageStyle || "Realistic cinematic storyboard"}
    Lighting: High contrast, dynamic composition, cinematic lighting.
    Format: Landscape 16:9 Aspect Ratio.
  `;

  // 2. Prepare Reference Images (Multimodal)
  const parts: any[] = [];
  let castingPrompt = "";

  const addCharacterReference = (charId: string, slotName: string) => {
    const character = project.characters?.find(c => c.id === charId);
    if (character && character.imageUrl) {
      const base64Data = character.imageUrl.split(',')[1];
      if (base64Data) {
        parts.push({
          inlineData: { mimeType: "image/png", data: base64Data }
        });
        return `The character in the attached image is ${character.name} (${slotName}). `;
      }
    }
    return "";
  };

  if (scene.characterRef1Id) {
    castingPrompt += addCharacterReference(scene.characterRef1Id, "Character A");
  }
  if (scene.characterRef2Id) {
    castingPrompt += addCharacterReference(scene.characterRef2Id, "Character B");
  }

  if (castingPrompt) {
    castingPrompt += "MAINTAIN CHARACTER CONSISTENCY. Use the visual features (face, hair, clothes) from the reference image(s) for the characters in this scene.";
  }

  // 3. Combine Text Prompt
  parts.push({
    text: `${castingPrompt}\n\n${textPrompt}`
  });

  return generateImageWithFallback({ parts }, "16:9");
};

export const generateNextShowcaseScene = async (
  project: ProjectInfo,
  existingScenes: ShowcaseScene[]
): Promise<ShowcaseScene | null> => {
  try {
    const ai = getAIClient();
    const model = "gemini-2.5-flash";

    const prevScenesSummary = existingScenes.map(s => `${s.heading}: ${s.action}`).join("\n");

    const prompt = `
      You are a storyboard artist and script breakdown specialist.
      
      Project: ${project.title} (${project.projectType})
      
      Full Story: ${project.fullScript ? project.fullScript.substring(0, 15000) : project.logline}

      Already Generated Scenes:
      ${prevScenesSummary}

      Task: Identify the NEXT key logical scene or beat.
      
      Output Format (Strictly Text with delimiters):
      HEADING: [Scene Heading]
      ACTION: [Brief description]
      PROMPT: [A highly detailed English visual prompt]
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "text/plain"
      }
    });

    const text = response.text?.trim() || "";
    
    // Simple parsing logic
    const headingMatch = text.match(/HEADING:\s*(.+)/);
    const actionMatch = text.match(/ACTION:\s*(.+)/);
    const promptMatch = text.match(/PROMPT:\s*(.+)/);

    if (headingMatch && actionMatch && promptMatch) {
      return {
        id: `scene-${Date.now()}`,
        heading: headingMatch[1].trim(),
        action: actionMatch[1].trim(),
        visualPrompt: promptMatch[1].trim(),
        // Defaults
        shotSize: 'Wide / Master',
        cameraAngle: 'Eye Level',
        lensType: '35mm',
        imageStyle: 'Hyper Realistic',
        colorGrade: 'Cinematic'
      };
    }

    return null;

  } catch (error: any) {
    console.error("Scene Gen Error:", error);
    return null;
  }
};

// --- AUDIO GENERATION (TTS) ---
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function pcmToWav(pcmData: Uint8Array, sampleRate: number = 24000) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcmData.length;
  const chunkSize = 36 + dataSize;

  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, chunkSize, true);
  writeString(view, 8, 'WAVE');

  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); 
  view.setUint16(20, 1, true); 
  view.setUint16(22, numChannels, true); 
  view.setUint32(24, sampleRate, true); 
  view.setUint32(28, byteRate, true); 
  view.setUint16(32, blockAlign, true); 
  view.setUint16(34, bitsPerSample, true); 

  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true); 

  const pcmBytes = new Uint8Array(buffer, 44);
  pcmBytes.set(pcmData);

  return buffer;
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

export const generateVoiceOver = async (text: string, voiceName: string): Promise<string | null> => {
  try {
    const ai = getAIClient();
    const model = "gemini-2.5-flash-preview-tts";

    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName }
          }
        }
      }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const pcmData = decode(base64Audio);
      const wavBuffer = pcmToWav(pcmData, 24000); 
      const blob = new Blob([wavBuffer], { type: 'audio/wav' });
      return URL.createObjectURL(blob);
    }
    return null;

  } catch (error: any) {
    console.error("Audio Gen Error:", error);
    throw error;
  }
};

// Veo Video Generation
export const generateVideoTrailer = async (prompt: string): Promise<string | null> => {
  try {
    // Veo MANDATES paid key selection via UI.
    if (typeof window !== 'undefined' && (window as any).aistudio) {
        const aiStudio = (window as any).aistudio;
        try {
          const hasKey = await aiStudio.hasSelectedApiKey();
          if (!hasKey) {
            await aiStudio.openSelectKey();
          }
        } catch (e) {
          console.warn("AI Studio key selection failed", e);
        }
    }
    
    // Create new client to pick up selected key from process.env.API_KEY
    const ai = getAIClient();
    const model = "veo-3.1-fast-generate-preview";

    let operation;
    try {
        operation = await ai.models.generateVideos({
            model,
            prompt,
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: '16:9'
            }
        });
    } catch (e: any) {
        // Handle "Requested entity was not found" error as per guidelines
        if (e.message?.includes("Requested entity was not found")) {
            if (typeof window !== 'undefined' && (window as any).aistudio) {
                 await (window as any).aistudio.openSelectKey();
                 throw new Error("API Key was not found. Please select a valid key and try again.");
            }
        }
        throw e;
    }

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({operation: operation});
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) return null;

    // Use getApiKey helper for fetching
    const apiKey = getApiKey();
    const response = await fetch(`${downloadLink}&key=${apiKey}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);

  } catch (error: any) {
    console.error("Video Gen Error:", error);
    throw error;
  }
};

// --- LOCATION SCOUT ---

export const findLocations = async (project: ProjectInfo, requirements: string, region: string): Promise<LocationAsset[]> => {
  try {
    const ai = getAIClient();
    const model = "gemini-2.5-flash";

    const prompt = `
      Act as a professional Film Location Scout.
      
      Project Requirements:
      Scene Vibe: ${requirements}
      Target Region: ${region}
      
      Task: Find 3-4 REAL world locations that match this description perfectly.
      
      Return JSON Format (Array of objects):
      [
        {
          "id": "loc-1",
          "name": "Name of Place",
          "description": "Visual description",
          "suitability": "Why this fits the scene",
          "coordinates": "Approx City/State"
        }
      ]
      STRICT JSON OUTPUT ONLY. No markdown.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const text = response.text?.trim() || "[]";
    return JSON.parse(text);

  } catch (error: any) {
    console.error("Location Search Error:", error);
    return [];
  }
};

export const generateLocationImage = async (location: LocationAsset, sceneVibe: string): Promise<string | null> => {
  const prompt = `
    Concept Art for Film Location.
    Location: ${location.name} (${location.description}).
    Scene Context: ${sceneVibe}.
    Style: Photorealistic, Cinematic, Wide Angle.
    --ar 16:9
  `;

  return generateImageWithFallback({ parts: [{ text: prompt }] }, "16:9");
};

export const generatePosterPrompt = async (project: ProjectInfo): Promise<string> => {
  try {
    const ai = getAIClient();
    const model = "gemini-2.5-flash";
    
    // Pick a random poster archetype for variety
    const archetypes = [
      "Minimalist / Negative Space", 
      "Ensemble Cast (Floating Heads)", 
      "Character Portrait (Center)", 
      "Abstract / Symbolic", 
      "High Octane Action Montage", 
      "Typography Driven",
      "Silhouette / Noir",
      "Double Exposure"
    ];
    const randomArchetype = archetypes[Math.floor(Math.random() * archetypes.length)];

    const prompt = `
      Act as a professional Movie Poster Art Director.
      
      Project Details:
      Title: ${project.title}
      Genre: ${project.genre}
      Logline: ${project.logline}
      
      Full Script/Context:
      ${project.fullScript ? project.fullScript.substring(0, 15000) : "Use logline and title."}

      Task: 
      Design a unique movie poster concept using the archetype: "${randomArchetype}".
      Identify the most ICONIC, VISUALLY STRIKING, or MARKETABLE scene/concept that fits this archetype.

      Output:
      Write a highly detailed AI image prompt (for Midjourney/DALL-E) describing this poster.
      Include:
      - Main Subject (Hero/Villain/Object)
      - Composition: ${randomArchetype}
      - Lighting & Mood
      - Color Palette
      - Artistic Style (e.g. Painted, Photoreal, Graphic)
      
      Return ONLY the prompt string.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text?.trim() || "";

  } catch (error: any) {
    console.error("Poster Prompt Gen Error:", error);
    return "Cinematic movie poster, high contrast, dramatic lighting, 8k resolution";
  }
};

export const generateScriptRoadmap = async (storyConcept: string, language: 'en' | 'ml'): Promise<ScriptBeat[]> => {
  try {
    const ai = getAIClient();
    const model = "gemini-2.5-flash";

    const langInstruction = language === 'ml' 
      ? "Respond strictly in Malayalam (മലയാളം) language. Do not translate English technical terms like 'Interval' or 'Climax' but write the description in Malayalam." 
      : "Respond in English.";

    // Get the standard Indian beats from constants
    const beatList = INDIAN_CINEMA_BEATS.map((b, i) => `${i+1}. ${b.title}: ${b.description}`).join("\n");

    const prompt = `
      You are a Master Screenwriter for Indian Cinema (Mollywood/Bollywood).
      
      Story Concept:
      "${storyConcept}"

      Task:
      Break this story down into a 12-Point Cinematic Beat Sheet following this structure:
      ${beatList}

      For EACH beat, write a concise 1-2 sentence summary of exactly what happens in this specific story.
      
      Language Requirement: ${langInstruction}

      Output strictly as a JSON Array of objects:
      [
        {
          "title": "Beat Title",
          "description": "Specific story event description..."
        },
        ...
      ]
      STRICT JSON ONLY. No Markdown.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const text = response.text?.trim() || "[]";
    const beatsData = JSON.parse(text);

    return beatsData.map((b: any, index: number) => ({
      id: `beat-${index}`,
      title: b.title,
      description: INDIAN_CINEMA_BEATS[index].description, 
      aiSuggestion: b.description, 
      isExpanded: false
    }));

  } catch (error: any) {
    console.error("Roadmap Gen Error:", error);
    return [];
  }
};

export const generateTwistIdeas = async (
  storyConcept: string,
  beatTitle: string,
  beatContext: string,
  language: 'en' | 'ml'
): Promise<TwistOption[]> => {
  try {
    const ai = getAIClient();
    const model = "gemini-2.5-flash";

    const langInstruction = language === 'ml' 
      ? "Write the content strictly in Malayalam (മലയാളം)." 
      : "Write the content in English.";

    const prompt = `
      You are a Creative Consultant for a movie script.
      
      Original Story Concept: "${storyConcept}"
      
      Current Beat: ${beatTitle}
      Context/Setup so far: ${beatContext}

      Task: Generate 3 DISTINCT Plot Options for this specific beat.
      
      1. Path A: The Classic Turn (Expected/Dramatic/Safe)
      2. Path B: The Emotional Twist (Heartbreaking/Deep)
      3. Path C: The Wildcard Shock (Thriller/Psycho/Unexpected)

      Language: ${langInstruction}

      Return JSON Format:
      {
        "options": [
          { "type": "Classic", "title": "The Safe Bet", "content": "..." },
          { "type": "Emotional", "title": "The Heartbreaker", "content": "..." },
          { "type": "Wildcard", "title": "The Shock", "content": "..." }
        ]
      }
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const text = response.text?.trim() || "{}";
    const data = JSON.parse(text);
    return data.options || [];

  } catch (error: any) {
    console.error("Twist Gen Error:", error);
    return [];
  }
};

export const generateBudgetEstimate = async (
  project: ProjectInfo,
  scale: 'Micro/Indie' | 'Mid-Range' | 'Blockbuster',
  currency: 'INR' | 'USD'
): Promise<BudgetLineItem[]> => {
  try {
    const ai = getAIClient();
    const model = "gemini-2.5-flash";

    const prompt = `
      Act as an experienced Line Producer for Film & TV.
      
      Project: ${project.title}
      Type: ${project.projectType}
      Genre: ${project.genre}
      Scale: ${scale}
      Currency: ${currency}
      
      Script/Story Context:
      ${project.fullScript ? project.fullScript.substring(0, 15000) : project.logline}
      
      Characters Count: ${project.characters?.length || "Unknown"}
      Scenes Count: ${project.showcaseScenes?.length || "Unknown"}

      Task:
      Create a detailed Preliminary Budget Estimate based on the script requirements (locations, VFX, cast size, etc.).
      
      Rules:
      1. Break down costs into 5 Categories: 'Above The Line', 'Below The Line', 'Post-Production', 'Marketing/Distribution', 'Contingency'.
      2. Provide realistic numbers for the requested Scale and Currency.
      3. For INR, use actual values (e.g. 5000000 for 50 Lakhs). For USD, use standard dollar amounts.
      
      Output strictly as JSON Array:
      [
        {
          "category": "Category Name",
          "item": "Specific Line Item (e.g. Director Fee, Camera Rental, VFX)",
          "cost": 100000,
          "notes": "Brief explanation of cost basis"
        }
      ]
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const text = response.text?.trim() || "[]";
    const rawItems = JSON.parse(text);

    return rawItems.map((item: any, idx: number) => ({
      id: `budget-${Date.now()}-${idx}`,
      category: item.category,
      item: item.item,
      cost: item.cost,
      notes: item.notes
    }));

  } catch (error: any) {
    console.error("Budget Gen Error:", error);
    return [];
  }
};

export const getCinemaChatResponse = async (history: {role: string, content: string}[], newMessage: string) => {
  try {
    const ai = getAIClient();
    const model = "gemini-2.5-flash";

    const chatHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const chat = ai.chats.create({
      model,
      history: chatHistory,
      config: {
        systemInstruction: "You are the 'AI Cinema Master', an expert filmmaking assistant for the application AICINEMASUITE.com.",
      },
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text;
  } catch (error: any) {
    console.error("Chat Bot Error:", error);
    return "I'm having trouble connecting to the studio server. Please check your API Key.";
  }
};
