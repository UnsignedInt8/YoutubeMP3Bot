import readline from 'readline';
import ytdl from 'ytdl-core';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import tmpDir from 'temp-dir';
import { EventEmitter } from 'events';

class Downloader extends EventEmitter {

    static readonly shared = new Downloader();

    async download(url: string) {
        let info = await ytdl.getBasicInfo(url);

        let stream = ytdl(url, {
            quality: 'highestaudio',
        });

        let start = Date.now();

        return new Promise<Mp3Info>(resolve => {
            let filePath = path.join(tmpDir, info.video_id + '.mp3');
            ffmpeg(stream).audioBitrate(128).save(filePath)
                .on('progress', (p) => {
                    readline.cursorTo(process.stdout, 0);
                    process.stdout.write(`${p.targetSize}kb downloaded`);
                })
                .on('end', () => {
                    console.log(`\ndone, ${info.title} - ${(Date.now() - start) / 1000}s`);
                    resolve({
                        author: info.author['name'],
                        title: info.title, path: filePath,
                        seconds: Number.parseInt(info.length_seconds),
                        description: info.description,
                    });
                });
        });
    }
}

interface Mp3Info {
    title: string;
    path: string;
    seconds: number;
    description: string;
    author?: string;
}

export default Downloader.shared;