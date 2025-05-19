# YT2Sub

YT2Sub is a web tool for transcribing YouTube videos using selectable Whisper AI models. Choose one of the preset models, or browse the [model directory](https://huggingface.co/models?pipeline_tag=automatic-speech-recognition&library=transformers.js&sort=trending) and enter a supported model. The tool downloads the model locally to your browser for transcription, and the transcription process is done directly in the browser using [Transformers.js](https://github.com/huggingface/transformers.js).

## Usage
A demo is available at https://yt2sub.onrender.com
1. Choose a model from Preset Models, or enter one from the [model directory](https://huggingface.co/models?pipeline_tag=automatic-speech-recognition&library=transformers.js&sort=trending).
2. Select the Source Language for the YouTube video.
3. Enter the URL or ID of the YouTube video and click enter.

## Installation

#### 1. Clone the repository

```
git clone https://github.com/stanley-nguyen/yt2sub.git
cd yt2sub
```
#### 2. Set up backend

Navigate to the backend directory and install dependencies.
```
cd backend
npm install
```

#### 3. Set up frontend

Navigate to the frontend directory and install dependencies.
```
cd ../client
npm install
```

#### 4. Start the servers in development mode

In `/backend`:
```
npm run dev
```

In `/client`:
```
npm run dev
```

Once the servers are active, go to `http://localhost:5173` to access the frontend.
