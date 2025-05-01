import fs from 'fs';
import { Innertube } from 'youtubei.js';
import { generate } from 'youtube-po-token-generator';
import { Readable } from 'stream';

let cachedToken = null;
const TOKEN_REFRESH = 2.16e7; // 6 hours in milliseconds

async function getPoToken() {
  // refresh after 6 hours
  if (!cachedToken || Date.now() - cachedToken.timestamp > TOKEN_REFRESH) {
    const { visitorData, poToken } = await generate();
    cachedToken = {
      visitorData,
      poToken,
      timestamp: Date.now()
    };
  }

  return cachedToken;
}

export async function urlToStream(req, res) {
  const id = req.params.id;

  let cookies;
  let cookieHeader;
  if (fs.existsSync('/etc/secrets/cookies.json')) {
    cookies = JSON.parse(fs.readFileSync('/etc/secrets/cookies.json'));
    cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');
  }

  try {
    const { visitorData, poToken } = await getPoToken();

    const yt = await Innertube.create({
      cookie: cookieHeader,
      po_token: poToken,
      visitor_data: visitorData,
      retrieve_player: true,
      client_type: 'WEB'
    });

    const info = await yt.getBasicInfo(id);

    console.log(info);
    const formats = info.streaming_data.adaptive_formats.filter(f => 
      f.has_audio && !f.has_video
    );

    if (!formats || formats.length === 0) {
      return res.status(404).json({ error: "No audio formats found" });
    }

    const bestFormat = formats.sort((a, b) => b.bitrate - a.bitrate)[0];

    const audioUrl = bestFormat.decipher(yt.session.player);

    const audioResponse = await fetch(audioUrl);

    // example format:
    // format.mimeType = audio/webm; codecs="opus"
    // set Content-Type header to audio/{mimeType}
    res.setHeader('Content-Type', bestFormat.mime_type.split(';')[0]); 
    res.setHeader('Content-Length', bestFormat.content_length);

    const audioReadable = Readable.fromWeb(audioResponse.body);
    audioReadable.on('error', (err) => {
      console.error(err);
      return res.status(403).json({
        error: 'An error occurred while processing the audio URL.'
      });
    });

    audioReadable.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'Failed to fetch audio stream.'
    });
  }
}
