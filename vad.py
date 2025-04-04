import sys
import webrtcvad
import pyaudio
import wave
import whisper
import time
import os
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def save_to_wav(filename, frames, sample_rate=16000, channels=1, sample_width=2):
    with wave.open(filename, 'wb') as wf:
        wf.setnchannels(channels)
        wf.setsampwidth(sample_width)
        wf.setframerate(sample_rate)
        wf.writeframes(b''.join(frames))

# Initialize VAD, audio stream, and Whisper model
vad = webrtcvad.Vad(3) # 0 - 3
audio = pyaudio.PyAudio()
stream = audio.open(format=pyaudio.paInt16, channels=1, rate=16000, input=True, frames_per_buffer=2048)
model = whisper.load_model("base.en")

accumulated_frames = []
is_currently_speaking = False
silence_duration = 0  # Duration of silence in milliseconds

# Create a directory for temporary audio files if it doesn't exist
temp_audio_dir = "C://honey//audio//"
os.makedirs(temp_audio_dir, exist_ok=True)

while True:
    try:
        frame = stream.read(480, exception_on_overflow=False)
    except OSError as e:
        print(f"Error reading audio frame: {e}")
        continue

    is_speech = vad.is_speech(frame, 16000)

    if is_speech:
        is_currently_speaking = True
        silence_duration = 0  # Reset silence duration
        accumulated_frames.append(frame)
    else:
        if is_currently_speaking:
            silence_duration += 30  # Assuming each frame is 30ms
            if silence_duration >= 600:  # Wait for 300ms of silence before transcribing
                is_currently_speaking = False
                if accumulated_frames:
                    temp_filename = os.path.join(temp_audio_dir, "temp.wav")
                    save_to_wav(temp_filename, accumulated_frames)
                    result = model.transcribe(temp_filename)
                    print(result['text'])
                    sys.stdout.flush()
                    accumulated_frames = []  # Clear accumulated frames after transcription
        else:
            silence_duration = 0  # Reset silence duration
