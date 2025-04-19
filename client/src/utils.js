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

function formatASSTime(seconds) {
  // time format: H/MM/SS/MS, 0:00:00.0
  const h = String(Math.floor(seconds / 3600)).padStart(1, '0');
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const s = String((seconds % 60).toFixed(2)).padStart(5, '0');
  return `${h}:${m}:${s}`;
}

export function transcriptToASS(transcription) {
  const template = `[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
ScaledBorderAndShadow: yes
YCbCr Matrix: None

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,16,&Hffffff,&Hffffff,&H0,&H0,0,0,0,0,100,100,0,0,1,1,0,2,10,10,10,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text`

  // dialogue format:
  // Format: Layer, Start,      End,        Style,   Name, MarginL, MarginR, MarginV, Effect, Text
  // Dialogue:   0, 0:00:00.0, 0:00:02.00, Default,     ,       0,       0,       0,       , Text
  const body = transcription.chunks.map((chunk) => {
    return `Dialogue: 0,${formatASSTime(chunk.timestamp[0])},${formatASSTime(chunk.timestamp[1])},Default,,0,0,0,,${chunk.text}`;
  });

  return `${template}\n${body.join('\n')}`;
}

function formatSRTTime(seconds) {
  // time format: HH:MM:SS,mmm, 00:00:00,000
  const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const s = String((seconds % 60).toFixed(3)).padStart(5, '0').replace('.', ',');
  return `${h}:${m}:${s}`;
}

export function transcriptToSRT(transcription) {
  // srt format:
  // index #
  // timestamp (HH:MM:SS,mmm)
  const body = transcription.chunks.map((chunk, index) => {
    return `${index}\n${formatSRTTime(chunk.timestamp[0])} --> ${formatSRTTime(chunk.timestamp[1])}\n${chunk.text.trim()}`;
  });

  return `${body.join('\n\n')}`;
}

export function downloadFile(content, filename, type = 'text/plain') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
