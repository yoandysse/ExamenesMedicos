// Script para migrar las preguntas existentes de questions-data.js a SQLite
import { questionDB } from './src/database/index.js';

// Importar las preguntas del archivo original
const questionsDatabase = [
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
        category: "Legislación Sanitaria"
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
        category: "Planificación Sanitaria"
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
        category: "Estatuto Marco"
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
        category: "Cicatrización"
    }
    // Agrega aquí todas las preguntas de tu archivo original
];

// Función para migrar las preguntas
function migrateQuestions() {
    try {
        console.log('Iniciando migración de preguntas...');

        // Limpiar datos existentes si es necesario
        // questionDB.deleteAll(); // Solo si quieres empezar desde cero

        // Convertir formato y migrar
        const questionsToImport = questionsDatabase.map(q => ({
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            source: q.source,
            category: q.category
        }));

        const imported = questionDB.importBatch(questionsToImport);
        console.log(`✅ Se migraron ${imported} preguntas exitosamente`);

        // Verificar migración
        const totalQuestions = questionDB.getAll().length;
        console.log(`📊 Total de preguntas en la base de datos: ${totalQuestions}`);

        const categories = questionDB.getCategories();
        console.log(`📁 Categorías encontradas: ${categories.join(', ')}`);

    } catch (error) {
        console.error('❌ Error durante la migración:', error);
    }
}

// Ejecutar migración si el script se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    migrateQuestions();
}

export { migrateQuestions };
