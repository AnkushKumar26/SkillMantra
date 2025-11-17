export class SpeechRecognitionService {
  private recognition: any;
  private isListening = false;

  constructor(
    private onResult: (transcript: string) => void,
    private onError: (error: string) => void
  ) {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      throw new Error("Speech recognition not supported in this browser");
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('');

      if (event.results[0].isFinal) {
        this.onResult(transcript);
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      this.onError(event.error);
      this.isListening = false;
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };
  }

  start() {
    if (!this.isListening) {
      this.recognition.start();
      this.isListening = true;
    }
  }

  stop() {
    if (this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  isActive() {
    return this.isListening;
  }
}

export class TextToSpeechService {
  private audioContext: AudioContext | null = null;
  private currentSource: AudioBufferSourceNode | null = null;

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Resume AudioContext if suspended (required for some browsers)
    if (this.audioContext.state === 'suspended') {
      console.log('AudioContext suspended, will resume on first speak');
    }
  }

  async speak(text: string, onEnd?: () => void) {
    console.log('TTS speak called with text:', text?.substring(0, 50));
    
    try {
      // Cancel any ongoing speech
      this.stop();

      if (!this.audioContext) {
        throw new Error('AudioContext not initialized');
      }

      // Resume AudioContext if suspended (required for Chrome/Safari)
      if (this.audioContext.state === 'suspended') {
        console.log('Resuming suspended AudioContext...');
        await this.audioContext.resume();
      }

      console.log('Calling ElevenLabs TTS...');

      // Call ElevenLabs edge function
      const response = await fetch(
        'https://cbgzhtushdvfkiarmgek.supabase.co/functions/v1/elevenlabs-tts',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text }),
        }
      );

      console.log('TTS response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('TTS API error:', errorText);
        throw new Error(`Failed to generate speech: ${response.status}`);
      }

      const { audioContent } = await response.json();
      console.log('Received audio content, length:', audioContent?.length);

      if (!audioContent) {
        throw new Error('No audio content received');
      }

      // Decode base64 audio
      const audioData = Uint8Array.from(atob(audioContent), c => c.charCodeAt(0));
      console.log('Decoded audio data, bytes:', audioData.length);

      const audioBuffer = await this.audioContext.decodeAudioData(audioData.buffer);
      console.log('Audio buffer decoded, duration:', audioBuffer.duration);

      // Play audio
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      
      source.onended = () => {
        console.log('Audio playback ended');
        this.currentSource = null;
        if (onEnd) onEnd();
      };

      this.currentSource = source;
      source.start(0);
      console.log('Audio playback started');
    } catch (error) {
      console.error('Text-to-speech error:', error);
      if (onEnd) onEnd();
    }
  }

  stop() {
    if (this.currentSource) {
      try {
        this.currentSource.stop();
        this.currentSource.disconnect();
      } catch (e) {
        // Ignore errors when stopping
      }
      this.currentSource = null;
    }
  }

  isSpeaking() {
    return this.currentSource !== null;
  }
}
