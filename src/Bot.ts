import Telegraph, { ContextMessageUpdate, } from 'telegraf';
import Downloader from './Downloader';

export default class Bot {
    private bot: Telegraph<ContextMessageUpdate>;

    constructor({ token }: { token: string }) {
        this.bot = new Telegraph(token);
        this.bot.start(this.handleStart);
        this.bot.command('dl', this.handleDL);
    }

    launch() {
        this.bot.launch().then(() => console.info(`Bot is running`));
    }

    private handleStart = async (ctx: ContextMessageUpdate) => {
        ctx.reply('Welcome');
    }

    private handleDL = async (ctx: ContextMessageUpdate) => {
        let [_, url] = ctx.message.text.split(' ');
        if (!url) return;
        let intro = await Downloader.getInfo(url);
        if (intro) {
            ctx.reply(`Downloading ${intro.title}`);
        }

        let info = await Downloader.download(url);
        if (!info) {
            ctx.reply('Downloading Failed');
            return;
        }

        await ctx.replyWithAudio({ source: info.path, filename: info.title }, { caption: info.description, duration: info.seconds, title: info.title });
    }
}