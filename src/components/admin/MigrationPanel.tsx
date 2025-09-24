import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Database, Upload, CheckCircle, XCircle, Loader2, AlertTriangle, HardDrive, Cloud } from 'lucide-react';
import { 
  migrateAllDataToSupabase, 
  hasLocalDataToMigrate, 
  clearLocalDataAfterMigration,
  type MigrationResult 
} from '@/utils/migration';
import { isUsingSupabase } from '@/database/config';

export function MigrationPanel() {
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);
  const [localDataStatus, setLocalDataStatus] = useState(hasLocalDataToMigrate());

  const handleMigration = async () => {
    setIsMigrating(true);
    setMigrationResult(null);

    try {
      const result = await migrateAllDataToSupabase();
      setMigrationResult(result);
      
      // Actualizar el estado de datos locales después de la migración
      setLocalDataStatus(hasLocalDataToMigrate());
      
      // Si la migración fue exitosa, preguntar si quiere limpiar los datos locales
      if (result.success && (result.questionsCount > 0 || result.examResultsCount > 0)) {
        const shouldClearLocal = window.confirm(
          'Migración completada exitosamente. ¿Deseas limpiar los datos locales ahora que están en Supabase?'
        );
        
        if (shouldClearLocal) {
          clearLocalDataAfterMigration();
          setLocalDataStatus({ hasQuestions: false, hasExamResults: false });
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setMigrationResult({
        success: false,
        questionsCount: 0,
        examResultsCount: 0,
        errors: [errorMessage]
      });
    } finally {
      setIsMigrating(false);
    }
  };

  const handleClearLocalData = () => {
    const confirm = window.confirm(
      '¿Estás seguro de que deseas eliminar todos los datos locales? Esta acción no se puede deshacer.'
    );
    
    if (confirm) {
      clearLocalDataAfterMigration();
      setLocalDataStatus({ hasQuestions: false, hasExamResults: false });
    }
  };

  if (!isUsingSupabase) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <AlertTriangle className="h-5 w-5" />
            Migración no disponible
          </CardTitle>
          <CardDescription className="text-amber-700">
            La migración solo está disponible cuando se usa Supabase como base de datos.
            Actualmente estás usando localStorage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-amber-700">
            <HardDrive className="h-4 w-4" />
            <span>Configuración actual: localStorage</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasDataToMigrate = localDataStatus.hasQuestions || localDataStatus.hasExamResults;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Migración de Datos a Supabase
          </CardTitle>
          <CardDescription>
            Transfiere tus datos locales (localStorage) a la base de datos de Supabase
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Cloud className="h-4 w-4" />
            <span>Configuración actual: Supabase</span>
          </div>

          {/* Estado de datos locales */}
          <div className="bg-blue-50 p-4 rounded-lg space-y-2">
            <h4 className="font-medium text-blue-900">Estado de datos locales:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                {localDataStatus.hasQuestions ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-gray-400" />
                )}
                <span>Preguntas en localStorage</span>
              </div>
              <div className="flex items-center gap-2">
                {localDataStatus.hasExamResults ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-gray-400" />
                )}
                <span>Resultados de exámenes</span>
              </div>
            </div>
          </div>

          {/* Botón de migración */}
          <div className="flex gap-2">
            <Button
              onClick={handleMigration}
              disabled={isMigrating || !hasDataToMigrate}
              className="flex-1"
            >
              {isMigrating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Migrando datos...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  {hasDataToMigrate ? 'Migrar Datos' : 'No hay datos para migrar'}
                </>
              )}
            </Button>
            
            {hasDataToMigrate && (
              <Button
                variant="outline"
                onClick={handleClearLocalData}
                disabled={isMigrating}
              >
                Limpiar datos locales
              </Button>
            )}
          </div>

          {!hasDataToMigrate && (
            <p className="text-sm text-muted-foreground">
              No se encontraron datos en localStorage para migrar.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Resultado de migración */}
      {migrationResult && (
        <Card className={migrationResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${migrationResult.success ? 'text-green-800' : 'text-red-800'}`}>
              {migrationResult.success ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
              Resultado de la migración
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Preguntas migradas:</span>
                <span className="ml-2">{migrationResult.questionsCount}</span>
              </div>
              <div>
                <span className="font-medium">Resultados migrados:</span>
                <span className="ml-2">{migrationResult.examResultsCount}</span>
              </div>
            </div>

            {migrationResult.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-red-800">Errores encontrados:</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {migrationResult.errors.map((error, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-red-500">•</span>
                      <span>{error}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {migrationResult.success && migrationResult.questionsCount === 0 && migrationResult.examResultsCount === 0 && (
              <p className="text-sm text-green-700">
                No había datos para migrar, pero la conexión con Supabase funciona correctamente.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Información adicional */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">ℹ️ Información importante</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-800">
          <p>• La migración copia los datos de localStorage a Supabase sin eliminar los originales.</p>
          <p>• Después de una migración exitosa, puedes limpiar los datos locales manualmente.</p>
          <p>• Los datos migrados mantendrán su estructura y metadatos originales.</p>
          <p>• Si hay errores, se mostrarán detalles específicos para resolverlos.</p>
        </CardContent>
      </Card>
    </div>
  );
}