import OpenAI from "openai";
import { ENV } from "./env.js";

// Single instance — imported wherever needed
export const openai = new OpenAI({
  apiKey: ENV.OPENAI_API_KEY,
});
