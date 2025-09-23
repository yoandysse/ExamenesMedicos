import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { questionDB } from '@/database/memory';
import { Play, Users, BookOpen, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function MainMenu() {
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const questions = questionDB.getAll();
      setTotalQuestions(questions.length);
      setCategories(questionDB.getCategories());
    } catch (error) {
      console.error('Error loading questions:', error);
    }
  }, []);

  const startExam = () => {
    navigate('/exam');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Plataforma de Exámenes de Trauma
        </h1>
        <p className="text-xl text-muted-foreground">
          Prepárate para tus exámenes con nuestro banco de preguntas especializado
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Preguntas
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuestions}</div>
            <p className="text-xs text-muted-foreground">
              Preguntas disponibles en el banco
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Categorías
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">
              Diferentes áreas temáticas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Modalidad
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">COT</div>
            <p className="text-xs text-muted-foreground">
              Cirugía Ortopédica y Traumatología
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Comenzar Examen</CardTitle>
          <CardDescription>
            Inicia una sesión de práctica con preguntas aleatorias del banco
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Categorías disponibles:</h4>
              <div className="space-y-1">
                {categories.slice(0, 5).map((category, index) => (
                  <div key={index} className="text-sm text-muted-foreground">
                    • {category}
                  </div>
                ))}
                {categories.length > 5 && (
                  <div className="text-sm text-muted-foreground">
                    ... y {categories.length - 5} más
                  </div>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Características del examen:</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div>• Preguntas de opción múltiple</div>
                <div>• Resultados inmediatos</div>
                <div>• Explicaciones detalladas</div>
                <div>• Historial de puntuaciones</div>
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <Button
              onClick={startExam}
              size="lg"
              className="w-full md:w-auto"
              disabled={totalQuestions === 0}
            >
              <Play className="mr-2 h-4 w-4" />
              Comenzar Examen
            </Button>
          </div>

          {totalQuestions === 0 && (
            <p className="text-center text-sm text-muted-foreground">
              No hay preguntas disponibles. Ve a la sección de administración para agregar preguntas.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
