// Estado global de la aplicación
let currentExam = {
    questions: [],
    currentQuestionIndex: 0,
    userAnswers: [],
    startTime: null,
    endTime: null,
    isFinished: false
};

let examTimer = null;

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', function() {
    showMainMenu();
    loadUserStats();
});

// Navegación entre secciones
function showMainMenu() {
    hideAllSections();
    document.getElementById('main-menu').classList.remove('hidden');
}

function hideAllSections() {
    const sections = ['main-menu', 'exam-section', 'results-section'];
    sections.forEach(section => {
        document.getElementById(section).classList.add('hidden');
    });
}

// Iniciar examen
function startExam(questionCount) {
    // Obtener preguntas aleatorias
    currentExam.questions = getRandomQuestions(questionCount);
    currentExam.currentQuestionIndex = 0;
    currentExam.userAnswers = new Array(questionCount).fill(null);
    currentExam.startTime = new Date();
    currentExam.isFinished = false;

    // Mostrar sección de examen
    hideAllSections();
    document.getElementById('exam-section').classList.remove('hidden');

    // Inicializar interfaz
    setupExamInterface();
    displayQuestion();
    startTimer();
    generateQuestionGrid();
}

function setupExamInterface() {
    const totalQuestions = currentExam.questions.length;
    document.getElementById('question-counter').textContent = `Pregunta 1 de ${totalQuestions}`;

    // Configurar botones
    document.getElementById('prev-btn').disabled = true;
    document.getElementById('next-btn').classList.remove('hidden');
    document.getElementById('finish-btn').classList.add('hidden');
}

// Mostrar pregunta actual
function displayQuestion() {
    const question = currentExam.questions[currentExam.currentQuestionIndex];
    const questionIndex = currentExam.currentQuestionIndex;
    const totalQuestions = currentExam.questions.length;

    // Actualizar contador
    document.getElementById('question-counter').textContent = `Pregunta ${questionIndex + 1} de ${totalQuestions}`;
    document.getElementById('question-number').textContent = questionIndex + 1;
    document.getElementById('question-source').textContent = question.source;
    document.getElementById('question-text').textContent = question.question;

    // Actualizar barra de progreso
    const progress = ((questionIndex + 1) / totalQuestions) * 100;
    document.getElementById('progress-fill').style.width = `${progress}%`;

    // Generar opciones
    generateOptions(question, questionIndex);

    // Actualizar botones de navegación
    updateNavigationButtons();

    // Actualizar grid de navegación
    updateQuestionGrid();
}

function generateOptions(question, questionIndex) {
    const container = document.getElementById('options-container');
    container.innerHTML = '';

    question.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';
        optionDiv.onclick = () => selectOption(questionIndex, index);

        const isSelected = currentExam.userAnswers[questionIndex] === index;
        if (isSelected) {
            optionDiv.classList.add('selected');
        }

        optionDiv.innerHTML = `
            <input type="radio" name="question-${questionIndex}" value="${index}" ${isSelected ? 'checked' : ''}>
            <span class="option-label">${String.fromCharCode(65 + index)})</span>
            <span class="option-text">${option}</span>
        `;

        container.appendChild(optionDiv);
    });
}

function selectOption(questionIndex, optionIndex) {
    currentExam.userAnswers[questionIndex] = optionIndex;

    // Actualizar visualmente las opciones
    const options = document.querySelectorAll('.option');
    options.forEach((option, index) => {
        option.classList.toggle('selected', index === optionIndex);
        const radio = option.querySelector('input[type="radio"]');
        radio.checked = index === optionIndex;
    });

    // Actualizar grid de navegación
    updateQuestionGrid();
}

// Navegación entre preguntas
function nextQuestion() {
    if (currentExam.currentQuestionIndex < currentExam.questions.length - 1) {
        currentExam.currentQuestionIndex++;
        displayQuestion();
    }
}

function previousQuestion() {
    if (currentExam.currentQuestionIndex > 0) {
        currentExam.currentQuestionIndex--;
        displayQuestion();
    }
}

function goToQuestion(index) {
    currentExam.currentQuestionIndex = index;
    displayQuestion();
}

function updateNavigationButtons() {
    const isFirst = currentExam.currentQuestionIndex === 0;
    const isLast = currentExam.currentQuestionIndex === currentExam.questions.length - 1;

    document.getElementById('prev-btn').disabled = isFirst;

    if (isLast) {
        document.getElementById('next-btn').classList.add('hidden');
        document.getElementById('finish-btn').classList.remove('hidden');
    } else {
        document.getElementById('next-btn').classList.remove('hidden');
        document.getElementById('finish-btn').classList.add('hidden');
    }
}

