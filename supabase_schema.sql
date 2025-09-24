-- Schema para ExamenesTrauma - Supabase Database
-- Ejecuta estos comandos en tu panel de Supabase SQL Editor

-- Crear tabla de preguntas
CREATE TABLE IF NOT EXISTS questions (
  id BIGSERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer INTEGER NOT NULL,
  source TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear tabla de resultados de exámenes
CREATE TABLE IF NOT EXISTS exam_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  percentage REAL NOT NULL,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  total_time_minutes INTEGER NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);
CREATE INDEX IF NOT EXISTS idx_questions_source ON questions(source);
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON questions(created_at);
CREATE INDEX IF NOT EXISTS idx_exam_results_completed_at ON exam_results(completed_at);
CREATE INDEX IF NOT EXISTS idx_exam_results_session_id ON exam_results(session_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para la tabla questions
CREATE OR REPLACE TRIGGER update_questions_updated_at
  BEFORE UPDATE ON questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Configurar Row Level Security (RLS)
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para permitir todas las operaciones (ajusta según tus necesidades)
CREATE POLICY "Allow all operations on questions" ON questions FOR ALL USING (true);
CREATE POLICY "Allow all operations on exam_results" ON exam_results FOR ALL USING (true);

-- Insertar datos de ejemplo (las mismas preguntas que tienes actualmente)
-- Función para obtener preguntas aleatorias
CREATE OR REPLACE FUNCTION get_random_questions(question_count INTEGER)
RETURNS TABLE(
  id BIGINT,
  question TEXT,
  options JSONB,
  correct_answer INTEGER,
  source TEXT,
  category TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE sql
AS $$
  SELECT * FROM questions ORDER BY RANDOM() LIMIT question_count;
$$;

-- Función para obtener estadísticas de exámenes
CREATE OR REPLACE FUNCTION get_exam_stats()
RETURNS TABLE(
  total_exams BIGINT,
  average_score NUMERIC,
  best_score NUMERIC,
  last_exam_date TIMESTAMPTZ
)
LANGUAGE sql
AS $$
  SELECT 
    COUNT(*) as total_exams,
    AVG(percentage) as average_score,
    MAX(percentage) as best_score,
    MAX(completed_at) as last_exam_date
  FROM exam_results;
$$;

INSERT INTO questions (question, options, correct_answer, source, category) VALUES
(
  'La competencia que el actual Estatuto de Autonomía de Andalucía reconoce a nuestra Comunidad Autónoma en materia de sanidad interior está calificada en dicho Estatuto como:',
  '["Compartida", "Delegada", "Autónoma", "Exclusiva"]',
  0,
  '2015 ANDALUCÍA COT -- Acceso Libre (Teórico+Práctico+Reserva)',
  'Legislación Sanitaria'
),
(
  'El IV Plan Andaluz de Salud afronta seis "compromisos". Entre ellos no se encuentra el compromiso de:',
  '["Reducir las desigualdades sociales en salud", "Aumentar la esperanza de vida en buena salud", "Fomentar la gestión del conocimiento e incorporación de tecnologías con criterios de sostenibilidad para mejorar la salud de la población", "Fomentar la gestión del conocimiento e incorporación de tecnologías con criterios de eficiencia para mejorar la rentabilidad de los recursos en salud"]',
  3,
  '2015 ANDALUCÍA COT -- Acceso Libre (Teórico+Práctico+Reserva)',
  'Planificación Sanitaria'
),
(
  'El Estatuto Marco del personal estatutario tipifica "La grave agresión a cualquier persona con la que se relacionen en el ejercicio de sus funciones" como una falta:',
  '["No existe tipificación en dichos términos", "Falta leve", "Falta grave", "Falta muy grave"]',
  3,
  '2015 ANDALUCÍA COT -- Acceso Libre (Teórico+Práctico+Reserva)',
  'Estatuto Marco'
),
(
  'Cuál de los siguientes factores no influye en el proceso de cicatrización de las heridas:',
  '["Tensión en los bordes de la herida", "Niveles de vitamina C", "Irrigación sanguínea", "Niveles de vitamina B12"]',
  3,
  '2015 ANDALUCÍA COT -- Acceso Libre (Teórico+Práctico+Reserva)',
  'Cicatrización'
);