import ytdl from '@distube/ytdl-core';

export async function urlToStream(req, res) {
    try {
        const url = `https://www.youtube.com/watch?v=${req.params.id}`;

        // validate if url is valid
        if (!ytdl.validateURL(url)) {
            return res.status(404).json({ error: 'Invalid YouTube URL' })
        }

        // find best audio format and create a stream
        const info = await ytdl.getInfo(url);
        const format = ytdl.chooseFormat(info.formats, { filter: 'audioonly' });

        if (!format) {
            return res.status(404).json({ error: 'No format found.' });
        }

        const audioStream = ytdl(url, { format });

        // example format:
        // format.mimeType = audio/webm; codecs="opus"
        // set Content-Type header to audio/{mimeType}
        res.setHeader('Content-Type', format.mimeType.split(';')[0]); 

        // pipe audio stream to endpoint
        audioStream.pipe(res);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            error: 'Could not process URL.'
        });
    }
}