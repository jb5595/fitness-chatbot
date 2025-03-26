import OpenAI from "openai";
import dotenv from "dotenv";
import { addChatInteraction, getFormattedChatHistory } from "../database/helpers/chatHistory.js";
dotenv.config();
export class OpenAIChatService {
    constructor(apiKey = process.env.OPENAI_API_KEY || '') {
        this.openai = new OpenAI({ apiKey });
    }
    async chatWithHistory(customerIdentifier, systemPrompts, userPrompts) {
        const customerHistory = await getFormattedChatHistory(customerIdentifier);
        const customerHistoryAsPrompt = OpenAIChatService.CUSTOMER_HISTORY_PROMPT + `\n${customerHistory}\n`;
        const response = await this.chat(systemPrompts, [customerHistoryAsPrompt, ...userPrompts]);
        await addChatInteraction(customerIdentifier, userPrompts[0], response || '');
        return response;
    }
    async chat(systemPrompts, userPrompts) {
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
    formatPrompt(type, prompt) {
        return {
            role: type,
            content: prompt
        };
    }
    formatSystemPrompt(prompt) {
        return this.formatPrompt("system", prompt);
    }
    formatUserPrompt(prompt) {
        return this.formatPrompt("user", prompt);
    }
}
OpenAIChatService.MODEL = "gpt-4";
OpenAIChatService.CUSTOMER_HISTORY_PROMPT = "Here are the previous customer questions please keep this in mind when replying:";
