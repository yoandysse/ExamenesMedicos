import { questionDB as localQuestionDB, examResultsDB as localExamResultsDB } from '@/database/browser';
import { questionDB as supabaseQuestionDB, examResultsDB as supabaseExamResultsDB } from '@/database/supabase';

export interface MigrationResult {
  success: boolean;
  questionsCount: number;
  examResultsCount: number;
  errors: string[];
}

/**
 * Migra todas las preguntas de localStorage a Supabase
 */
export const migrateQuestionsToSupabase = async (): Promise<{ success: boolean; count: number; errors: string[] }> => {
  const errors: string[] = [];
  let count = 0;

  try {
    // Obtener preguntas de localStorage
    const localQuestions = localQuestionDB.getAll();
    
    if (localQuestions.length === 0) {
      return { success: true, count: 0, errors: [] };
    }

    // Convertir a formato de importación (sin ID, createdAt, updatedAt)
    const questionsToImport = localQuestions.map(q => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      source: q.source,
      category: q.category,
    }));

    // Importar en lote a Supabase
    count = await supabaseQuestionDB.importBatch(questionsToImport);
    
    console.log(`Successfully migrated ${count} questions to Supabase`);
    return { success: true, count, errors: [] };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    errors.push(`Error migrating questions: ${errorMessage}`);
    console.error('Error migrating questions:', error);
    return { success: false, count, errors };
  }
};

/**
 * Migra todos los resultados de exámenes de localStorage a Supabase
 */
export const migrateExamResultsToSupabase = async (): Promise<{ success: boolean; count: number; errors: string[] }> => {
  const errors: string[] = [];
  let count = 0;

  try {
    // Obtener resultados de localStorage
    const localResults = localExamResultsDB.getAll();
    
    if (localResults.length === 0) {
      return { success: true, count: 0, errors: [] };
    }

    // Migrar cada resultado individualmente
    for (const result of localResults) {
      try {
        await supabaseExamResultsDB.save({
          sessionId: result.sessionId || `migrated_${result.id || Date.now()}`,
          score: result.score,
          percentage: result.percentage,
          totalQuestions: result.totalQuestions,
          correctAnswers: result.correctAnswers,
          totalTimeMinutes: result.totalTimeMinutes,
        });
        count++;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        errors.push(`Error migrating result ${result.id}: ${errorMessage}`);
      }
    }
    
    console.log(`Successfully migrated ${count} exam results to Supabase`);
    return { success: count === localResults.length, count, errors };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    errors.push(`Error migrating exam results: ${errorMessage}`);
    console.error('Error migrating exam results:', error);
    return { success: false, count, errors };
  }
};

/**
 * Migración completa de localStorage a Supabase
 */
export const migrateAllDataToSupabase = async (): Promise<MigrationResult> => {
  console.log('Starting migration from localStorage to Supabase...');
  
  const errors: string[] = [];
  
  try {
    // Verificar conexión con Supabase
    await supabaseQuestionDB.getAll();
  
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error de conexión';
    return {
      success: false,
      questionsCount: 0,
      examResultsCount: 0,
      errors: [`Connection error: ${errorMessage}`]
    };
  }

  // Migrar preguntas
  const questionsResult = await migrateQuestionsToSupabase();
  if (questionsResult.errors.length > 0) {
    errors.push(...questionsResult.errors);
  }

  // Migrar resultados de exámenes
  const examResultsResult = await migrateExamResultsToSupabase();
  if (examResultsResult.errors.length > 0) {
    errors.push(...examResultsResult.errors);
  }

  const success = questionsResult.success && examResultsResult.success;
  
  console.log(`Migration completed. Success: ${success}`);
  console.log(`Questions migrated: ${questionsResult.count}`);
  console.log(`Exam results migrated: ${examResultsResult.count}`);
  
  if (errors.length > 0) {
    console.warn('Migration errors:', errors);
  }

  return {
    success,
    questionsCount: questionsResult.count,
    examResultsCount: examResultsResult.count,
    errors,
  };
};

/**
 * Verifica si hay datos en localStorage para migrar
 */
export const hasLocalDataToMigrate = (): { hasQuestions: boolean; hasExamResults: boolean } => {
  try {
    const questions = localQuestionDB.getAll();
    const examResults = localExamResultsDB.getAll();
    
    return {
      hasQuestions: questions.length > 0,
      hasExamResults: examResults.length > 0,
    };
  } catch (error) {
    console.error('Error checking local data:', error);
    return {
      hasQuestions: false,
      hasExamResults: false,
    };
  }
};

/**
 * Limpia los datos de localStorage después de una migración exitosa
 */
export const clearLocalDataAfterMigration = (): void => {
  try {
    localStorage.removeItem('examPlatformQuestions');
    localStorage.removeItem('examResults');
    console.log('Local data cleared after successful migration');
  } catch (error) {
    console.error('Error clearing local data:', error);
  }
};