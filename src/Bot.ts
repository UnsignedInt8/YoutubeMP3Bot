import Telegraph, { ContextMessageUpdate, } from 'telegraf';
import Downloader from './Downloader';
import * as fs from 'fs';

export default class Bot {
    private bot: Telegraph<ContextMessageUpdate>;

    constructor({ token }: { token: string }) {
        this.bot = new Telegraph(token);
        this.bot.start(this.handleStart);
        this.bot.command('dl', this.handleDL);
        this.bot.command('mp3', this.handleDL);
    }

    launch() {
        this.bot.launch().then(() => console.info(`Bot is running`));
    }

    private handleStart = async (ctx: ContextMessageUpdate, next: Function) => {
        await ctx.reply('Welcome');
        if (next) next();
        await ctx.deleteMessage();
    }

    private handleDL = async (ctx: ContextMessageUpdate, next: Function) => {
        try {
            let [_, url] = ctx.message.text.split(' ');
            if (!url) return;

            let intro = await Downloader.getInfo(url);
            if (!intro) {
                await ctx.reply(`${url} not found.`);
                return;
            }

            await ctx.reply(`Downloading ${intro.title}`);

            let info = await Downloader.download(url);
            if (!info) {
                await ctx.reply('Downloading Failed.');
                return;
            }

            await ctx.replyWithAudio({ source: info.path, filename: info.title }, { caption: info.description, duration: info.seconds, title: info.title });
            fs.unlink(info.path, () => { });

            if (next) next();
        } finally {
            await ctx.deleteMessage();
        }
    }
}