import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { questionDB } from '@/database/config';
import { Play, Users, BookOpen, BarChart3, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function MainMenu() {
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const questions = await questionDB.getAll();
      const questionCategories = await questionDB.getCategories();
      
      setTotalQuestions(questions.length);
      setCategories(questionCategories);
    } catch (error) {
      console.error('Error loading questions:', error);
      setError('Error al cargar los datos. Por favor, recarga la página.');
    } finally {
      setIsLoading(false);
    }
  };

  const startExam = () => {
    navigate('/exam');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white pb-16">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between py-4 px-6">
          <h1 className="text-3xl font-bold text-blue-900 tracking-tight">Plataforma de Exámenes de Trauma</h1>
          <Button variant="outline" onClick={() => navigate('/admin')} className="gap-2"><Users className="h-5 w-5" /> Administración</Button>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 pt-10 space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold text-blue-800">Prepárate para tus exámenes con nuestro banco de preguntas especializado</h2>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={loadData} className="ml-auto">
              Reintentar
            </Button>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-lg border-blue-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Total de Preguntas</CardTitle>
              <BookOpen className="h-5 w-5 text-blue-400" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm">Cargando...</span>
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-blue-900">{totalQuestions}</div>
                  <p className="text-xs text-blue-500">Preguntas disponibles en el banco</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card className="shadow-lg border-blue-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Categorías</CardTitle>
              <BarChart3 className="h-5 w-5 text-blue-400" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm">Cargando...</span>
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-blue-900">{categories.length}</div>
                  <p className="text-xs text-blue-500">Diferentes áreas temáticas</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card className="shadow-lg border-blue-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Modalidad</CardTitle>
              <Play className="h-5 w-5 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-blue-900">COT</div>
              <p className="text-xs text-blue-500">Cirugía Ortopédica y Traumatología</p>
            </CardContent>
          </Card>
        </div>
        <div className="bg-white rounded-xl shadow-md p-8 mt-8 border border-blue-100">
          <h3 className="text-xl font-bold text-blue-800 mb-2">Comenzar Examen</h3>
          <p className="text-sm text-blue-600 mb-4">Inicia una sesión de práctica con preguntas aleatorias del banco</p>
          <Button 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg px-8 py-3 rounded-full shadow-lg" 
            onClick={startExam}
            disabled={isLoading || error !== null || totalQuestions === 0}
          >
            {isLoading ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Cargando...</>
            ) : (
              <><Play className="mr-2 h-5 w-5" /> Comenzar Examen</>
            )}
          </Button>
          {totalQuestions === 0 && !isLoading && (
            <p className="text-sm text-red-600 mt-2">No hay preguntas disponibles</p>
          )}
        </div>
        <div className="bg-white rounded-xl shadow p-6 border border-blue-50 mt-6">
          <h4 className="text-lg font-semibold text-blue-700 mb-2">Categorías disponibles:</h4>
          <ul className="list-disc pl-6 text-blue-800">
            {categories.map((cat) => (
              <li key={cat}>{cat}</li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
