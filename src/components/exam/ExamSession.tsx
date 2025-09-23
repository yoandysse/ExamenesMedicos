import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { questionDB } from '@/database/browser';
import { Question, ExamSession as ExamSessionType } from '@/types';
import { Clock, CheckCircle, XCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ExamSession() {
  const [session, setSession] = useState<ExamSessionType | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Inicializar sesión de examen
    try {
      const questions = questionDB.getRandom(20); // 20 preguntas aleatorias
      if (questions.length === 0) {
        alert('No hay preguntas disponibles');
        navigate('/');
        return;
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
    } catch (error) {
      console.error('Error starting exam:', error);
      navigate('/');
    }
  }, [navigate]);

  // Timer para el examen
  useEffect(() => {
    if (showResults) return; // Detener timer si terminó el examen
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [showResults]);

  const selectAnswer = (answerIndex: number) => {
    if (!session || session.isFinished) return;

    const updatedAnswers = [...session.userAnswers];
    updatedAnswers[session.currentQuestionIndex] = answerIndex;

    setSession({
      ...session,
      userAnswers: updatedAnswers,
    });
  };

  const nextQuestion = () => {
    if (!session) return;

    if (session.currentQuestionIndex < session.questions.length - 1) {
      const nextIndex = session.currentQuestionIndex + 1;
      setSession({
        ...session,
        currentQuestionIndex: nextIndex,
      });
      setCurrentQuestion(session.questions[nextIndex]);
    }
  };

  const previousQuestion = () => {
    if (!session) return;

    if (session.currentQuestionIndex > 0) {
      const prevIndex = session.currentQuestionIndex - 1;
      setSession({
        ...session,
        currentQuestionIndex: prevIndex,
      });
      setCurrentQuestion(session.questions[prevIndex]);
    }
  };

  const finishExam = () => {
    if (!session) return;

    const correctAnswers = session.userAnswers.filter(
      (answer, index) => answer === session.questions[index].correctAnswer
    ).length;

    const score = correctAnswers;
    const percentage = (correctAnswers / session.questions.length) * 100;

    setSession({
      ...session,
      isFinished: true,
      endTime: new Date(),
      score,
      percentage,
      totalTimeMinutes: Math.floor(timeElapsed / 60),
    });

    setShowResults(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = () => {
    if (!session) return 0;
    return session.userAnswers.filter(answer => answer !== null).length;
  };

  if (!session || !currentQuestion) {
    return (
      <div className="flex items-center justify-center h-64">
        <div>Cargando examen...</div>
      </div>
    );
  }

  if (showResults) {
    // Calcular score y porcentaje si no están en session
    const correctAnswers = session.userAnswers.filter(
      (answer, index) => answer === session.questions[index].correctAnswer
    ).length;
    const score = correctAnswers;
    const percentage = (correctAnswers / session.questions.length) * 100;
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <span className="text-xl font-bold">Examen Completado</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold">{score}</div>
                <div className="text-sm text-muted-foreground">Respuestas Correctas</div>
              </div>
              <div>
                <div className="text-3xl font-bold">{percentage.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Porcentaje</div>
              </div>
              <div>
                <div className="text-3xl font-bold">{formatTime(timeElapsed)}</div>
                <div className="text-sm text-muted-foreground">Tiempo Total</div>
              </div>
            </div>
            <div className="flex justify-center space-x-4 mt-4">
              <Button onClick={() => navigate('/')}>Volver al Inicio</Button>
              <Button variant="outline" onClick={() => window.location.reload()}>Nuevo Examen</Button>
            </div>
          </CardContent>
        </Card>

        {/* Revisar respuestas */}
        <Card>
          <CardHeader>
            <CardTitle>Revisión de Respuestas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {session.questions.map((question, index) => {
              const userAnswer = session.userAnswers[index];
              const isCorrect = userAnswer === question.correctAnswer;

              return (
                <div key={question.id} className="border rounded-lg p-4">
                  <div className="flex items-start space-x-2 mb-2">
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium">Pregunta {index + 1}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{question.question}</p>

                      <div className="space-y-1">
                        {question.options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className={`text-sm p-2 rounded ${
                              optionIndex === question.correctAnswer
                                ? 'bg-green-100 text-green-800'
                                : optionIndex === userAnswer && !isCorrect
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-50'
                            }`}
                          >
                            {option} {optionIndex === question.correctAnswer && '✓'}
                            {optionIndex === userAnswer && optionIndex !== question.correctAnswer && '✗'}
                          </div>
                        ))}
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
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between py-4 px-6">
          <h1 className="text-2xl font-bold text-blue-900 tracking-tight">Test</h1>
          <div className="flex items-center gap-4">
            <span className="bg-green-200 text-green-800 px-3 py-1 rounded-full font-semibold text-sm">Tiempo test {Math.floor(timeElapsed/60)}:{String(timeElapsed%60).padStart(2,'0')}</span>
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 pt-10">
        {session && currentQuestion && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Card className="shadow-xl border-blue-100">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xl font-bold text-blue-900">{session.currentQuestionIndex + 1}.</CardTitle>
                  {/* Marcar para revisión, etc. */}
                </CardHeader>
                <CardContent>
                  <h2 className="font-semibold text-lg text-blue-800 mb-4">{currentQuestion.question}</h2>
                  <div className="space-y-2">
                    {["Dejar sin respuesta", ...currentQuestion.options].map((opt, idx) => (
                      <label key={idx} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition border ${session.userAnswers[session.currentQuestionIndex] === idx-1 ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200 hover:bg-blue-100'}`}>
                        <input
                          type="radio"
                          name="answer"
                          checked={session.userAnswers[session.currentQuestionIndex] === idx-1}
                          onChange={() => selectAnswer(idx-1)}
                          className="form-radio h-5 w-5 text-blue-600"
                        />
                        <span className={idx === 0 ? 'text-gray-500' : 'text-blue-900 font-medium'}>{opt}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex justify-between mt-8">
                    <Button variant="outline" className="px-6 py-2" onClick={previousQuestion} disabled={session.currentQuestionIndex === 0}>
                      <ArrowLeft className="mr-2 h-5 w-5" /> Anterior
                    </Button>
                    {session.currentQuestionIndex === session.questions.length - 1 ? (
                      <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2" onClick={finishExam}>
                        Finalizar y revisar examen
                      </Button>
                    ) : (
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2" onClick={nextQuestion}>
                        Siguiente <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div>
              <div className="bg-white rounded-xl shadow p-4 border border-blue-50 mb-6">
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-gray-500 text-sm">{session.userAnswers.filter(a => a === null).length} Sin respuesta</span>
                  <span className="text-blue-500 text-sm">{session.userAnswers.filter(a => a !== null).length} Respondidas</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {session.questions.map((_, idx) => (
                    <button key={idx} className={`w-10 h-10 rounded-lg border text-sm font-semibold transition
                      ${session.userAnswers[idx] === null ? 'bg-gray-100 border-gray-300 text-gray-500' : 'bg-blue-100 border-blue-300 text-blue-700'}
                      ${session.currentQuestionIndex === idx ? 'ring-2 ring-blue-500' : ''}
                    `} onClick={() => {/* lógica ir a pregunta */}}>{idx+1}</button>
                  ))}
                </div>
                <Button className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg" onClick={() => setShowResults(true)}>
                  Finalizar
                </Button>
              </div>
            </div>
          </div>
        )}
        {/* Resultados y modal de revisión se pueden mejorar similarmente */}
      </main>
    </div>
  );
}
