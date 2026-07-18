import { Mistral } from '@mistralai/mistralai';
import { GoogleGenAI } from '@google/genai';
import Groq from "groq-sdk";
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();


export const getRequiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is missing. Please set it in your .env file.`);
  }
  return value;
};

// Lazy or singleton client instances
let mistralClient: Mistral | null = null;

export const getMistralClient = (): Mistral => {
  if (!mistralClient) {
    const apiKey = getRequiredEnv('MISTRAL_API_KEY');
    mistralClient = new Mistral({ apiKey });
  }
  return mistralClient;
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

