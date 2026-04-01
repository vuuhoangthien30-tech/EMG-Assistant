import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, X, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";

interface VoiceAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  context?: string;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ isOpen, onClose, context }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isOutputMuted, setIsOutputMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volume, setVolume] = useState(0);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sessionRef = useRef<any>(null);
  const audioQueueRef = useRef<Int16Array[]>([]);
  const isPlayingRef = useRef(false);
  const nextStartTimeRef = useRef(0);
  const gainNodeRef = useRef<GainNode | null>(null);

  const stopAudio = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    setIsConnected(false);
    setIsConnecting(false);
    setIsSpeaking(false);
    audioQueueRef.current = [];
    isPlayingRef.current = false;
    nextStartTimeRef.current = 0;
  }, []);

  const playQueuedAudio = useCallback(() => {
    if (!audioContextRef.current || audioQueueRef.current.length === 0 || isPlayingRef.current) return;

    isPlayingRef.current = true;
    const chunk = audioQueueRef.current.shift()!;
    
    const float32Data = new Float32Array(chunk.length);
    for (let i = 0; i < chunk.length; i++) {
      float32Data[i] = chunk[i] / 32768.0;
    }

    const buffer = audioContextRef.current.createBuffer(1, float32Data.length, 24000);
    buffer.getChannelData(0).set(float32Data);

    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    
    if (!gainNodeRef.current) {
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.connect(audioContextRef.current.destination);
    }
    
    source.connect(gainNodeRef.current);

    const startTime = Math.max(audioContextRef.current.currentTime, nextStartTimeRef.current);
    source.start(startTime);
    nextStartTimeRef.current = startTime + buffer.duration;

    source.onended = () => {
      isPlayingRef.current = false;
      if (audioQueueRef.current.length > 0) {
        playQueuedAudio();
      } else {
        setIsSpeaking(false);
      }
    };
  }, []);

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = isOutputMuted ? 0 : 1;
    }
  }, [isOutputMuted]);

  const startConnection = async () => {
    try {
      setIsConnecting(true);
      const apiKey = process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error("API Key missing");

      const ai = new GoogleGenAI({ apiKey });
      
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContextClass({ sampleRate: 16000 });
      
      // Resume context on user interaction
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.connect(audioContextRef.current.destination);
      
      const session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: `You are a friendly and helpful EMG study assistant. Keep your responses concise and natural for a voice conversation. You can speak both English and Vietnamese if requested, but default to English as the user is an EMG student. Respond quickly and with a natural tone.
          
          Student's Current Context: ${context || 'No specific context provided.'}`,
        },
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            setIsConnecting(false);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.modelTurn?.parts) {
              for (const part of message.serverContent.modelTurn.parts) {
                if (part.inlineData?.data) {
                  const base64Data = part.inlineData.data;
                  const binaryString = atob(base64Data);
                  const bytes = new Uint8Array(binaryString.length);
                  for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                  }
                  const pcmData = new Int16Array(bytes.buffer);
                  audioQueueRef.current.push(pcmData);
                  setIsSpeaking(true);
                  
                  // Ensure context is running
                  if (audioContextRef.current?.state === 'suspended') {
                    audioContextRef.current.resume();
                  }
                  
                  playQueuedAudio();
                }
              }
            }
            if (message.serverContent?.interrupted) {
              audioQueueRef.current = [];
              isPlayingRef.current = false;
              setIsSpeaking(false);
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => stopAudio(),
          onerror: (err) => {
            console.error("Live API Error:", err);
            stopAudio();
          }
        }
      });

      sessionRef.current = session;

      // Setup Microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (isMuted || !isConnected) return;
        
        const inputData = e.inputBuffer.getChannelData(0);
        
        // Calculate volume for UI
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        setVolume(Math.sqrt(sum / inputData.length));

        // Convert to PCM 16-bit
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
        }

        // Send to Gemini
        const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
        session.sendRealtimeInput({
          audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
        });
      };

      source.connect(processor);
      processor.connect(audioContextRef.current.destination);

    } catch (err) {
      console.error("Failed to start voice assistant:", err);
      stopAudio();
    }
  };

  useEffect(() => {
    if (isOpen && !isConnected && !isConnecting) {
      startConnection();
    }
    return () => {
      if (!isOpen) stopAudio();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-xl p-4"
    >
      <div className="bg-[#151619] w-full max-w-md rounded-[2.5rem] border border-white/10 p-8 flex flex-col items-center relative overflow-hidden shadow-2xl">
        {/* Animated Background Glow */}
        <div className={Object.assign({}, {
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '300px',
          height: '300px',
          background: isSpeaking ? 'radial-gradient(circle, rgba(0, 163, 255, 0.2) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(40px)',
          transition: 'all 0.5s ease',
          zIndex: 0
        } as any)} />

        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors z-10"
        >
          <X size={24} className="text-white/60" />
        </button>

        <div className="relative z-10 flex flex-col items-center w-full">
          <div className="mb-8 text-center">
            <h3 className="text-xl font-bold text-white mb-2">Voice Chat</h3>
            <p className="text-sm text-white/40">
              {isConnecting ? "Connecting to Gemini..." : isConnected ? (isMuted ? "Muted" : "Listening...") : "Disconnected"}
            </p>
          </div>

          {/* Visualizer */}
          <div className="h-32 flex items-center justify-center gap-1 mb-12">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                animate={{ 
                  height: isConnected ? (isSpeaking ? [20, 60, 20] : [10, 10 + volume * 200, 10]) : 4 
                }}
                transition={{ 
                  duration: isSpeaking ? 0.5 : 0.1, 
                  repeat: Infinity,
                  delay: i * 0.05 
                }}
                className="w-1.5 bg-[#00A3FF] rounded-full opacity-60"
              />
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
                isMuted ? 'bg-red-500/20 text-red-500 border-red-500/40' : 'bg-white/5 text-white border-white/10'
              } border`}
            >
              {isMuted ? <MicOff size={28} /> : <Mic size={28} />}
            </button>

            <div className="relative">
              {isConnecting && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 size={48} className="text-[#00A3FF] animate-spin" />
                </div>
              )}
              <div className={`w-24 h-24 rounded-full flex items-center justify-center bg-gradient-to-br from-[#0056B3] to-[#00A3FF] shadow-[0_0_30px_rgba(0,163,255,0.4)] ${isConnecting ? 'opacity-20' : 'opacity-100'} ${isSpeaking ? 'scale-110' : 'scale-100'} transition-transform duration-300`}>
                <Volume2 size={40} className="text-white" />
              </div>
            </div>

            <button
              onClick={() => setIsOutputMuted(!isOutputMuted)}
              className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
                isOutputMuted ? 'bg-red-500/20 text-red-500 border-red-500/40' : 'bg-white/5 text-white border-white/10'
              } border`}
            >
              {isOutputMuted ? <VolumeX size={28} /> : <Volume2 size={28} />}
            </button>
          </div>

          <div className="mt-12 text-center">
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">
              Powered by Gemini 3.1 Flash Live
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
