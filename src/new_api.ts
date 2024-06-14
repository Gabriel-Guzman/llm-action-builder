import { createChat } from 'completions';
import { functionPrimer } from './meta';
import * as readline from 'readline';

const read = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const chat = () =>
    createChat({
        apiKey: process.env.OPENAPI_KEY as string,
        model: 'gpt-3.5-turbo',
        functions: [
            {
                name: 'get_user_response',
                description:
                    "returns user's response to 'query' in the format specified by 'format'",
                parameters: {
                    type: 'object',
                    properties: {
                        query: {
                            type: 'string',
                            description:
                                'a description of the information requested from the user',
                        },
                        format: {
                            type: 'string',
                            description:
                                'the format of the response you would like. if none is supplied, plain english text will be returned',
                        },
                    },
                    required: ['query'],
                },
                function: async ({ query, format }) => {
                    return new Promise<string>((resolve) => {
                        read.question(
                            `query: ${query} || format: ${format}\n`,
                            (answer: string) => {
                                resolve(answer);
                            },
                        );
                    });
                },
            },
        ],
        functionCall: 'auto',
    });

export async function requestScript(initDescription: string) {
    const c = chat();
    c.addMessage({
        role: 'system',
        content: functionPrimer,
    });
    const resp = await c.sendMessage(initDescription);
    console.log(resp);
}
