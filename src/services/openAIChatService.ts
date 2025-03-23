import OpenAI from "openai";
import dotenv from "dotenv";
import { addChatInteraction, getFormattedChatHistory } from "../database/db.js";

dotenv.config();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type PromptRoles = "system" | "user";

export class OpenAIChatService {
    private static MODEL = "gpt-4";
    private static CUSTOMER_HISTORY_PROMPT = "Here are the previous customer questions please keep this in mind when replying:";
    private openai: OpenAI;

    constructor(apiKey: string = process.env.OPENAI_API_KEY || '') {
        this.openai = new OpenAI({ apiKey });
    }

    async chatWithHistory(customerIdentifier: string, systemPrompts: string[], userPrompts: string[]) {
        const customerHistory = await getFormattedChatHistory(customerIdentifier);
        const customerHistoryAsPrompt = OpenAIChatService.CUSTOMER_HISTORY_PROMPT + `\n${customerHistory}\n`;
        const response = await this.chat(systemPrompts, [customerHistoryAsPrompt, ...userPrompts]);

        await addChatInteraction(customerIdentifier, userPrompts[0], response || '');
        return response;
    }

    async chat(systemPrompts: string[], userPrompts: string[]) {
        const messages = [
            ...systemPrompts.map(prompt => this.formatSystemPrompt(prompt)),
            ...userPrompts.map(prompt => this.formatUserPrompt(prompt))
        ];

        const response = await this.openai.chat.completions.create({
            model: OpenAIChatService.MODEL,
            messages: messages,
        });
        return response.choices[0].message.content;
    }

    private formatPrompt(type: PromptRoles, prompt: string): OpenAI.Chat.ChatCompletionMessageParam {
        return {
            role: type,
            content: prompt
        };
    }

    private formatSystemPrompt(prompt: string) {
        return this.formatPrompt("system", prompt);
    }

    private formatUserPrompt(prompt: string) {
        return this.formatPrompt("user", prompt);
    }
}