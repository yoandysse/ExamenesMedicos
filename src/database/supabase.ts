import { supabase, TABLES } from '@/lib/supabase';
import { Question, QuestionImport } from '@/types';

// Interfaces para Supabase (campos con snake_case)
interface SupabaseQuestion {
  id: number;
  question: string;
  options: string[];
  correct_answer: number;
  source: string;
  category: string;
  created_at: string;
  updated_at: string;
}

interface SupabaseExamResult {
  id: string;
  session_id: string;
  score: number;
  percentage: number;
  total_questions: number;
  correct_answers: number;
  total_time_minutes: number;
  completed_at: string;
}

// Convertir de formato Supabase a formato de la aplicación
const convertSupabaseToQuestion = (supabaseQuestion: SupabaseQuestion): Question => ({
  id: supabaseQuestion.id,
  question: supabaseQuestion.question,
  options: supabaseQuestion.options,
  correctAnswer: supabaseQuestion.correct_answer,
  source: supabaseQuestion.source,
  category: supabaseQuestion.category,
  createdAt: supabaseQuestion.created_at,
  updatedAt: supabaseQuestion.updated_at,
});

// Convertir de formato de la aplicación a formato Supabase
const convertQuestionToSupabase = (question: QuestionImport) => ({
  question: question.question,
  options: question.options,
  correct_answer: question.correctAnswer,
  source: question.source,
  category: question.category,
});

// Funciones para gestión de preguntas (versión Supabase)
export const questionDB = {
  // Obtener todas las preguntas
  getAll: async (): Promise<Question[]> => {
    const { data, error } = await supabase
      .from(TABLES.questions)
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error('Error fetching all questions:', error);
      throw new Error('Error al cargar las preguntas');
    }

    return data.map(convertSupabaseToQuestion);
  },

  // Obtener pregunta por ID
  getById: async (id: number): Promise<Question | undefined> => {
    const { data, error } = await supabase
      .from(TABLES.questions)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return undefined; // No encontrado
      }
      console.error('Error fetching question by ID:', error);
      throw new Error('Error al cargar la pregunta');
    }

    return convertSupabaseToQuestion(data);
  },

  // Obtener preguntas aleatorias
  getRandom: async (count: number): Promise<Question[]> => {
    // Primero obtener el conteo total
    const { count: totalCount, error: countError } = await supabase
      .from(TABLES.questions)
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error getting question count:', countError);
      throw new Error('Error al contar las preguntas');
    }

    if (!totalCount || totalCount === 0) {
      return [];
    }

    // Usar función SQL para obtener preguntas aleatorias
    const { data, error } = await supabase
      .rpc('get_random_questions', { question_count: Math.min(count, totalCount) });

    if (error) {
      console.error('Error fetching random questions:', error);
      // Fallback: obtener todas y hacer random del lado del cliente
      const { data: allData, error: fallbackError } = await supabase
        .from(TABLES.questions)
        .select('*');
      
      if (fallbackError) {
        throw new Error('Error al cargar las preguntas aleatorias');
      }
      
      const shuffled = allData.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, Math.min(count, shuffled.length)).map(convertSupabaseToQuestion);
    }

    return data.map(convertSupabaseToQuestion);
  },

  // Crear nueva pregunta
  create: async (question: QuestionImport): Promise<number> => {
    const supabaseQuestion = convertQuestionToSupabase(question);
    
    const { data, error } = await supabase
      .from(TABLES.questions)
      .insert(supabaseQuestion)
      .select('id')
      .single();

    if (error) {
      console.error('Error creating question:', error);
      throw new Error('Error al crear la pregunta');
    }

    return data.id;
  },

  // Actualizar pregunta
  update: async (id: number, question: QuestionImport): Promise<void> => {
    const supabaseQuestion = convertQuestionToSupabase(question);
    
    const { error } = await supabase
      .from(TABLES.questions)
      .update(supabaseQuestion)
      .eq('id', id);

    if (error) {
      console.error('Error updating question:', error);
      throw new Error('Error al actualizar la pregunta');
    }
  },

  // Eliminar pregunta
  delete: async (id: number): Promise<void> => {
    const { error } = await supabase
      .from(TABLES.questions)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting question:', error);
      throw new Error('Error al eliminar la pregunta');
    }
  },

  // Obtener preguntas por categoría
  getByCategory: async (category: string): Promise<Question[]> => {
    const { data, error } = await supabase
      .from(TABLES.questions)
      .select('*')
      .eq('category', category)
      .order('id', { ascending: false });

    if (error) {
      console.error('Error fetching questions by category:', error);
      throw new Error('Error al cargar las preguntas por categoría');
    }

    return data.map(convertSupabaseToQuestion);
  },

  // Obtener todas las categorías
  getCategories: async (): Promise<string[]> => {
    const { data, error } = await supabase
      .from(TABLES.questions)
      .select('category')
      .order('category');

    if (error) {
      console.error('Error fetching categories:', error);
      throw new Error('Error al cargar las categorías');
    }

    // Eliminar duplicados y ordenar
    const uniqueCategories = [...new Set(data.map(item => item.category))];
    return uniqueCategories.sort();
  },

  // Buscar preguntas
  search: async (searchTerm: string): Promise<Question[]> => {
    const { data, error } = await supabase
      .from(TABLES.questions)
      .select('*')
      .or(`question.ilike.%${searchTerm}%,source.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`)
      .order('id', { ascending: false });

    if (error) {
      console.error('Error searching questions:', error);
      throw new Error('Error al buscar preguntas');
    }

    return data.map(convertSupabaseToQuestion);
  },

  // Importar preguntas en lote
  importBatch: async (questions: QuestionImport[]): Promise<number> => {
    const supabaseQuestions = questions.map(convertQuestionToSupabase);
    
    const { data, error } = await supabase
      .from(TABLES.questions)
      .insert(supabaseQuestions)
      .select('id');

    if (error) {
      console.error('Error importing questions batch:', error);
      throw new Error('Error al importar las preguntas');
    }

    return data.length;
  }
};

