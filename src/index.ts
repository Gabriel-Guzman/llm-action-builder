import * as dotenv from 'dotenv';
import {
    FunctionDeclaration,
    FunctionDeclarationSchemaType,
    GoogleGenerativeAI,
} from '@google/generative-ai';
import * as readline from 'readline';
import Conversation, { ModelFunctionWrapper } from './conversation';
import fs from 'fs';
import { Council, MemberType } from './council';
import * as Process from 'process';

dotenv.config();

const read = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const askUserExecute = ({ query, format }) => {
    return new Promise<string>((resolve) => {
        console.log('running askUserExecute');
        read.question(
            `query: ${query} || format: ${format}\n`,
            (answer: string) => {
                resolve(answer);
            },
        );
    });
};

const askUserDeclaration: FunctionDeclaration = {
    name: 'askUser',
    parameters: {
        type: FunctionDeclarationSchemaType.OBJECT,
        description: 'Get information from the user',
        properties: {
            query: {
                type: FunctionDeclarationSchemaType.STRING,
                description: 'a question requesting info from the user.',
            },
            format: {
                type: FunctionDeclarationSchemaType.STRING,
                description:
                    'the format which the response should look like. could be javascript e.g. "[num1,num2,num3]"',
            },
        },
        required: ['query'],
    },
};

const askUserMF: ModelFunctionWrapper = {
    declaration: askUserDeclaration,
    execute: askUserExecute,
};

async function main() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
    const MFS = [askUserMF];

    const prompt =
        'write a script that takes a DiscordJS Message as a parameter and returns the user, guild id, and message content. throw and error if the message has the word "shit"';

    const d = new Date();
    const basefn = `${d.getMonth()}_${d.getDay()}_${d.getFullYear()} ${d.getHours()}_${d.getSeconds()}`;
    const logFolderPath = `./actions/${basefn}/`;
    fs.mkdirSync(logFolderPath);
    const c = new Conversation(MFS);
    const result = await c.execute(prompt);
    // TODO write something to audit code
    const council = new Council(genAI, [
        MemberType.CodeCorrectness,
        MemberType.PromptMatching,
    ]);
    const councilResp = await council.evaluate(prompt, result);
    let isBad = false;
    for (const resp of councilResp) {
        if (!resp.satisfactory) {
            isBad = true;
            break;
        }
    }

    if (isBad) {
        const followUp = await c.execute(
            `your code is invalid for the following reasons. try again:
            
            ${councilResp
                .filter((r) => !r.satisfactory)
                .map((r) => r?.explanation)
                .join('\n')}
            `,
        );

        fs.writeFileSync(logFolderPath + 'FOLLOWUP.js', followUp);
    }
    console.log('writing files to: ', logFolderPath, 'followup.js');

    fs.writeFileSync(logFolderPath + 'initialResult.js', result);
    fs.writeFileSync(logFolderPath + 'prompt.txt', prompt);
    fs.writeFileSync(
        logFolderPath + 'councilResponse.json',
        JSON.stringify(councilResp, null, 2),
    );
    Process.exit(0);
}

main().catch(console.error);
