
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config()
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class OpenAIService {
    private static MODEL = "gpt-4";


    static async call(systemPrompts: string[], userPrompts: string[]) {
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

    private static formatPrompt(type: "system" | "user", prompt: string): OpenAI.Chat.ChatCompletionMessageParam {
        return {
            role: type,
            content: prompt
        };
    }

    private static formatSystemPrompt(prompt: string) {
        return this.formatPrompt("system", prompt);
    }

    private static formatUserPrompt(prompt: string) {
        return this.formatPrompt("user", prompt);
    }
}