// Funciones para resultados de exámenes (versión Supabase)
export const examResultsDB = {
  // Guardar resultado de examen
  save: async (result: any): Promise<void> => {
    const supabaseResult = {
      session_id: result.sessionId,
      score: result.score,
      percentage: result.percentage,
      total_questions: result.totalQuestions,
      correct_answers: result.correctAnswers,
      total_time_minutes: result.totalTimeMinutes,
    };

    const { error } = await supabase
      .from(TABLES.examResults)
      .insert(supabaseResult);

    if (error) {
      console.error('Error saving exam result:', error);
      throw new Error('Error al guardar el resultado del examen');
    }
  },

  // Obtener todos los resultados
  getAll: async () => {
    const { data, error } = await supabase
      .from(TABLES.examResults)
      .select('*')
      .order('completed_at', { ascending: false });

    if (error) {
      console.error('Error fetching exam results:', error);
      throw new Error('Error al cargar los resultados');
    }

    // Convertir de snake_case a camelCase
    return data.map((result: SupabaseExamResult) => ({
      id: result.id,
      sessionId: result.session_id,
      score: result.score,
      percentage: result.percentage,
      totalQuestions: result.total_questions,
      correctAnswers: result.correct_answers,
      totalTimeMinutes: result.total_time_minutes,
      completedAt: result.completed_at,
    }));
  },

  // Obtener estadísticas del usuario
  getStats: async () => {
    const { data, error } = await supabase
      .rpc('get_exam_stats');

    if (error) {
      console.error('Error fetching exam stats:', error);
      // Fallback: calcular estadísticas del lado del cliente
      const results = await examResultsDB.getAll();
      
      if (results.length === 0) {
        return {
          totalExams: 0,
          averageScore: 0,
          bestScore: 0,
          lastExamDate: null
        };
      }

      return {
        totalExams: results.length,
        averageScore: results.reduce((acc, r) => acc + r.percentage, 0) / results.length,
        bestScore: Math.max(...results.map(r => r.percentage)),
        lastExamDate: results[0].completedAt
      };
    }

    return {
      totalExams: data.total_exams || 0,
      averageScore: data.average_score || 0,
      bestScore: data.best_score || 0,
      lastExamDate: data.last_exam_date
    };
  }
};

export default { questionDB, examResultsDB };