// Grid de navegación
function generateQuestionGrid() {
    const grid = document.getElementById('question-grid');
    grid.innerHTML = '';

    currentExam.questions.forEach((_, index) => {
        const gridItem = document.createElement('div');
        gridItem.className = 'question-grid-item';
        gridItem.textContent = index + 1;
        gridItem.onclick = () => goToQuestion(index);

        grid.appendChild(gridItem);
    });

    updateQuestionGrid();
}

function updateQuestionGrid() {
    const gridItems = document.querySelectorAll('.question-grid-item');

    gridItems.forEach((item, index) => {
        item.classList.remove('answered', 'current');

        if (index === currentExam.currentQuestionIndex) {
            item.classList.add('current');
        }

        if (currentExam.userAnswers[index] !== null) {
            item.classList.add('answered');
        }
    });
}

// Timer
function startTimer() {
    let seconds = 0;
    examTimer = setInterval(() => {
        seconds++;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        document.getElementById('timer').textContent = timeString;
    }, 1000);
}

function stopTimer() {
    if (examTimer) {
        clearInterval(examTimer);
        examTimer = null;
    }
}

// Finalizar examen
function finishExam() {
    if (confirm('¿Estás seguro de que quieres finalizar el examen?')) {
        currentExam.endTime = new Date();
        currentExam.isFinished = true;
        stopTimer();
        calculateResults();
        showResults();
        saveExamResults();
    }
}

function exitExam() {
    if (confirm('¿Estás seguro de que quieres salir del examen? Se perderá todo el progreso.')) {
        stopTimer();
        showMainMenu();
    }
}

// Cálculo de resultados
function calculateResults() {
    let correctAnswers = 0;

    currentExam.questions.forEach((question, index) => {
        if (currentExam.userAnswers[index] === question.correctAnswer) {
            correctAnswers++;
        }
    });

    currentExam.score = correctAnswers;
    currentExam.percentage = Math.round((correctAnswers / currentExam.questions.length) * 100);

    const timeDiff = currentExam.endTime - currentExam.startTime;
    currentExam.totalTimeMinutes = Math.round(timeDiff / 60000);
}

// Mostrar resultados
function showResults() {
    hideAllSections();
    document.getElementById('results-section').classList.remove('hidden');

    // Actualizar elementos de resultados
    document.getElementById('score-percentage').textContent = `${currentExam.percentage}%`;
    document.getElementById('correct-answers').textContent = `${currentExam.score}/${currentExam.questions.length}`;

    const hours = Math.floor(currentExam.totalTimeMinutes / 60);
    const minutes = currentExam.totalTimeMinutes % 60;
    document.getElementById('total-time').textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    // Crear gráfico de resultados
    createResultsChart();
}

function createResultsChart() {
    const canvas = document.getElementById('results-chart-canvas');
    const ctx = canvas.getContext('2d');

    // Configurar canvas
    canvas.width = 400;
    canvas.height = 200;

    const correct = currentExam.score;
    const incorrect = currentExam.questions.length - correct;
    const total = currentExam.questions.length;

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Configuración del gráfico
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 80;

    // Calcular ángulos
    const correctAngle = (correct / total) * 2 * Math.PI;
    const incorrectAngle = (incorrect / total) * 2 * Math.PI;

    // Dibujar sector correcto
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, 0, correctAngle);
    ctx.closePath();
    ctx.fillStyle = '#48BB78';
    ctx.fill();

    // Dibujar sector incorrecto
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, correctAngle, correctAngle + incorrectAngle);
    ctx.closePath();
    ctx.fillStyle = '#F56565';
    ctx.fill();

    // Agregar etiquetas
    ctx.fillStyle = '#2D3748';
    ctx.font = 'bold 16px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(`${currentExam.percentage}%`, centerX, centerY + 5);

    // Leyenda
    ctx.font = '14px Inter';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#48BB78';
    ctx.fillRect(centerX - 100, centerY + 50, 15, 15);
    ctx.fillStyle = '#2D3748';
    ctx.fillText(`Correctas: ${correct}`, centerX - 80, centerY + 62);

    ctx.fillStyle = '#F56565';
    ctx.fillRect(centerX + 20, centerY + 50, 15, 15);
    ctx.fillStyle = '#2D3748';
    ctx.fillText(`Incorrectas: ${incorrect}`, centerX + 40, centerY + 62);
}

