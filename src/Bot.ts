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
        this.bot.on('message', this.handleMessage);
        this.bot.launch().then(() => console.info(`Bot is running`));
    }

    private handleMessage = async (ctx: ContextMessageUpdate) => {
        let url = ctx.message.text;
        if (!url.startsWith('http')) return;
        await this.download(url, ctx);
    }

    private handleStart = async (ctx: ContextMessageUpdate, next: Function) => {
        await ctx.reply('Welcome');
        if (next) next();
    }

    private handleDL = async (ctx: ContextMessageUpdate, next: Function) => {
        let [_, url] = ctx.message.text.split(' ');
        if (!url) return;

        await this.download(url, ctx);

        if (next) next();
    }

    private async download(url: string, ctx: ContextMessageUpdate) {
        let intro = await Downloader.getInfo(url);
        if (!intro) {
            await ctx.reply(`${url} not found.`);
            return;
        }

        if (Number.parseInt(intro.length_seconds) > 7200) {
            await ctx.reply(`${intro.title} is too large`);
            return;
        }

        await ctx.reply(`Downloading ${intro.title}`);

        let info = await Downloader.download(url);
        if (!info) {
            await ctx.reply('Downloading Failed.');
            return;
        }

        try {
            await ctx.replyWithAudio({ source: info.path, filename: info.title }, { caption: info.description, duration: info.seconds, title: info.title });
        } catch (error) {
            console.error(error.message);
        }

        fs.unlink(info.path, () => { });
    }
}