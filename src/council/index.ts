import Logger from '../logger';
import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import { codeCorrectnessMember, promptMatchingMember } from '@/meta';

const l = Logger;

export enum MemberType {
    CodeCorrectness = 'human_compiler',
    PromptMatching = 'QA team',
}

const primers = {
    [MemberType.CodeCorrectness]: codeCorrectnessMember,
    [MemberType.PromptMatching]: promptMatchingMember,
};

export type Member = {
    model: GenerativeModel;
    type: MemberType;
};

class CouncilResponse {
    rawResponse: string;
    satisfactory: boolean;
    explanation?: string;
    from: Member;

    constructor(member: Member, rawResponse: string) {
        this.from = member;
        this.rawResponse = rawResponse;
        if (!rawResponse.includes('@@')) {
            throw new Error('invalid response');
        }

        const split = rawResponse.split('@@');
        const word1 = split[0].trim();
        if (!['true', 'false'].includes(word1)) {
            throw new Error('invalid response');
        }

        this.satisfactory = word1 === 'true';
        if (split.length > 1) {
            this.explanation = split[1].trim();
        }
    }
}

export class Council {
    members: Member[];
    private _size: number;

    constructor(gAI: GoogleGenerativeAI, memberTypes: MemberType[]) {
        this._size = memberTypes.length;
        this.members = [];
        for (const memberType of memberTypes) {
            const model = gAI.getGenerativeModel({
                model: 'gemini-1.5-flash',
                systemInstruction: primers[memberType],
            });
            this.members.push({
                model,
                type: memberType,
            });
        }
    }

    async evaluate(prompt: string, code: string): Promise<CouncilResponse[]> {
        const promises = this.members.map((m) => {
            return m.model.generateContent(
                `
                user prompt: ${prompt}
                
                assistant generated code:
                ${code}
                `,
            );
        });
        const results = await Promise.all(promises);
        const resultsText = results.map((r) => r.response.text());
        l.log('council response: ', resultsText);
        return resultsText.map(
            (r, i) => new CouncilResponse(this.members[i], r),
        );
    }
}
