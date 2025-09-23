import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { questionDB, examResultsDB } from '@/database/browser';
import { Question, ExamSession, ExamResult } from '@/types';
import { useToast } from '@/components/Toast';

interface UseExamOptions {
  questionCount?: number;
  autoSave?: boolean;
  onComplete?: (result: ExamResult) => void;
}

export function useExam(options: UseExamOptions = {}) {
  const { questionCount = 4, autoSave = true, onComplete } = options;
  const [session, setSession] = useState<ExamSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  
  const navigate = useNavigate();
  const toast = useToast();

  // Initialize exam session
  const initializeExam = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const questions = questionDB.getRandom(questionCount);
      
      if (questions.length === 0) {
        throw new Error('No hay preguntas disponibles en la base de datos');
      }

      if (questions.length < questionCount) {
        toast.warning(
          'Preguntas limitadas',
          `Solo hay ${questions.length} preguntas disponibles de ${questionCount} solicitadas`
        );
      }

      const newSession: ExamSession = {
        id: Date.now().toString(),
        questions,
        currentQuestionIndex: 0,
        userAnswers: new Array(questions.length).fill(null),
        startTime: new Date(),
        isFinished: false,
      };

      setSession(newSession);
      setCurrentQuestion(questions[0]);
      setIsFinished(false);
      
      toast.success('Examen iniciado', 'El examen ha comenzado. ¡Buena suerte!');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      toast.error('Error al iniciar el examen', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [questionCount, toast]);

  // Timer effect
  useEffect(() => {
    if (!session || isFinished || isLoading) return;

    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [session, isFinished, isLoading]);

  // Auto-save progress to localStorage
  useEffect(() => {
    if (session && autoSave && !isFinished) {
      const examData = {
        ...session,
        timeElapsed,
      };
      localStorage.setItem('currentExam', JSON.stringify(examData));
    }
  }, [session, timeElapsed, autoSave, isFinished]);

  // Load saved exam on mount
  useEffect(() => {
    const savedExam = localStorage.getItem('currentExam');
    if (savedExam) {
      try {
        const parsed = JSON.parse(savedExam);
        const sessionData = {
          ...parsed,
          startTime: new Date(parsed.startTime),
          endTime: parsed.endTime ? new Date(parsed.endTime) : undefined,
        };
        
        if (!sessionData.isFinished) {
          setSession(sessionData);
          setCurrentQuestion(sessionData.questions[sessionData.currentQuestionIndex]);
          setTimeElapsed(parsed.timeElapsed || 0);
          setIsLoading(false);
          toast.info('Examen restaurado', 'Se ha restaurado tu sesión anterior');
          return;
        }
      } catch (err) {
        console.error('Error loading saved exam:', err);
        localStorage.removeItem('currentExam');
      }
    }
    
    initializeExam();
  }, [initializeExam, toast]);

  const selectAnswer = useCallback((answerIndex: number | null) => {
    if (!session || session.isFinished) return;

    const updatedAnswers = [...session.userAnswers];
    updatedAnswers[session.currentQuestionIndex] = answerIndex;

    setSession(prev => prev ? {
      ...prev,
      userAnswers: updatedAnswers,
    } : null);
  }, [session]);

  const goToQuestion = useCallback((index: number) => {
    if (!session || index < 0 || index >= session.questions.length) return;
    
    setSession(prev => prev ? {
      ...prev,
      currentQuestionIndex: index,
    } : null);
    setCurrentQuestion(session.questions[index]);
  }, [session]);

  const nextQuestion = useCallback(() => {
    if (!session) return;
    
    if (session.currentQuestionIndex < session.questions.length - 1) {
      const nextIndex = session.currentQuestionIndex + 1;
      goToQuestion(nextIndex);
    }
  }, [session, goToQuestion]);

  const previousQuestion = useCallback(() => {
    if (!session) return;
    
    if (session.currentQuestionIndex > 0) {
      const prevIndex = session.currentQuestionIndex - 1;
      goToQuestion(prevIndex);
    }
  }, [session, goToQuestion]);

  const finishExam = useCallback(() => {
    if (!session) return;

    try {
      const correctAnswers = session.userAnswers.filter(
        (answer, index) => answer === session.questions[index].correctAnswer
      ).length;

      const score = correctAnswers;
      const percentage = (correctAnswers / session.questions.length) * 100;
      const endTime = new Date();

      const completedSession: ExamSession = {
        ...session,
        isFinished: true,
        endTime,
        score,
        percentage,
        totalTimeMinutes: Math.floor(timeElapsed / 60),
      };

      const result: ExamResult = {
        id: `result_${Date.now()}`,
        sessionId: session.id,
        score,
        percentage,
        totalQuestions: session.questions.length,
        correctAnswers,
        totalTimeMinutes: Math.floor(timeElapsed / 60),
        completedAt: endTime,
      };

      // Save to database
      if (autoSave) {
        examResultsDB.save(result);
      }

      setSession(completedSession);
      setIsFinished(true);
      
      // Clear saved exam
      localStorage.removeItem('currentExam');
      
      toast.success(
        'Examen completado',
        `Has obtenido ${correctAnswers}/${session.questions.length} respuestas correctas (${percentage.toFixed(1)}%)`
      );

      if (onComplete) {
        onComplete(result);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al finalizar el examen';
      toast.error('Error', errorMessage);
    }
  }, [session, timeElapsed, autoSave, onComplete, toast]);

  const restartExam = useCallback(() => {
    localStorage.removeItem('currentExam');
    setSession(null);
    setCurrentQuestion(null);
    setTimeElapsed(0);
    setIsFinished(false);
    setError(null);
    initializeExam();
  }, [initializeExam]);

  const getAnsweredCount = useCallback(() => {
    if (!session) return 0;
    return session.userAnswers.filter(answer => answer !== null).length;
  }, [session]);

  const getProgress = useCallback(() => {
    if (!session) return 0;
    return (getAnsweredCount() / session.questions.length) * 100;
  }, [session, getAnsweredCount]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    // State
    session,
    currentQuestion,
    timeElapsed,
    isLoading,
    error,
    isFinished,
    
    // Actions
    selectAnswer,
    goToQuestion,
    nextQuestion,
    previousQuestion,
    finishExam,
    restartExam,
    initializeExam,
    
    // Computed values
    getAnsweredCount,
    getProgress,
    formatTime,
    
    // Utilities
    navigate,
  };
}