// Base de datos de preguntas COT
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
        source: "2023 CASTILLA-LA MANCHA FEA COT",
        category: "Cirugía General"
    },
    {
        id: 5,
        question: "Al realizar el desbridamiento quirúrgico de una herida infectada qué no debe hacer:",
        options: [
            "Irrigación abundante con suero salino",
            "Extirpar esfacelos, tejido necrótico y cuerpos extraños",
            "Desbridamiento enzimático",
            "Cierre primario inmediato hermético"
        ],
        correctAnswer: 3,
        source: "2023 CASTILLA-LA MANCHA FEA COT",
        category: "Cirugía General"
    },
    {
        id: 6,
        question: "La fractura más frecuente del escafoides carpiano es:",
        options: [
            "Del polo proximal",
            "Del tercio medio o cintura",
            "Del polo distal",
            "Todas son igual de frecuentes"
        ],
        correctAnswer: 1,
        source: "2024 EXTREMADURA COT",
        category: "Traumatología"
    },
    {
        id: 7,
        question: "En las fracturas de cadera, la clasificación de Garden se utiliza para:",
        options: [
            "Fracturas pertrocantéreas",
            "Fracturas subtrocantéreas",
            "Fracturas del cuello femoral",
            "Fracturas de acetábulo"
        ],
        correctAnswer: 2,
        source: "2024 EXTREMADURA COT",
        category: "Traumatología"
    },
    {
        id: 8,
        question: "El signo de Trendelenburg positivo indica:",
        options: [
            "Lesión del nervio ciático",
            "Insuficiencia de los músculos abductores de cadera",
            "Luxación congénita de cadera",
            "Fractura de pelvis"
        ],
        correctAnswer: 1,
        source: "2023 CASTILLA-LA MANCHA FEA COT",
        category: "Exploración Clínica"
    },
    {
        id: 9,
        question: "La maniobra de McMurray se utiliza para diagnosticar:",
        options: [
            "Lesiones ligamentosas de rodilla",
            "Lesiones meniscales",
            "Fracturas de rótula",
            "Bursitis rotuliana"
        ],
        correctAnswer: 1,
        source: "2024 EXTREMADURA COT",
        category: "Exploración Clínica"
    },
    {
        id: 10,
        question: "En el síndrome del túnel carpiano, el nervio afectado es:",
        options: [
            "Nervio radial",
            "Nervio cubital",
            "Nervio mediano",
            "Nervio interóseo anterior"
        ],
        correctAnswer: 2,
        source: "2023 CASTILLA-LA MANCHA FEA COT",
        category: "Neuropatías"
    },
    {
        id: 11,
        question: "La clasificación de Salter-Harris se utiliza para:",
        options: [
            "Fracturas de columna vertebral",
            "Fracturas de fisis en niños",
            "Luxaciones de hombro",
            "Fracturas de pelvis"
        ],
        correctAnswer: 1,
        source: "2024 EXTREMADURA COT",
        category: "Traumatología Pediátrica"
    },
    {
        id: 12,
        question: "El músculo supraespinoso está inervado por:",
        options: [
            "Nervio axilar",
            "Nervio supraescapular",
            "Nervio torácico largo",
            "Nervio accesorio"
        ],
        correctAnswer: 1,
        source: "2023 CASTILLA-LA MANCHA FEA COT",
        category: "Anatomía"
    },
    {
        id: 13,
        question: "En una fractura de Colles, el fragmento distal se desplaza:",
        options: [
            "En flexión dorsal y desviación radial",
            "En flexión palmar y desviación cubital",
            "En flexión dorsal y desviación cubital",
            "En flexión palmar y desviación radial"
        ],
        correctAnswer: 0,
        source: "2024 EXTREMADURA COT",
        category: "Traumatología"
    },
    {
        id: 14,
        question: "El tratamiento de elección para una fractura de clavícula en el tercio medio sin desplazamiento es:",
        options: [
            "Osteosíntesis con placa",
            "Enclavado endomedular",
            "Tratamiento conservador con cabestrillo",
            "Fijación externa"
        ],
        correctAnswer: 2,
        source: "2023 CASTILLA-LA MANCHA FEA COT",
        category: "Tratamiento"
    },
    {
        id: 15,
        question: "La pseudoartrosis más frecuente en miembro superior se localiza en:",
        options: [
            "Húmero proximal",
            "Escafoides carpiano",
            "Radio distal",
            "Clavícula"
        ],
        correctAnswer: 1,
        source: "2024 EXTREMADURA COT",
        category: "Complicaciones"
    },
    {
        id: 16,
        question: "El signo radiológico de Shenton se altera en:",
        options: [
            "Fracturas de acetábulo",
            "Luxaciones de cadera",
            "Fracturas de fémur proximal",
            "Todas las anteriores"
        ],
        correctAnswer: 3,
        source: "2023 CASTILLA-LA MANCHA FEA COT",
        category: "Radiología"
    },
    {
        id: 17,
        question: "La enfermedad de Perthes afecta principalmente a:",
        options: [
            "Niños de 4-8 años",
            "Adolescentes de 12-16 años",
            "Adultos jóvenes",
            "Ancianos"
        ],
        correctAnswer: 0,
        source: "2024 EXTREMADURA COT",
        category: "Ortopedia Infantil"
    },
    {
        id: 18,
        question: "El músculo que realiza la flexión dorsal del pie es:",
        options: [
            "Tibial posterior",
            "Tibial anterior",
            "Gastrocnemio",
            "Peroneo largo"
        ],
        correctAnswer: 1,
        source: "2023 CASTILLA-LA MANCHA FEA COT",
        category: "Anatomía"
    },
    {
        id: 19,
        question: "En la luxación posterior de hombro, el signo radiológico característico es:",
        options: [
            "Signo de la bombilla",
            "Signo de Hill-Sachs",
            "Signo de Bankart",
            "Signo del doble contorno"
        ],
        correctAnswer: 0,
        source: "2024 EXTREMADURA COT",
        category: "Radiología"
    },
    {
        id: 20,
        question: "La complicación más temida de una fractura supracondílea de húmero en niños es:",
        options: [
            "Pseudoartrosis",
            "Síndrome compartimental",
            "Lesión del nervio radial",
            "Rigidez articular"
        ],
        correctAnswer: 1,
        source: "2023 CASTILLA-LA MANCHA FEA COT",
        category: "Complicaciones"
    }
];

