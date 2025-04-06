async function streamToF32Array(blob) {
  const chunks = new Uint8Array(await blob.arrayBuffer());

  // decode Uint8Array into Float32Array
  // whisper expects 16000 sampling rate
  const audioContext = new AudioContext({ sampleRate: 16000 });
  const audioBuffer = await audioContext.decodeAudioData(chunks.buffer);

  return audioBuffer.getChannelData(0);
}

// format model size to MB or GB, depending on size in MB
export function formatSize(bytes) {
  return bytes >= 1000**3
    ? `${(bytes / 1000**3).toFixed(2)} GB`
    : `${(bytes / 1000**2).toFixed(2)} MB`;
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

export async function audioToArr(response) {
  console.log("entered audioToArr");

  try {
    const audioBlob = await response.blob();
    console.log("stream loaded");

    // pipeline takes Float32Array
    return await streamToF32Array(audioBlob);;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}
