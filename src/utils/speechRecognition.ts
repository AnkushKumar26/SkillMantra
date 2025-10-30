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
  }

  async speak(text: string, onEnd?: () => void) {
    try {
      // Cancel any ongoing speech
      this.stop();

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

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      const { audioContent } = await response.json();

      // Decode base64 audio
      const audioData = Uint8Array.from(atob(audioContent), c => c.charCodeAt(0));
      const audioBuffer = await this.audioContext!.decodeAudioData(audioData.buffer);

      // Play audio
      const source = this.audioContext!.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext!.destination);
      
      source.onended = () => {
        this.currentSource = null;
        if (onEnd) onEnd();
      };

      this.currentSource = source;
      source.start(0);
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
