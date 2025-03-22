import { pipeline } from '@huggingface/transformers';

async function streamToF32Array(stream) {
    const chunks = new Uint8Array(await new Response(stream).arrayBuffer());

    // decode Uint8Array into Float32Array
    // whisper expects 16000 sampling rate
    const audioContext = new AudioContext({ sampleRate: 16000 });
    const audioBuffer = await audioContext.decodeAudioData(chunks.buffer);

    return audioBuffer.getChannelData(0);
}

export async function getModelSize(modelName, device) {
    const apiUrl = `https://huggingface.co/api/models/${modelName}/tree/main/onnx`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Invalid response: ${response.status}`);
        }
        const modelFiles = await response.json();

        // if using WASM, get size of quantized model. WebGPU uses FP32 model
        const quant = device === 'webgpu' ? '' : '_quantized';

        const decoderFile = modelFiles.find(f => f.path === `onnx/decoder_model_merged${quant}.onnx`);
        const encoderFile = modelFiles.find(f => f.path === `onnx/encoder_model${quant}.onnx`);
        const modelFile = modelFiles.find(f => f.path === `onnx/model${quant}.onnx`);

        if (!decoderFile && !encoderFile && !modelFile) {
            throw new Error('Model files not found');
        }

        // return total size in MB
        return (decoderFile && encoderFile) ? (decoderFile.size + encoderFile.size) / 1000**2 : modelFile.size / 1000**2;
    }
    catch (error) {
        console.error(`Failed to get model size: ${error}`);
        return 0;
    }
}

export async function audioToText(model, url, status, deviceChecked) {
    var urlID;
    if (url.includes('youtube.com')) { 
        urlID = url.split("watch?v=")[1];
    }
    else if (url.includes('youtu.be')) {
        urlID = url.split("youtu.be/")[1];
    }
    else {
        urlID = url;
    }

    console.log("entered audioToText");

    try {
        // status 1 = fetching audio data
        status.value = 1;
        const audioStream = await fetch(`http://localhost:3000/api/${urlID}`);
        if (audioStream.status !== 200) {
            status.value = 0;
            throw new Error("Invalid URL.");
        }
        console.log("stream loaded");

        // pipeline takes Float32Array
        const f32Array = await streamToF32Array(audioStream.body);
    
        // switch to webgpu if enabled
        const device = deviceChecked.value ? 'webgpu' : 'wasm';

        // status 2 = load model
        status.value = 2;
        const transcriber = await pipeline('automatic-speech-recognition', model, {
            device: device,
        });
        console.log("transcriber loaded");
    
        // status 3 = transcribe audio
        status.value = 3;
        const start = performance.now();
        const output = await transcriber(f32Array, { chunk_length_s: 30, stride_length_s: 3, return_timestamps: true });
        const end = performance.now();

        console.log(`Transcription took ${((end - start) / 1000).toFixed(2)} seconds`);

        return output;
    } catch (error) {
        console.error(error);
        return { error: 'Failed to fetch audio data.' };
    } finally {
        // status 0 = default
        status.value = 0;
    }
}
