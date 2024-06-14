import {
    ChatSession,
    FunctionDeclaration,
    GoogleGenerativeAI,
    Part,
} from '@google/generative-ai';
import { functionPrimer } from '@/meta';

export type ModelFunctionWrapper = {
    declaration: FunctionDeclaration;
    execute: (arg) => Promise<object | string>;
};

export default class Conversation {
    session: ChatSession;
    modelFunctions: ModelFunctionWrapper[];

    constructor(modelFunctions: ModelFunctionWrapper[]) {
        const genAI = new GoogleGenerativeAI(
            process.env.GEMINI_API_KEY as string,
        );
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            tools: [
                {
                    functionDeclarations: modelFunctions.map(
                        (mf) => mf.declaration,
                    ),
                },
            ],
            systemInstruction: functionPrimer,
        });

        this.session = model.startChat();
        this.modelFunctions = modelFunctions;
    }

    async execute(prompt: string) {
        let message: string | Part[] = prompt;
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const result = await this.session.sendMessage(message);
            const calls = result.response?.functionCalls();
            if (!calls) {
                console.log('no function calls');
                return result.response.text();
            }
            const functionResponses: string | Part[] = [];
            for (const call of calls) {
                const actionName = call.name;
                const args = call.args;
                const funcW = this.modelFunctions.find(
                    (mf) => mf.declaration.name === actionName,
                );
                const callResp = await funcW?.execute(args);
                if (!callResp) {
                    throw new Error(`Could not find function ${actionName}`);
                }

                functionResponses.push({
                    functionResponse: {
                        name: actionName,
                        response: {
                            value: callResp,
                        },
                    },
                });
            }
            message = functionResponses;
        }
    }
}
