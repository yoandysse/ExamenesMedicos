// Configuración de base de datos - permite alternar entre localStorage y Supabase
import { questionDB as browserDB, examResultsDB as browserExamDB } from './browser';
import { questionDB as supabaseDB, examResultsDB as supabaseExamDB } from './supabase';

// Variable de configuración - cambiar a true cuando esté listo para usar Supabase
const USE_SUPABASE = true; // Cambiar a true para usar Supabase

// Wrapper para hacer que las funciones síncronas de browser sean async
const wrapSyncToAsync = <T extends (...args: any[]) => any>(syncFn: T): (...args: Parameters<T>) => Promise<ReturnType<T>> => {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      return syncFn(...args);
    } catch (error) {
      throw error;
    }
  };
};

// Browser DB con interfaz async
const asyncBrowserDB = {
  getAll: wrapSyncToAsync(browserDB.getAll),
  getById: wrapSyncToAsync(browserDB.getById),
  getRandom: wrapSyncToAsync(browserDB.getRandom),
  create: wrapSyncToAsync(browserDB.create),
  update: wrapSyncToAsync(browserDB.update),
  delete: wrapSyncToAsync(browserDB.delete),
  getByCategory: wrapSyncToAsync(browserDB.getByCategory),
  getCategories: wrapSyncToAsync(browserDB.getCategories),
  search: wrapSyncToAsync(browserDB.search),
  importBatch: wrapSyncToAsync(browserDB.importBatch),
};

const asyncBrowserExamDB = {
  save: wrapSyncToAsync(browserExamDB.save),
  getAll: wrapSyncToAsync(browserExamDB.getAll),
  getStats: wrapSyncToAsync(browserExamDB.getStats),
};

// Exportar la base de datos configurada
export const questionDB = USE_SUPABASE ? supabaseDB : asyncBrowserDB;
export const examResultsDB = USE_SUPABASE ? supabaseExamDB : asyncBrowserExamDB;

// Exportar la configuración actual
export const isUsingSupabase = USE_SUPABASE;

// Función para verificar el estado de la conexión
export const checkDatabaseConnection = async (): Promise<{ connected: boolean; usingSupabase: boolean; error?: string }> => {
  try {
    if (USE_SUPABASE) {
      await questionDB.getAll();
      return { connected: true, usingSupabase: true };
    } else {
      await questionDB.getAll();
      return { connected: true, usingSupabase: false };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error de conexión desconocido';
    return { 
      connected: false, 
      usingSupabase: USE_SUPABASE, 
      error: errorMessage 
    };
  }
};