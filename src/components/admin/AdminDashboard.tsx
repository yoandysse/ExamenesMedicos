import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { questionDB, isUsingSupabase } from '@/database/config';
import { BarChart3, Database, Upload, Plus, Search, Loader2, AlertCircle, Cloud, HardDrive, ArrowLeftRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalQuestions: 0,
    categories: 0,
    recentlyAdded: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const questions = await questionDB.getAll();
      const categories = await questionDB.getCategories();

      // Calcular preguntas agregadas en los últimos 7 días
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      const recentlyAdded = questions.filter(q =>
        q.createdAt && new Date(q.createdAt) > lastWeek
      ).length;

      setStats({
        totalQuestions: questions.length,
        categories: categories.length,
        recentlyAdded
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      setError('Error al cargar las estadísticas');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Panel de Administración
        </h1>
        <p className="text-lg text-muted-foreground">
          Gestiona el banco de preguntas y configura la plataforma
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          {isUsingSupabase ? (
            <><Cloud className="h-4 w-4" /> Usando Supabase</>
          ) : (
            <><HardDrive className="h-4 w-4" /> Usando localStorage</>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={loadStats} className="ml-auto">
            Reintentar
          </Button>
        </div>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Preguntas
            </CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Cargando...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.totalQuestions}</div>
                <p className="text-xs text-muted-foreground">
                  Preguntas en el banco
                </p>
              </>
            )}
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
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Cargando...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.categories}</div>
                <p className="text-xs text-muted-foreground">
                  Áreas temáticas diferentes
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Agregadas Recientemente
            </CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Cargando...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.recentlyAdded}</div>
                <p className="text-xs text-muted-foreground">
                  Últimos 7 días
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Acciones principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Gestionar Preguntas</span>
            </CardTitle>
            <CardDescription>
              Ver, editar, eliminar y crear preguntas del banco
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => navigate('/admin/questions')}
              className="w-full"
            >
              Abrir Gestor de Preguntas
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Importar/Exportar</span>
            </CardTitle>
            <CardDescription>
              Importar y exportar preguntas en formato JSON
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full mb-2"
              onClick={() => navigate('/admin/questions')}
            >
              <Upload className="mr-2 h-4 w-4" />
              Ir a Importar/Exportar
            </Button>
            <p className="text-xs text-muted-foreground">
              Funciones completas disponibles en el gestor
            </p>
          </CardContent>
        </Card>

        {isUsingSupabase && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ArrowLeftRight className="h-5 w-5" />
                <span>Migración</span>
              </CardTitle>
              <CardDescription>
                Transferir datos de localStorage a Supabase
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/admin/migration')}
              >
                <ArrowLeftRight className="mr-2 h-4 w-4" />
                Abrir Panel de Migración
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Información del formato */}
      <Card>
        <CardHeader>
          <CardTitle>Formato de Importación Detallado</CardTitle>
          <CardDescription>
            Guía completa para importar preguntas correctamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Campos requeridos:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li><strong>question:</strong> Texto de la pregunta (string)</li>
                <li><strong>options:</strong> Array con las opciones de respuesta</li>
                <li><strong>correctAnswer:</strong> Índice de la respuesta correcta (0-3)</li>
                <li><strong>source:</strong> Fuente o examen de origen</li>
                <li><strong>category:</strong> Categoría temática</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Validaciones:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Las opciones deben ser exactamente 4</li>
                <li>• correctAnswer debe estar entre 0 y 3</li>
                <li>• Todos los campos son obligatorios</li>
                <li>• El archivo debe ser JSON válido</li>
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-md">
            <h4 className="font-medium text-blue-900 mb-2">💡 Tip para migrar datos existentes:</h4>
            <p className="text-sm text-blue-800">
              Puedes exportar tus preguntas actuales desde <code>questions-data.js</code> y
              convertirlas al formato JSON requerido para la importación masiva.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
