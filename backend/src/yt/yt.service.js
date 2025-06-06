import fs from 'fs';
import { Innertube, Session, Platform, UniversalCache } from 'youtubei.js';
import { Readable } from 'stream';
import 'dotenv/config';
import { JSDOM } from 'jsdom';
import { BG } from 'bgutils-js'

let cachedToken = null;
const TOKEN_REFRESH = 2.16e7; // 6 hours in milliseconds

async function getPoToken() {
  // refresh after 6 hours
  if (cachedToken && Date.now() - cachedToken.timestamp < TOKEN_REFRESH) {
    return cachedToken;
  }
  // Create a barebones Innertube instance so we can get a visitor data string from YouTube.
  let innertube = await Innertube.create({ retrieve_player: false });

  const requestKey = 'O43z0dpjhgX20SCx4KAo';
  const visitorData = innertube.session.context.client.visitorData;

  if (!visitorData)
    throw new Error('Could not get visitor data');

  const dom = new JSDOM();

  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document
  });

  const bgConfig = {
    fetch: (input, init) => fetch(input, init), 
      globalObj: globalThis,
      identifier: visitorData,
      requestKey
  };

  const bgChallenge = await BG.Challenge.create(bgConfig);

  if (!bgChallenge)
    throw new Error('Could not get challenge');

  const interpreterJavascript = bgChallenge.interpreterJavascript.privateDoNotAccessOrElseSafeScriptWrappedValue;
  if (interpreterJavascript) {
    new Function(interpreterJavascript)();
  } else throw new Error('Could not load VM');

  const poTokenResult = await BG.PoToken.generate({
    program: bgChallenge.program,
    globalName: bgChallenge.globalName,
    bgConfig
  });

  // const placeholderPoToken = BG.PoToken.generatePlaceholder(visitorData);

  // console.info('Session Info:', {
  //   visitorData,
  //   placeholderPoToken,
  //   poToken: poTokenResult.poToken,
  //   integrityTokenData: poTokenResult.integrityTokenData
  // });

  cachedToken = {
    visitorData,
    poToken: poTokenResult.poToken
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

  // custom fetch from https://github.com/LuanRT/YouTube.js/issues/962
  const customFetch = async (input, init) => {
    const url = typeof input === 'string'
      ? new URL(input)
      : input instanceof URL
        ? input
        : new URL(input.url);

    const request = new Request(
      url,
      input instanceof Platform.shim.Request ? input : undefined
    );

    return fetch(request, init);
  };

  try {
    const { visitorData, poToken } = await getPoToken();

    const innertube = await Innertube.create({
      fetch: customFetch,
      cookie: cookieHeader,
      po_token: poToken,
      visitor_data: visitorData,
      retrieve_player: true,
      cache: new UniversalCache(true),
      generate_session_locally: true
    });

    const session = new Session(
      innertube.session.context,
      innertube.session.api_key,
      innertube.session.api_version,
      innertube.session.account_index,
      innertube.session.config_data,
      innertube.session.player,
      cookieHeader,
      customFetch,
      innertube.session.cache,
      poToken
    );

    const yt = new Innertube(session);

    const info = await yt.getBasicInfo(id, process.env.innertubeClient);

    const playability = info.playability_status;
    if (playability.status != 'OK') {
      res.status(404).json({
        error: playability.reason,
        status: playability.status
      });
      return;
    }

    const basicInfo = info.basic_info;
    if (basicInfo.is_live) {
      res.status(403).json({
        error: 'Live streams are not supported.'
      });
      return;
    }
    if (basicInfo.is_private) {
      res.status(403).json({
        error: 'Private videos are not supported.'
      });
      return;
    }

    console.log(info);
    res.json(info);
    return;
    const audioFormats = info.streaming_data.adaptive_formats.filter(format => 
      format.mime_type.startsWith('audio/')
    );

    const bestFormat = audioFormats.sort((a, b) => b.bitrate - a.bitrate)[0];

    // example format:
    // format.mimeType = audio/webm; codecs="opus"
    // set Content-Type header to audio/{mimeType}
    res.setHeader('Content-Type', bestFormat.mime_type.split(';')[0]); 
    if (bestFormat.content_length) {
      res.setHeader('Content-Length', bestFormat.content_length);
    }

    const audioUrl = bestFormat.decipher(yt.session.player);

    const audioResponse = await fetch(audioUrl);

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
