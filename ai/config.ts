import { GoogleGenAI } from '@google/genai';
import Groq from "groq-sdk";
import dotenv from 'dotenv';

dotenv.config();


export const getRequiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is missing. Please set it in your .env file.`);
  }
  return value;
};


let geminiClient: GoogleGenAI | null = null;

export const getGeminiClient = (): GoogleGenAI => {
  if (!geminiClient) {
    const apiKey = getRequiredEnv('GEMINI_API_KEY');
    geminiClient = new GoogleGenAI({ apiKey });
  }
  return geminiClient;
};


let groqClient: Groq | null = null;

export const getGroqClient = (): Groq => {
  if (!groqClient) {
    const apiKey = getRequiredEnv('GROQ_API_KEY');
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
};
