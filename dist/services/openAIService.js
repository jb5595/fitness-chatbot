import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
export class OpenAIService {
    static async call(systemPrompts, userPrompts) {
        const messages = [
            ...systemPrompts.map(prompt => this.formatSystemPrompt(prompt)),
            ...userPrompts.map(prompt => this.formatUserPrompt(prompt))
        ];
        const response = await openai.chat.completions.create({
            model: this.MODEL,
            messages: messages,
        });
        return response.choices[0].message.content;
    }
    static formatPrompt(type, prompt) {
        return {
            role: type,
            content: prompt
        };
    }
    static formatSystemPrompt(prompt) {
        return this.formatPrompt(this.SYSTEM_PROMPT_TYPE, prompt);
    }
    static formatUserPrompt(prompt) {
        return this.formatPrompt(this.USER_PROMPT_TYPE, prompt);
    }
}
OpenAIService.MODEL = "gpt-4";
OpenAIService.SYSTEM_PROMPT_TYPE = "system";
OpenAIService.USER_PROMPT_TYPE = "user";
