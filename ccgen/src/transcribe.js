import { pipeline } from '@huggingface/transformers';

async function streamToF32Array(stream) {
    const chunks = new Uint8Array(await new Response(stream).arrayBuffer());

    // decode Uint8Array into Float32Array
    // whisper expects 16000 sampling rate
    const audioContext = new AudioContext({ sampleRate: 16000 });
    const audioBuffer = await audioContext.decodeAudioData(chunks.buffer);

    return audioBuffer.getChannelData(0);
}

export async function audioToText(url, status, deviceChecked) {
    const urlInput = url.value;
    var urlID;
    if (urlInput.includes('youtube.com')) { 
        urlID = urlInput.split("watch?v=")[1];
    }
    else if (urlInput.includes('youtu.be')) {
        urlID = urlInput.split("youtu.be/")[1];
    }
    else {
        urlID = urlInput;
    }

    console.log("entered audioToText");

    try {
        // status 1 = fetching audio data
        status.value = 1;
        const audioStream = await fetch(`http://localhost:3000/api/${urlID}`);
        console.log("stream loaded");

        // pipeline takes Float32Array
        const f32Array = await streamToF32Array(audioStream.body);
    
        // switch to webgpu if enabled
        const device = deviceChecked ? 'webgpu' : 'wasm';

        // status 2 = load model
        status.value = 2;
        const transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-base', {
            device: device,
        });
        console.log("transcriber loaded");
    
        // status 3 = transcribe audio
        status.value = 3;
        const start = performance.now();
        const output = await transcriber(f32Array, { chunk_length_s: 30, stride_length_s: 3, return_timestamps: true, language: 'english' });
        const end = performance.now();

        console.log(`Transcription took ${end - start} ms`);

        return output;
    } catch (error) {
        console.error(error);
        status.value = 0;
        return { error: 'Failed to fetch audio data.' };
    } finally {
        // status 0 = default
        status.value = 0;
    }
}