// Función para generar más preguntas de manera aleatoria para completar el examen
function generateAdditionalQuestions(baseQuestions, targetCount) {
    const additionalQuestions = [];
    let idCounter = baseQuestions.length + 1;

    const questionTemplates = [
        {
            question: "En el tratamiento de las fracturas de {bone}, el abordaje quirúrgico más utilizado es:",
            options: ["Anterior", "Posterior", "Lateral", "Medial"],
            correctAnswer: Math.floor(Math.random() * 4),
            category: "Cirugía"
        },
        {
            question: "La clasificación de {classification} se utiliza para evaluar:",
            options: ["Grado de lesión", "Pronóstico funcional", "Indicación quirúrgica", "Todas las anteriores"],
            correctAnswer: 3,
            category: "Clasificaciones"
        },
        {
            question: "El músculo {muscle} está inervado por el nervio:",
            options: ["Radial", "Mediano", "Cubital", "Axilar"],
            correctAnswer: Math.floor(Math.random() * 4),
            category: "Anatomía"
        }
    ];

    const bones = ["fémur", "tibia", "húmero", "radio", "cúbito", "peroné"];
    const classifications = ["AO", "Weber", "Denis", "Lauge-Hansen"];
    const muscles = ["bíceps", "tríceps", "deltoides", "supraespinoso"];

    while (additionalQuestions.length < (targetCount - baseQuestions.length)) {
        const template = questionTemplates[Math.floor(Math.random() * questionTemplates.length)];
        let question = template.question;

        if (question.includes("{bone}")) {
            question = question.replace("{bone}", bones[Math.floor(Math.random() * bones.length)]);
        }
        if (question.includes("{classification}")) {
            question = question.replace("{classification}", classifications[Math.floor(Math.random() * classifications.length)]);
        }
        if (question.includes("{muscle}")) {
            question = question.replace("{muscle}", muscles[Math.floor(Math.random() * muscles.length)]);
        }

        additionalQuestions.push({
            id: idCounter++,
            question: question,
            options: [...template.options],
            correctAnswer: template.correctAnswer,
            source: "Banco de preguntas generadas",
            category: template.category
        });
    }

    return additionalQuestions;
}

// Función para obtener preguntas aleatorias
function getRandomQuestions(count) {
    const allQuestions = [...questionsDatabase];

    // Si necesitamos más preguntas de las que tenemos, generamos adicionales
    if (count > allQuestions.length) {
        const additional = generateAdditionalQuestions(allQuestions, count);
        allQuestions.push(...additional);
    }

    // Mezclamos y tomamos las primeras 'count' preguntas
    const shuffled = allQuestions.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

// Función para obtener preguntas por categoría
function getQuestionsByCategory(category) {
    return questionsDatabase.filter(q => q.category === category);
}

// Función para obtener todas las categorías disponibles
function getAvailableCategories() {
    const categories = [...new Set(questionsDatabase.map(q => q.category))];
    return categories.sort();
}
