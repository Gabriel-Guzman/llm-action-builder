import fs from 'fs';

class Logger {
    logFile: string = './log';

    outputToConsole: boolean = true;
    outputToLogFile: boolean = true;

    log(...message: (string | object)[]) {
        const messageString = message.map((m) => JSON.stringify(m, null, 2));

        if (this.outputToConsole) {
            console.log(...messageString);
        }

        if (this.outputToLogFile) {
            fs.appendFileSync(this.logFile, '\n' + messageString.join(' '));
        }
    }
}

export default new Logger();
