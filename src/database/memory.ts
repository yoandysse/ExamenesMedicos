import { Question, QuestionImport } from '@/types';

// Base de datos en memoria para desarrollo/pruebas
let memoryDatabase: Question[] = [
  {
    id: 1,
    question: "La competencia que el actual Estatuto de Autonomía de Andalucía reconoce a nuestra Comunidad Autónoma en materia de sanidad interior está calificada en dicho Estatuto como:",
    options: [
      "Compartida",
      "Delegada",
      "Autónoma",
      "Exclusiva"
    ],
    correctAnswer: 0,
    source: "2015 ANDALUCÍA COT -- Acceso Libre (Teórico+Práctico+Reserva)",
    category: "Legislación Sanitaria",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    question: "El IV Plan Andaluz de Salud afronta seis \"compromisos\". Entre ellos no se encuentra el compromiso de:",
    options: [
      "Reducir las desigualdades sociales en salud",
      "Aumentar la esperanza de vida en buena salud",
      "Fomentar la gestión del conocimiento e incorporación de tecnologías con criterios de sostenibilidad para mejorar la salud de la población",
      "Fomentar la gestión del conocimiento e incorporación de tecnologías con criterios de eficiencia para mejorar la rentabilidad de los recursos en salud"
    ],
    correctAnswer: 3,
    source: "2015 ANDALUCÍA COT -- Acceso Libre (Teórico+Práctico+Reserva)",
    category: "Planificación Sanitaria",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 3,
    question: "El Estatuto Marco del personal estatutario tipifica \"La grave agresión a cualquier persona con la que se relacionen en el ejercicio de sus funciones\" como una falta:",
    options: [
      "No existe tipificación en dichos términos",
      "Falta leve",
      "Falta grave",
      "Falta muy grave"
    ],
    correctAnswer: 3,
    source: "2015 ANDALUCÍA COT -- Acceso Libre (Teórico+Práctico+Reserva)",
    category: "Estatuto Marco",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 4,
    question: "Cuál de los siguientes factores no influye en el proceso de cicatrización de las heridas:",
    options: [
      "Tensión en los bordes de la herida",
      "Niveles de vitamina C",
      "Irrigación sanguínea",
      "Niveles de vitamina B12"
    ],
    correctAnswer: 3,
    source: "2015 ANDALUCÍA COT -- Acceso Libre (Teórico+Práctico+Reserva)",
    category: "Cicatrización",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

let nextId = 5;

// Funciones para gestión de preguntas (versión en memoria)
export const questionDB = {
  // Obtener todas las preguntas
  getAll: (): Question[] => {
    return [...memoryDatabase].sort((a, b) => b.id - a.id);
  },

  // Obtener pregunta por ID
  getById: (id: number): Question | undefined => {
    return memoryDatabase.find(q => q.id === id);
  },

  // Obtener preguntas aleatorias
  getRandom: (count: number): Question[] => {
    const shuffled = [...memoryDatabase].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, shuffled.length));
  },

  // Crear nueva pregunta
  create: (question: QuestionImport): number => {
    const newQuestion: Question = {
      id: nextId++,
      ...question,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    memoryDatabase.push(newQuestion);
    return newQuestion.id;
  },

  // Actualizar pregunta
  update: (id: number, questionData: QuestionImport): void => {
    const index = memoryDatabase.findIndex(q => q.id === id);
    if (index !== -1) {
      memoryDatabase[index] = {
        ...memoryDatabase[index],
        ...questionData,
        updatedAt: new Date().toISOString()
      };
    }
  },

  // Eliminar pregunta
  delete: (id: number): void => {
    memoryDatabase = memoryDatabase.filter(q => q.id !== id);
  },

  // Obtener preguntas por categoría
  getByCategory: (category: string): Question[] => {
    return memoryDatabase.filter(q => q.category === category).sort((a, b) => b.id - a.id);
  },

  // Obtener todas las categorías
  getCategories: (): string[] => {
    const categories = [...new Set(memoryDatabase.map(q => q.category))];
    return categories.sort();
  },

  // Buscar preguntas
  search: (searchTerm: string): Question[] => {
    const term = searchTerm.toLowerCase();
    return memoryDatabase.filter(q =>
      q.question.toLowerCase().includes(term) ||
      q.source.toLowerCase().includes(term) ||
      q.category.toLowerCase().includes(term)
    ).sort((a, b) => b.id - a.id);
  },

  // Importar preguntas en lote
  importBatch: (questions: QuestionImport[]): number => {
    let count = 0;
    for (const questionData of questions) {
      const newQuestion: Question = {
        id: nextId++,
        ...questionData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      memoryDatabase.push(newQuestion);
      count++;
    }
    return count;
  }
};

// Funciones para resultados de exámenes (versión simplificada)
export const examResultsDB = {
  save: (result: any): void => {
    // Por ahora solo guardamos en localStorage
    const results = JSON.parse(localStorage.getItem('examResults') || '[]');
    results.push(result);
    localStorage.setItem('examResults', JSON.stringify(results));
  },

  getAll: () => {
    return JSON.parse(localStorage.getItem('examResults') || '[]');
  },

  getStats: () => {
    const results = JSON.parse(localStorage.getItem('examResults') || '[]');
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
      averageScore: results.reduce((acc: number, r: any) => acc + r.percentage, 0) / results.length,
      bestScore: Math.max(...results.map((r: any) => r.percentage)),
      lastExamDate: results[results.length - 1].completedAt
    };
  }
};

export default { questionDB, examResultsDB };
