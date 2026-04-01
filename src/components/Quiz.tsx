import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Circle, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuizQuestion {
  question: string;
  options: string[];
  answer: number;
}

interface QuizProps {
  questions: QuizQuestion[];
  onComplete: (score: number) => void;
}

const SOUNDS = {
  correct: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
  wrong: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  celebration: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3'
};

export const Quiz: React.FC<QuizProps> = ({ questions, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  useEffect(() => {
    // Preload sounds
    Object.entries(SOUNDS).forEach(([key, url]) => {
      const audio = new Audio(url);
      audio.load();
      audioRefs.current[key] = audio;
    });
  }, []);

  useEffect(() => {
    if (showResult && score === questions.length) {
      // Small delay to ensure the result screen is rendered
      const timer = setTimeout(() => {
        playSound('celebration');
        triggerConfetti();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [showResult, score, questions.length]);

  const playSound = (key: string) => {
    const audio = audioRefs.current[key];
    if (audio) {
      audio.currentTime = 0;
      audio.volume = 0.4;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log(`Playback failed for ${key}:`, error);
          // Fallback: try creating a new Audio object
          const fallbackAudio = new Audio(SOUNDS[key as keyof typeof SOUNDS]);
          fallbackAudio.volume = 0.4;
          fallbackAudio.play().catch(e => console.log(`Fallback playback failed for ${key}:`, e));
        });
      }
    } else {
      // If not preloaded, try direct play
      const directAudio = new Audio(SOUNDS[key as keyof typeof SOUNDS]);
      directAudio.volume = 0.4;
      directAudio.play().catch(e => console.log(`Direct playback failed for ${key}:`, e));
    }
  };

  const handleOptionSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
    
    if (index === questions[currentQuestion].answer) {
      setScore(prev => prev + 1);
      playSound('correct');
    } else {
      playSound('wrong');
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResult(true);
      onComplete(score);
    }
  };

  const triggerConfetti = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    const count = 200;
    const defaults = {
      origin: { 
        y: (rect.top + rect.height / 2) / window.innerHeight,
        x: (rect.left + rect.width / 2) / window.innerWidth
      },
      zIndex: 1000,
      colors: ['#00A3FF', '#FF6321', '#00FF00', '#FFFFFF']
    };

    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  };

  if (showResult) {
    const finalScore = score;
    return (
      <motion.div 
        ref={containerRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center p-6 bg-white/10 rounded-xl shadow-sm border border-white/10 relative overflow-hidden"
      >
        <Trophy className="w-12 h-12 text-orange-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Quiz Complete!</h3>
        <p className="text-white/60 mb-4">You scored {finalScore} out of {questions.length}</p>
        <button 
          onClick={() => {
            setCurrentQuestion(0);
            setScore(0);
            setSelectedOption(null);
            setIsAnswered(false);
            setShowResult(false);
          }}
          className="px-6 py-2 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition-colors relative z-10"
        >
          Try Again
        </button>
      </motion.div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="space-y-6" ref={containerRef}>
      <div className="flex justify-between items-center text-sm text-white/40">
        <span>Question {currentQuestion + 1} of {questions.length}</span>
        <span>Score: {score}</span>
      </div>

      <h3 className="text-lg font-semibold text-white">{question.question}</h3>

      <div className="space-y-3">
        {question.options.map((option, index) => {
          const isSelected = selectedOption === index;
          const isCorrect = isAnswered && index === question.answer;
          const isWrong = isAnswered && isSelected && index !== question.answer;

          return (
            <button
              key={index}
              onClick={() => handleOptionSelect(index)}
              disabled={isAnswered}
              className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ${
                isCorrect 
                  ? 'bg-green-500/20 border-green-500/40 text-green-400' 
                  : isWrong 
                    ? 'bg-red-500/20 border-red-500/40 text-red-400'
                    : isSelected
                      ? 'bg-orange-500/20 border-orange-500/40 text-orange-400'
                      : 'bg-white/5 border-white/10 hover:border-orange-500/40 text-white/70'
              }`}
            >
              <span>{option}</span>
              {isCorrect && <CheckCircle2 className="w-5 h-5 text-green-500" />}
              {isWrong && <Circle className="w-5 h-5 text-red-500" />}
            </button>
          );
        })}
      </div>

      {isAnswered && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleNext}
          className="w-full py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors"
        >
          {currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
        </motion.button>
      )}
    </div>
  );
};
