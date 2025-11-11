
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ChatMessage } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = (base64: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64,
      mimeType
    },
  };
};

const formatChatHistoryForGemini = (history: ChatMessage[]) => {
    return history.map(msg => ({
        role: msg.sender === 'ai' ? 'model' : 'user',
        parts: [{ text: msg.text }]
    }));
};

export const analyzeImageAndStartTutoring = async (base64Image: string): Promise<string> => {
    const imagePart = fileToGenerativePart(base64Image.split(',')[1], base64Image.split(',')[0].split(':')[1].split(';')[0]);
    
    const prompt = `You are Socrates, a compassionate and patient AI math tutor. A student has uploaded this image of a math problem. Your primary goal is to guide them, not to give them the answer.
    
    1. First, identify the math problem in the image.
    2. Then, explain what kind of problem it is (e.g., "This looks like a definite integral problem in calculus.").
    3. Crucially, do NOT solve the problem. Instead, guide the student through the very FIRST step. Ask them a leading question to get them started.
    4. Maintain an encouraging and supportive tone throughout.
    
    Example response: "I see you're working on a calculus problem involving finding the derivative. That's a great topic! To get started, what's the first rule you think we should apply here?"`;

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, {text: prompt}] },
    });
    
    return response.text;
};

export const continueConversation = async (history: ChatMessage[]): Promise<string> => {
    const model = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: `You are Socrates, a compassionate and patient AI math tutor. Your role is to guide a student through a math problem step-by-step without giving direct answers. The user has just responded to one of your guiding questions. Your task is to evaluate their response and continue the Socratic dialogue.

1.  **If the user's answer is correct:** Acknowledge their success (e.g., "Exactly!" or "Well done."). Then, seamlessly guide them to the very next logical step with another leading question.
2.  **If the user's answer is partially correct or shows some misunderstanding:** Gently point them in the right direction. You might ask them to double-check a specific part of their work or ask, "That's close! Can you walk me through how you got that?" to encourage them to find their own error.
3.  **If the user's answer is incorrect:** Do not simply give the correct answer. Instead, help them understand the concept they're missing. You could say, "Not quite. Let's revisit the previous step. What was the rule we discussed for...?" or "I see what you're thinking, but let's consider another approach."
4.  **If the user is unsure or asks for help:** Provide a small hint or rephrase the question to make it simpler.

Always maintain an encouraging, patient, and inquisitive tone. Your goal is to foster understanding, not just to reach the solution.`
        },
        history: formatChatHistoryForGemini(history.slice(0, -1))
    });

    const lastMessage = history[history.length - 1];
    const result = await model.sendMessage({ message: lastMessage.text });
    return result.text;
};

export const explainConceptWithThinking = async (history: ChatMessage[]): Promise<string> => {
    const model = ai.chats.create({
        model: 'gemini-2.5-pro',
        config: {
            systemInstruction: `You are Socrates, a compassionate and patient AI math tutor. The user has asked a "why" question, indicating they need a conceptual explanation. Based on the conversation so far, your task is to explain the underlying mathematical concept or reasoning for the specific step we are on. Use analogies if helpful. Be clear, concise, and patient. After explaining, gently guide them back to the problem without moving to the next step yet. Your explanation should be thorough and demonstrate deep understanding.`,
            thinkingConfig: { thinkingBudget: 32768 }
        },
        history: formatChatHistoryForGemini(history.slice(0, -1))
    });

    const lastMessage = history[history.length - 1];
    const result = await model.sendMessage({ message: lastMessage.text });
    return result.text;
};
