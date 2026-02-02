
import { GoogleGenAI, Type, Modality } from "@google/genai";

// AI instance initialization
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("Gemini API Key missing!");
  }
  return new GoogleGenAI({ apiKey: apiKey || '' });
};

let audioCtx: AudioContext | null = null;
const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  }
  return audioCtx;
};

const safeJsonParse = (text: string | undefined) => {
  if (!text) throw new Error("No text from AI");
  try {
    const cleanText = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("JSON Parse Error:", e, "Raw:", text);
    // Fallback in case of parse error
    return {
      type: "riddle",
      question: "আমি এক পা দিয়ে দাঁড়িয়ে থাকি, কিন্তু মানুষ নই। আমি কে?",
      answer: "গাছ",
      hint: "আমি তোমাদের অক্সিজেন দেই।"
    };
  }
};

export const generateDailyChallenge = async () => {
  try {
    const ai = getAI();
    // Switched to gemini-3-flash-preview for much faster response
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "শিশুদের জন্য একটি মজার বাংলা ধাঁধা বা অঙ্ক বা শব্দ খেলা তৈরি করো। উত্তর এবং একটি ইঙ্গিত দাও। রেসপন্স শুধুমাত্র JSON ফরম্যাটে দাও।",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING },
            question: { type: Type.STRING },
            answer: { type: Type.STRING },
            hint: { type: Type.STRING }
          },
          required: ["type", "question", "answer", "hint"]
        }
      }
    });

    return safeJsonParse(response.text);
  } catch (error) {
    console.error("Daily Challenge Error:", error);
    throw error;
  }
};

export const generateLesson = async (topic: string) => {
  try {
    const ai = getAI();
    const prompts: Record<string, string> = {
      'bangla': "বাচ্চাদের জন্য একটি মজার বাংলা ছড়া বা ছোট গল্প বলো।",
      'math': "বাচ্চাদের জন্য একটি মজার গণিতের জাদু বা ট্রিক শেখাও।",
      'history': "বাচ্চাদের জন্য মুক্তিযুদ্ধ বা বঙ্গবন্ধু সম্পর্কে একটি খুব সহজ অনুপ্রেরণামূলক গল্প বলো।",
      'science': "বাচ্চাদের জন্য একটি মজার বৈজ্ঞানিক তথ্য বলো।",
      'english': "বাচ্চাদের জন্য একটি মজার ইংরেজি শব্দ খেলা বা ছোট ছড়া বলো বাংলায় অনুবাদসহ।",
      'space': "বাচ্চাদের জন্য মহাকাশ সম্পর্কে একটি বিস্ময়কর তথ্য বলো।",
      'animals': "বাচ্চাদের জন্য প্রাণীদের সম্পর্কে একটি মজার তথ্য বলো।",
      'moral': "বাচ্চাদের জন্য একটি ছোট শিক্ষণীয় গল্প বলো।"
    };
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompts[topic] || "একটি মজার শিক্ষামূলক গল্প বলো।",
      config: {
        systemInstruction: "You are Bunny 🐰, a friendly teacher for kids. Use simple Bengali, emojis, and keep it very short. Max 3-4 sentences."
      }
    });
    return response.text || "দুঃখিত বন্ধু, আমি এখন উত্তর দিতে পারছি না।";
  } catch (error) {
    console.error("Lesson Error:", error);
    throw error;
  }
};

export const askMascot = async (question: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: question,
      config: {
        systemInstruction: "You are 'Bunny' 🐰, a friendly mascot for kids. Answer simply in Bengali for a 5-year old. If the question is complex, simplify it. Max 2 sentences."
      }
    });
    return response.text || "আমি তোমার কথা বুঝতে পারিনি বন্ধু।";
  } catch (error) {
    console.error("Ask Mascot Error:", error);
    throw error;
  }
};

export const speakText = async (text: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: text,
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) return base64Audio;
    throw new Error("No audio data found");
  } catch (error) {
    console.error("TTS Error:", error);
    throw error;
  }
};

export function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function playPCM(base64Data: string) {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') await ctx.resume();
    
    const data = decodeBase64(base64Data);
    const arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
    const dataInt16 = new Int16Array(arrayBuffer);
    
    const frameCount = dataInt16.length;
    const buffer = ctx.createBuffer(1, frameCount, 24000);
    const channelData = buffer.getChannelData(0);
    
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i] / 32768.0;
    }
    
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start();
  } catch (e) {
    console.error("Audio Playback Error:", e);
  }
}
