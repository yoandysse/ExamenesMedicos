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

  useEffect(() => {
    // Timer para el examen
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <span>Examen Completado</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold">{session.score}</div>
                <div className="text-sm text-muted-foreground">Respuestas Correctas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{session.percentage?.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Porcentaje</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{formatTime(timeElapsed)}</div>
                <div className="text-sm text-muted-foreground">Tiempo Total</div>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <Button onClick={() => navigate('/')}>
                Volver al Inicio
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Nuevo Examen
              </Button>
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header del examen */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>
                Pregunta {session.currentQuestionIndex + 1} de {session.questions.length}
              </CardTitle>
              <CardDescription>
                {getAnsweredCount()} de {session.questions.length} respondidas
              </CardDescription>
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{formatTime(timeElapsed)}</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Pregunta actual */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{currentQuestion.question}</CardTitle>
          <CardDescription>
            Categoría: {currentQuestion.category} | Fuente: {currentQuestion.source}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <Button
              key={index}
              variant={session.userAnswers[session.currentQuestionIndex] === index ? 'default' : 'outline'}
              className="w-full text-left justify-start h-auto p-4"
              onClick={() => selectAnswer(index)}
            >
              <span className="mr-3 font-mono">{String.fromCharCode(65 + index)}.</span>
              {option}
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Navegación */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={previousQuestion}
          disabled={session.currentQuestionIndex === 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Anterior
        </Button>

        <div className="flex space-x-2">
          {session.currentQuestionIndex === session.questions.length - 1 ? (
            <Button onClick={finishExam}>
              Finalizar Examen
            </Button>
          ) : (
            <Button onClick={nextQuestion}>
              Siguiente
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Progreso */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{
            width: `${((session.currentQuestionIndex + 1) / session.questions.length) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}
