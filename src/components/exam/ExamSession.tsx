import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { CheckCircle, XCircle, ArrowLeft, ArrowRight, Clock, BookOpen } from 'lucide-react';
import { questionDB, examResultsDB } from '@/database/config';
import { Question, ExamSession as ExamSessionType } from '@/types';
import { useNavigate } from 'react-router-dom';
import { LoadingState } from '@/components/LoadingComponents';

export function ExamSession() {
  const [session, setSession] = useState<ExamSessionType | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize exam session
    const initializeExam = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const questions = await questionDB.getRandom(20);
        
        if (questions.length === 0) {
          throw new Error('No hay preguntas disponibles en la base de datos');
        }

        const newSession: ExamSessionType = {
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
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    initializeExam();
  }, []);

  // Timer effect
  useEffect(() => {
    if (!session || isFinished || isLoading) return;

    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [session, isFinished, isLoading]);

  const selectAnswer = (answerIndex: number | null) => {
    if (!session || session.isFinished) return;

    const updatedAnswers = [...session.userAnswers];
    updatedAnswers[session.currentQuestionIndex] = answerIndex;

    setSession({
      ...session,
      userAnswers: updatedAnswers,
    });
  };

  const goToQuestion = (index: number) => {
    if (!session || index < 0 || index >= session.questions.length) return;
    
    setSession({
      ...session,
      currentQuestionIndex: index,
    });
    setCurrentQuestion(session.questions[index]);
  };

  const nextQuestion = () => {
    if (!session) return;
    
    if (session.currentQuestionIndex < session.questions.length - 1) {
      const nextIndex = session.currentQuestionIndex + 1;
      goToQuestion(nextIndex);
    }
  };

  const previousQuestion = () => {
    if (!session) return;
    
    if (session.currentQuestionIndex > 0) {
      const prevIndex = session.currentQuestionIndex - 1;
      goToQuestion(prevIndex);
    }
  };

  const finishExam = async () => {
    if (!session) return;

    try {
      const correctAnswers = session.userAnswers.filter(
        (answer, index) => answer === session.questions[index].correctAnswer
      ).length;

      const score = correctAnswers;
      const percentage = (correctAnswers / session.questions.length) * 100;
      const endTime = new Date();
      const totalTimeMinutes = Math.floor(timeElapsed / 60);

      const completedSession: ExamSessionType = {
        ...session,
        isFinished: true,
        endTime,
        score,
        percentage,
        totalTimeMinutes,
      };

      // Guardar resultado en la base de datos
      try {
        await examResultsDB.save({
          sessionId: session.id,
          score,
          percentage,
          totalQuestions: session.questions.length,
          correctAnswers,
          totalTimeMinutes,
        });
      } catch (saveError) {
        console.warn('Error saving exam result:', saveError);
        // No bloqueamos la finalización del examen si hay error guardando
      }

      setSession(completedSession);
      setIsFinished(true);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al finalizar el examen';
      setError(errorMessage);
    }
  };

  const restartExam = () => {
    setSession(null);
    setCurrentQuestion(null);
    setTimeElapsed(0);
    setIsFinished(false);
    setError(null);
    window.location.reload();
  };

  const getAnsweredCount = () => {
    if (!session) return 0;
    return session.userAnswers.filter(answer => answer !== null).length;
  };

  const getProgress = () => {
    if (!session) return 0;
    return (getAnsweredCount() / session.questions.length) * 100;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl shadow-xl border-red-100">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-red-800 flex items-center justify-center gap-2">
              <XCircle className="h-8 w-8" />
              Error en el Examen
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-red-600">{error}</p>
            <div className="flex justify-center space-x-4">
              <Button onClick={restartExam} variant="outline">
                Intentar nuevamente
              </Button>
              <Button onClick={() => navigate('/')}>
                Volver al inicio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingState type="exam" />;
  }

  if (!session || !currentQuestion) {
    return <LoadingState message="Preparando el examen..." />;
  }

  if (isFinished && session.score !== undefined && session.percentage !== undefined) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="shadow-xl border-green-100">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <span className="text-xl font-bold">Examen Completado</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-700">{session.score}</div>
                <div className="text-sm text-blue-600">Respuestas Correctas</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-700">{session.percentage.toFixed(1)}%</div>
                <div className="text-sm text-green-600">Porcentaje</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-700">{formatTime(timeElapsed)}</div>
                <div className="text-sm text-purple-600">Tiempo Total</div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progreso del examen</span>
                <span>{session.score}/{session.questions.length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${session.percentage}%` }}
                />
              </div>
            </div>

            <div className="flex justify-center space-x-4 mt-6">
              <Button onClick={() => navigate('/')} className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Volver al Inicio
              </Button>
              <Button variant="outline" onClick={restartExam} className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Nuevo Examen
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Review */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Revisión Detallada de Respuestas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {session.questions.map((question, index) => {
              const userAnswer = session.userAnswers[index];
              const isCorrect = userAnswer === question.correctAnswer;

              return (
                <div key={question.id} className={`border rounded-lg p-6 ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                  <div className="flex items-start space-x-3 mb-4">
                    {isCorrect ? (
                      <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-500 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-lg mb-2">Pregunta {index + 1}</h4>
                      <p className="text-gray-800 mb-4">{question.question}</p>

                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className={`p-3 rounded-lg text-sm ${
                              optionIndex === question.correctAnswer
                                ? 'bg-green-100 text-green-800 font-semibold border border-green-300'
                                : optionIndex === userAnswer && !isCorrect
                                ? 'bg-red-100 text-red-800 border border-red-300'
                                : 'bg-gray-50 text-gray-700'
                            }`}
                          >
                            <span className="font-medium">
                              {String.fromCharCode(65 + optionIndex)}.
                            </span>
                            {' '}{option}
                            {optionIndex === question.correctAnswer && (
                              <CheckCircle className="inline h-4 w-4 text-green-600 ml-2" />
                            )}
                            {optionIndex === userAnswer && optionIndex !== question.correctAnswer && (
                              <XCircle className="inline h-4 w-4 text-red-600 ml-2" />
                            )}
                          </div>
                        ))}
                        {userAnswer === null && (
                          <div className="p-3 rounded-lg bg-gray-100 text-gray-600 text-sm italic">
                            Sin respuesta
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-3 text-xs text-gray-500">
                        <strong>Categoría:</strong> {question.category} | <strong>Fuente:</strong> {question.source}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white pb-16">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between py-4 px-6">
          <h1 className="text-2xl font-bold text-blue-900 tracking-tight">Examen COT</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-blue-100">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-blue-800 font-semibold text-sm">
                {formatTime(timeElapsed)}
              </span>
            </div>
            <div className="text-sm text-blue-600">
              Pregunta {session.currentQuestionIndex + 1} de {session.questions.length}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Question Area */}
          <div className="lg:col-span-3">
            <Card className="shadow-xl border-blue-100">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-blue-900">
                    {session.currentQuestionIndex + 1}.
                  </CardTitle>
                  <div className="text-xs text-blue-600">
                    {currentQuestion.category}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <h2 className="font-semibold text-lg text-gray-800 mb-6 leading-relaxed">
                  {currentQuestion.question}
                </h2>
                
                <div className="space-y-3">
                  {currentQuestion.options.map((option, optionIndex) => (
                    <label 
                      key={optionIndex} 
                      className={`flex items-start gap-3 p-4 rounded-lg cursor-pointer transition-all duration-200 border-2 hover:shadow-md ${
                        session.userAnswers[session.currentQuestionIndex] === optionIndex 
                          ? 'bg-blue-50 border-blue-300 shadow-sm' 
                          : 'bg-white border-gray-200 hover:bg-blue-25 hover:border-blue-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${session.currentQuestionIndex}`}
                        checked={session.userAnswers[session.currentQuestionIndex] === optionIndex}
                        onChange={() => selectAnswer(optionIndex)}
                        className="form-radio h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0"
                      />
                      <div className="flex-1">
                        <span className="font-semibold text-blue-600 mr-2">
                          {String.fromCharCode(65 + optionIndex)}.
                        </span>
                        <span className="text-gray-800">{option}</span>
                      </div>
                    </label>
                  ))}
                  
                  <label className="flex items-start gap-3 p-4 rounded-lg cursor-pointer transition-all duration-200 border-2 bg-gray-50 border-gray-200 hover:bg-gray-100">
                    <input
                      type="radio"
                      name={`question-${session.currentQuestionIndex}`}
                      checked={session.userAnswers[session.currentQuestionIndex] === null}
                      onChange={() => selectAnswer(null)}
                      className="form-radio h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0"
                    />
                    <span className="text-gray-500 italic">Dejar sin respuesta</span>
                  </label>
                </div>

                <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                  <Button 
                    variant="outline" 
                    onClick={previousQuestion} 
                    disabled={session.currentQuestionIndex === 0}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" /> 
                    Anterior
                  </Button>
                  
                  {session.currentQuestionIndex === session.questions.length - 1 ? (
                    <Button 
                      onClick={finishExam}
                      className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Finalizar Examen
                    </Button>
                  ) : (
                    <Button 
                      onClick={nextQuestion}
                      className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                    >
                      Siguiente 
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 space-y-6">
              {/* Progress Card */}
              <Card className="shadow-lg border-blue-100">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-3">
                  <CardTitle className="text-sm font-semibold text-blue-800">
                    Progreso del Examen
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Respondidas:</span>
                      <span className="font-semibold text-blue-600">
                        {getAnsweredCount()}/{session.questions.length}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${getProgress()}%` }}
                        />
                      </div>
                      <div className="text-center text-xs text-gray-500">
                        {getProgress().toFixed(0)}% completado
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Question Navigation Grid */}
              <Card className="shadow-lg border-blue-100">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-3">
                  <CardTitle className="text-sm font-semibold text-blue-800">
                    Navegación
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 gap-2">
                    {session.questions.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToQuestion(index)}
                        className={`w-full h-12 rounded-lg text-sm font-semibold transition-all duration-200 border-2 ${
                          session.currentQuestionIndex === index
                            ? 'bg-blue-600 text-white border-blue-700 shadow-lg'
                            : session.userAnswers[index] !== null
                            ? 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                        }`}
                        title={`Pregunta ${index + 1} ${session.userAnswers[index] !== null ? '(Respondida)' : '(Sin respuesta)'}`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                  
                  <Button 
                    onClick={finishExam} 
                    className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold"
                  >
                    Finalizar Examen
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="shadow-lg border-blue-100">
                <CardContent className="p-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sin respuesta:</span>
                      <span className="font-semibold text-red-600">
                        {session.questions.length - getAnsweredCount()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tiempo activo:</span>
                      <span className="font-semibold text-blue-600">
                        {formatTime(timeElapsed)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}