// Revisar respuestas
function reviewAnswers() {
    const modal = document.getElementById('review-modal');
    const content = document.getElementById('review-content');

    let reviewHTML = '';

    currentExam.questions.forEach((question, index) => {
        const userAnswer = currentExam.userAnswers[index];
        const isCorrect = userAnswer === question.correctAnswer;

        reviewHTML += `
            <div class="review-question ${isCorrect ? 'correct' : 'incorrect'}">
                <h4>Pregunta ${index + 1}</h4>
                <p><strong>${question.question}</strong></p>
                <div class="review-options">
                    ${question.options.map((option, optIndex) => {
                        let className = '';
                        if (optIndex === question.correctAnswer) className = 'correct-option';
                        else if (optIndex === userAnswer && userAnswer !== question.correctAnswer) className = 'incorrect-option';
                        
                        return `
                            <div class="review-option ${className}">
                                ${String.fromCharCode(65 + optIndex)}) ${option}
                                ${optIndex === question.correctAnswer ? ' ✓' : ''}
                                ${optIndex === userAnswer && userAnswer !== question.correctAnswer ? ' ✗' : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
                <small><em>Fuente: ${question.source}</em></small>
            </div>
        `;
    });

    content.innerHTML = reviewHTML;
    modal.classList.remove('hidden');
}

function closeReviewModal() {
    document.getElementById('review-modal').classList.add('hidden');
}

// Funciones del menú de resultados
function retakeExam() {
    const questionCount = currentExam.questions.length;
    startExam(questionCount);
}

function backToMenu() {
    showMainMenu();
}

// Modo práctica
function showPracticeMode() {
    // Por ahora, iniciamos un examen de 10 preguntas para práctica
    startExam(10);
}

// Estadísticas
function showStats() {
    const stats = getUserStats();
    alert(`Estadísticas:\n\nExámenes realizados: ${stats.totalExams}\nPromedio de aciertos: ${stats.averageScore}%\nMejor puntuación: ${stats.bestScore}%`);
}

// Sistema de guardado de estadísticas
function saveExamResults() {
    const stats = getUserStats();

    stats.totalExams++;
    stats.scores.push(currentExam.percentage);
    stats.lastExamDate = new Date().toISOString();

    if (currentExam.percentage > stats.bestScore) {
        stats.bestScore = currentExam.percentage;
    }

    // Calcular promedio
    stats.averageScore = Math.round(stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length);

    localStorage.setItem('cotExamStats', JSON.stringify(stats));
}

function getUserStats() {
    const defaultStats = {
        totalExams: 0,
        scores: [],
        averageScore: 0,
        bestScore: 0,
        lastExamDate: null
    };

    const saved = localStorage.getItem('cotExamStats');
    return saved ? JSON.parse(saved) : defaultStats;
}

function loadUserStats() {
    // Cargar estadísticas al iniciar la aplicación
    const stats = getUserStats();
    console.log('Estadísticas cargadas:', stats);
}

// Eventos de teclado
document.addEventListener('keydown', function(event) {
    if (document.getElementById('exam-section').classList.contains('hidden')) return;

    switch(event.key) {
        case 'ArrowLeft':
            if (!document.getElementById('prev-btn').disabled) {
                previousQuestion();
            }
            break;
        case 'ArrowRight':
            if (!document.getElementById('next-btn').classList.contains('hidden')) {
                nextQuestion();
            }
            break;
        case '1':
        case '2':
        case '3':
        case '4':
            const optionIndex = parseInt(event.key) - 1;
            if (optionIndex < currentExam.questions[currentExam.currentQuestionIndex].options.length) {
                selectOption(currentExam.currentQuestionIndex, optionIndex);
            }
            break;
    }
});

// Cerrar modal al hacer clic fuera
document.getElementById('review-modal').addEventListener('click', function(event) {
    if (event.target === this) {
        closeReviewModal();
    }
});

// Agregar estilos CSS para la revisión
const reviewStyles = `
    .review-question {
        margin-bottom: 30px;
        padding: 20px;
        border-radius: 12px;
        border-left: 4px solid #e2e8f0;
    }
    
    .review-question.correct {
        background: #f0fff4;
        border-left-color: #48bb78;
    }
    
    .review-question.incorrect {
        background: #fff5f5;
        border-left-color: #f56565;
    }
    
    .review-options {
        margin: 15px 0;
    }
    
    .review-option {
        padding: 8px 12px;
        margin: 5px 0;
        border-radius: 6px;
        background: #f7fafc;
    }
    
    .review-option.correct-option {
        background: #c6f6d5;
        color: #22543d;
        font-weight: 600;
    }
    
    .review-option.incorrect-option {
        background: #fed7d7;
        color: #742a2a;
        font-weight: 600;
    }
`;

// Agregar estilos al documento
const styleSheet = document.createElement('style');
styleSheet.textContent = reviewStyles;
document.head.appendChild(styleSheet);
