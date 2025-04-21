import { pipeline } from '@huggingface/transformers';

class TranscriptionPipeline {
  static task = null;
  static model = null;
  static instance = null;
  static device = null;

  constructor(model, device) {
    this.model = model;
    this.device = device;
  }

  static async getInstance(progress_callback = null) {
    this.instance ??= pipeline(this.task, this.model, { device: this.device, progress_callback });
    return this.instance;
  }
}

class AutomaticSpeechRecognitionPipeline extends TranscriptionPipeline {
  static task = 'automatic-speech-recognition';
  static model = null;
  static device = null;
}

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
  if (!event.data.f32Array) {
    self.postMessage({
      status: 'error',
      error: new Error('Invalid Youtube URL')
    });
    return;
  }

  const asrPipeline = AutomaticSpeechRecognitionPipeline;
  if (asrPipeline.model !== event.data.model || asrPipeline.device !== event.data.device) {
    asrPipeline.model = event.data.model;
    asrPipeline.device = event.data.device;

    if (asrPipeline.instance !== null) {
      (await asrPipeline.getInstance()).dispose();
      asrPipeline.instance = null;
    }
  }

  // Retrieve the translation pipeline. When called for the first time,
  // this will load the pipeline and save it for future use.
  let transcriber;
  try {
    transcriber = await asrPipeline.getInstance(x => {
      // We also add a progress callback to the pipeline so that we can
      // track model loading.
      self.postMessage(x);
    });
  } catch (error) {
    console.error(error);
    self.postMessage({
      status: 'error',
      error
    });
    return;
  }

  const output = await transcriber(event.data.f32Array, { chunk_length_s: 30, stride_length_s: 3, return_timestamps: true,
                                                          language: event.data.language, task: event.data.translateChecked ? 'translate' : 'transcribe'
  });

  // Send the output back to the main thread
  self.postMessage({
    status: 'complete',
    output,
  });
});