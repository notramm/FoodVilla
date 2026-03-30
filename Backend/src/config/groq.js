import Groq from "groq-sdk";
import { ENV } from "./env.js";

export const groq = new Groq({
  apiKey: ENV.GROQ_API_KEY,
});