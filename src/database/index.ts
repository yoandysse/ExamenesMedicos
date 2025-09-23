import Database from 'better-sqlite3';
import { Question, QuestionImport } from '@/types';

const db = new Database('exam-platform.db');

// Define database row interface
interface QuestionRow {
  id: number;
  question: string;
  options: string;
  correctAnswer: number;
  source: string;
  category: string;
  createdAt?: string;
  updatedAt?: string;
}

// Crear tabla de preguntas
db.exec(`
  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT NOT NULL,
    options TEXT NOT NULL,
    correctAnswer INTEGER NOT NULL,
    source TEXT NOT NULL,
    category TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Crear tabla de resultados de exámenes
db.exec(`
  CREATE TABLE IF NOT EXISTS exam_results (
    id TEXT PRIMARY KEY,
    sessionId TEXT NOT NULL,
    score INTEGER NOT NULL,
    percentage REAL NOT NULL,
    totalQuestions INTEGER NOT NULL,
    correctAnswers INTEGER NOT NULL,
    totalTimeMinutes INTEGER NOT NULL,
    completedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Funciones para gestión de preguntas
export const questionDB = {
  // Obtener todas las preguntas
  getAll: (): Question[] => {
    const stmt = db.prepare('SELECT * FROM questions ORDER BY id DESC');
    const rows = stmt.all() as QuestionRow[];
    return rows.map(row => ({
      ...row,
      options: JSON.parse(row.options)
    })) as Question[];
  },

  // Obtener pregunta por ID
  getById: (id: number): Question | undefined => {
    const stmt = db.prepare('SELECT * FROM questions WHERE id = ?');
    const row = stmt.get(id) as QuestionRow | undefined;
    if (!row) return undefined;
    return {
      ...row,
      options: JSON.parse(row.options)
    } as Question;
  },

  // Obtener preguntas aleatorias
  getRandom: (count: number): Question[] => {
    const stmt = db.prepare('SELECT * FROM questions ORDER BY RANDOM() LIMIT ?');
    const rows = stmt.all(count) as QuestionRow[];
    return rows.map(row => ({
      ...row,
      options: JSON.parse(row.options)
    })) as Question[];
  },

  // Crear nueva pregunta
  create: (question: QuestionImport): number => {
    const stmt = db.prepare(`
      INSERT INTO questions (question, options, correctAnswer, source, category)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      question.question,
      JSON.stringify(question.options),
      question.correctAnswer,
      question.source,
      question.category
    );
    return result.lastInsertRowid as number;
  },

  // Actualizar pregunta
  update: (id: number, question: QuestionImport): void => {
    const stmt = db.prepare(`
      UPDATE questions 
      SET question = ?, options = ?, correctAnswer = ?, source = ?, category = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(
      question.question,
      JSON.stringify(question.options),
      question.correctAnswer,
      question.source,
      question.category,
      id
    );
  },

  // Eliminar pregunta
  delete: (id: number): void => {
    const stmt = db.prepare('DELETE FROM questions WHERE id = ?');
    stmt.run(id);
  },

  // Obtener preguntas por categoría
  getByCategory: (category: string): Question[] => {
    const stmt = db.prepare('SELECT * FROM questions WHERE category = ? ORDER BY id DESC');
    const rows = stmt.all(category) as QuestionRow[];
    return rows.map(row => ({
      ...row,
      options: JSON.parse(row.options)
    })) as Question[];
  },

  // Obtener todas las categorías
  getCategories: (): string[] => {
    const stmt = db.prepare('SELECT DISTINCT category FROM questions ORDER BY category');
    const rows = stmt.all() as { category: string }[];
    return rows.map(row => row.category);
  },

  // Buscar preguntas
  search: (searchTerm: string): Question[] => {
    const stmt = db.prepare(`
      SELECT * FROM questions 
      WHERE question LIKE ? OR source LIKE ? OR category LIKE ?
      ORDER BY id DESC
    `);
    const term = `%${searchTerm}%`;
    const rows = stmt.all(term, term, term) as QuestionRow[];
    return rows.map(row => ({
      ...row,
      options: JSON.parse(row.options)
    })) as Question[];
  },

  // Importar preguntas en lote
  importBatch: (questions: QuestionImport[]): number => {
    const stmt = db.prepare(`
      INSERT INTO questions (question, options, correctAnswer, source, category)
      VALUES (?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((questions: QuestionImport[]) => {
      let count = 0;
      for (const question of questions) {
        stmt.run(
          question.question,
          JSON.stringify(question.options),
          question.correctAnswer,
          question.source,
          question.category
        );
        count++;
      }
      return count;
    });

    return insertMany(questions);
  }
};

// Funciones para resultados de exámenes
export const examResultsDB = {
  // Guardar resultado de examen
  save: (result: any): void => {
    const stmt = db.prepare(`
      INSERT INTO exam_results (id, sessionId, score, percentage, totalQuestions, correctAnswers, totalTimeMinutes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      result.id,
      result.sessionId,
      result.score,
      result.percentage,
      result.totalQuestions,
      result.correctAnswers,
      result.totalTimeMinutes
    );
  },

  // Obtener todos los resultados
  getAll: () => {
    const stmt = db.prepare('SELECT * FROM exam_results ORDER BY completedAt DESC');
    return stmt.all();
  },

  // Obtener estadísticas del usuario
  getStats: () => {
    const stmt = db.prepare(`
      SELECT 
        COUNT(*) as totalExams,
        AVG(percentage) as averageScore,
        MAX(percentage) as bestScore,
        MAX(completedAt) as lastExamDate
      FROM exam_results
    `);
    return stmt.get();
  }
};

export default db;
