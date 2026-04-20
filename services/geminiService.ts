
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { PROMPT_PREAMBLE, REPORT_SECTIONS } from '../constants';

const getApiKey = (): string => {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GOOGLE_GEMINI_API_KEY environment variable not set. Please ensure it is configured correctly.");
    }
    return apiKey;
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const generateSectionWithRetry = async (
    ai: GoogleGenAI,
    prompt: string,
    retries = 3,
    initialDelay = 1000
): Promise<GenerateContentResponse> => {
    let lastError: Error | null = null;
    for (let i = 0; i < retries; i++) {
        try {
            // Using Gemini 3 Pro with Deep Thinking enabled for research
            const response = await ai.models.generateContent({
                model: 'gemini-3.1-flash-lite-preview',
                contents: prompt,
                config: {
                    tools: [{ googleSearch: {} }],
                    thinkingConfig: { thinkingBudget: 32768 }
                },
            });
            return response;
        } catch (error) {
            lastError = error as Error;
            console.warn(`Deep Research attempt failed (${i + 1}/${retries}). Retrying...`, error);
            await delay(initialDelay * (i + 1));
        }
    }
    throw new Error(`Deep Research failed after ${retries} attempts. ${lastError?.message}`);
};

export const translateReportToChinese = async (englishMarkdown: string): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: getApiKey() });
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: `You are a professional business and technology translator. Translate the following Markdown strategic report into high-quality, professional Chinese (Simplified). Ensure business terminology is accurate (e.g., ICP, Moat, GTM). Retain all Markdown formatting and image links.\n\nReport Content:\n${englishMarkdown}`,
            config: {
                thinkingConfig: { thinkingBudget: 16384 } // Use thinking for high-quality translation
            }
        });
        return response.text || '';
    } catch (error) {
        console.error("Translation failed:", error);
        throw new Error("Failed to translate the report.");
    }
};

export const generateStrategicReportStream = async (
    productName: string,
    onProgress: (update: { title: string; status: 'generating' | 'completed'; content?: string }) => void
): Promise<void> => {
    try {
        const ai = new GoogleGenAI({ apiKey: getApiKey() });
        const allSources: any[] = [];

        for (const section of REPORT_SECTIONS) {
            onProgress({ title: section.title, status: 'generating' });

            const filledPreamble = PROMPT_PREAMBLE.replace(/{{PRODUCT_NAME}}/g, productName);
            const filledSectionPrompt = section.prompt.replace(/{{PRODUCT_NAME}}/g, productName);
            const finalPrompt = `${filledPreamble}\n\n${filledSectionPrompt}`;

            const response = await generateSectionWithRetry(ai, finalPrompt);

            const content = response.text;
            const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
            
            allSources.push(...sources);

            onProgress({ title: section.title, status: 'completed', content });
            await delay(500);
        }

        onProgress({ title: 'Data Sources', status: 'generating' });
        const sourceMap = new Map<string, string>();
        allSources.forEach(chunk => {
            if (chunk?.web?.uri && chunk?.web?.title) {
                sourceMap.set(chunk.web.uri, chunk.web.title);
            }
        });

        let sourcesMarkdown = '';
        if (sourceMap.size > 0) {
            sourcesMarkdown = `## Data Sources\n\n${Array.from(sourceMap.entries())
                .map(([uri, title]) => `- [${title}](${uri})`)
                .join('\n')}`;
        }
        onProgress({ title: 'Data Sources', status: 'completed', content: sourcesMarkdown });

    } catch (error) {
        console.error("Error in Deep Research process:", error);
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error("An unknown error occurred during Deep Research.");
    }
};
