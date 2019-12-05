import readline from 'readline';
import ytdl from 'ytdl-core';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import tmpDir from 'temp-dir';
import { EventEmitter } from 'events';

class Downloader extends EventEmitter {

    static readonly shared = new Downloader();

    async getInfo(url: string) {
        let info = await ytdl.getBasicInfo(url);
        return info;
    }

    async download(url: string) {
        let info = await this.getInfo(url);

        let stream = ytdl(url, {
            quality: 'highestaudio',
        });

        let start = Date.now();

        return new Promise<Mp3Info>(resolve => {
            let filePath = path.join(tmpDir, info.video_id + '.mp3');
            ffmpeg(stream).audioBitrate(128).save(filePath).on('progress', (p) => {
                readline.cursorTo(process.stdout, 0);
                process.stdout.write(`${p.targetSize}kb downloaded`);
                this.emit('progress', { id: info.video_id, title: info.title, progress: p, targetSize: p.targetSize })
            }).on('end', () => {
                console.log(`\ndone, ${info.title} - ${(Date.now() - start) / 1000}s`);
                resolve({
                    id: info.video_id,
                    author: info.author['name'],
                    title: info.title, path: filePath,
                    seconds: Number.parseInt(info.length_seconds),
                    description: info.description,
                });
            }).on('error', e => { console.log(e); resolve(undefined) });
        });
    }
}

interface Mp3Info {
    id: string;
    title: string;
    path: string;
    seconds: number;
    description: string;
    author: string;
}

export default Downloader.shared;