// import * as process from "process";
// import * as dotenv from "dotenv";
// import {read, sendRequest} from "./api";
// import {actionsDir} from "./file-tools";
// import logger from "./logger";
// import {writeFileSync} from "fs";
// import axios from "axios";
//
// dotenv.config();
// console.log("using key", process.env.OPENAPI_KEY);
//
// interface Action {
//     name: string;
//
//     run(ctx: GPTScriptContext): Promise<void>;
// }
//
// type GPTScriptContext = {
//     requestMoreInfo(query: string, format: string): Promise<string>;
//     axios: typeof axios,
// }
//
// const stdioContext: GPTScriptContext = {
//     // request further information from the user.
//     // query: a string describing the information needed to finish the operation
//     // format: the format which the response should look like. could be javascript e.g. "[num1,num2,num3]"
//     requestMoreInfo(query: string, format: string): Promise<string> {
//         return new Promise<string>((resolve) => {
//             read.question(`query: ${query} || format: ${format}\n`, ((answer: string) => {
//                 resolve(answer);
//             }))
//         });
//     },
//     axios,
// };
//
// function _parse(str: string) {
//     return eval?.(`"use string";
//     (${str})`)
// }
//
// (async () => {
//
//
//     const query = "ask the user for a sentence, and output the number of S's into the console";
//     logger.log("\nSTARTING =================================================")
//     logger.log("sending request with query: " + query);
//     const response = await sendRequest("GET_RESPONSE", query);
//     // const response = await chat().sendMessage(functionPrimer + query);
//     logger.log("got response: " + response);
//     const resp = response;
//
//     const newObj = (_parse(resp)) as Action;
//     logger.log("imported generated code", newObj);
//
//     writeFileSync(actionsDir + "/" + newObj.name + " -- " + query, resp);
//
//     try {
//         const retval = await newObj.run(stdioContext);
//         logger.log("output result: " + JSON.stringify(retval, null, 2));
//         logger.log("\nDONE =================================================")
//     } catch(err) {
//         // try to have chatgpt fix it couple times
//         console.error(err);
//     }
//
//     process.exit(1);
// })();
//
