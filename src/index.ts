import commander from 'commander';
import inquirer from 'inquirer';

import Bot from './Bot';

// Downloader.download('https://www.youtube.com/watch?v=nsTBUL7AwbM').then(v => console.log(v));

let args = commander
    .option('-t, --token <Token>', 'Bot Token', String)
    .parse(process.argv);

if (!args.token) {
    (async () => {
        let { token } = await inquirer.prompt({ name: 'token', message: 'Bot Token:', type: 'input', }) as { token: string };
        new Bot({ token }).launch();
    })();
} else {
    new Bot({ token: args.token }).launch();
}