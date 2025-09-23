import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { questionDB } from '@/database/browser';
import { Question, QuestionImport } from '@/types';
import { Trash2, Edit, Plus, Upload, Download } from 'lucide-react';

export function QuestionManager() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  useEffect(() => {
    loadQuestions();
  }, []);

  useEffect(() => {
    filterQuestions();
  }, [questions, searchTerm, selectedCategory]);

  const loadQuestions = () => {
    try {
      const allQuestions = questionDB.getAll();
      setQuestions(allQuestions);
      setCategories(questionDB.getCategories());
    } catch (error) {
      console.error('Error loading questions:', error);
    }
  };

  const filterQuestions = () => {
    let filtered = questions;

    if (searchTerm) {
      filtered = filtered.filter(q =>
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(q => q.category === selectedCategory);
    }

    setFilteredQuestions(filtered);
  };

  const deleteQuestion = (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta pregunta?')) {
      try {
        questionDB.delete(id);
        loadQuestions();
      } catch (error) {
        console.error('Error deleting question:', error);
        alert('Error al eliminar la pregunta');
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const questionsData = JSON.parse(content) as QuestionImport[];

        // Validar formato
        if (!Array.isArray(questionsData)) {
          throw new Error('El archivo debe contener un array de preguntas');
        }

        questionsData.forEach((q, index) => {
          if (!q.question || !q.options || !q.source || !q.category || typeof q.correctAnswer !== 'number') {
            throw new Error(`Pregunta ${index + 1}: Faltan campos requeridos`);
          }
          if (!Array.isArray(q.options) || q.options.length !== 4) {
            throw new Error(`Pregunta ${index + 1}: Debe tener exactamente 4 opciones`);
          }
          if (q.correctAnswer < 0 || q.correctAnswer > 3) {
            throw new Error(`Pregunta ${index + 1}: correctAnswer debe ser 0, 1, 2 o 3`);
          }
        });

        // Importar preguntas
        const imported = questionDB.importBatch(questionsData);
        alert(`Se importaron ${imported} preguntas exitosamente`);
        loadQuestions();

      } catch (error) {
        console.error('Error importing questions:', error);
        alert(`Error al importar: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    };

    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  const exportQuestions = () => {
    const dataStr = JSON.stringify(questions.map(q => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      source: q.source,
      category: q.category
    })), null, 2);

    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `preguntas-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestor de Preguntas</h1>
          <p className="text-muted-foreground">Administra el banco de preguntas</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportQuestions}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <label className="cursor-pointer">
            <Button variant="outline" asChild>
              <span>
                <Upload className="mr-2 h-4 w-4" />
                Importar
              </span>
            </Button>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Pregunta
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Buscar</label>
              <Input
                placeholder="Buscar por pregunta, fuente o categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Categoría</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full mt-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Todas las categorías</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Mostrando {filteredQuestions.length} de {questions.length} preguntas
          </div>
        </CardContent>
      </Card>

      {/* Lista de preguntas */}
      <div className="space-y-4">
        {filteredQuestions.map((question) => (
          <Card key={question.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{question.question}</CardTitle>
                  <CardDescription>
                    Categoría: {question.category} | Fuente: {question.source}
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingQuestion(question)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteQuestion(question.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {question.options.map((option, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded text-sm ${
                      index === question.correctAnswer
                        ? 'bg-green-100 text-green-800 font-medium'
                        : 'bg-gray-50'
                    }`}
                  >
                    {String.fromCharCode(65 + index)}. {option}
                    {index === question.correctAnswer && ' ✓'}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredQuestions.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                {questions.length === 0
                  ? 'No hay preguntas en el banco. Agrega algunas preguntas para comenzar.'
                  : 'No se encontraron preguntas con los filtros aplicados.'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Formulario para agregar/editar preguntas */}
      {(showAddForm || editingQuestion) && (
        <QuestionForm
          question={editingQuestion}
          onSave={(questionData) => {
            try {
              if (editingQuestion) {
                questionDB.update(editingQuestion.id, questionData);
              } else {
                questionDB.create(questionData);
              }
              loadQuestions();
              setShowAddForm(false);
              setEditingQuestion(null);
            } catch (error) {
              console.error('Error saving question:', error);
              alert('Error al guardar la pregunta');
            }
          }}
          onCancel={() => {
            setShowAddForm(false);
            setEditingQuestion(null);
          }}
        />
      )}
    </div>
  );
}

interface QuestionFormProps {
  question?: Question | null;
  onSave: (question: QuestionImport) => void;
  onCancel: () => void;
}

function QuestionForm({ question, onSave, onCancel }: QuestionFormProps) {
  const [formData, setFormData] = useState<QuestionImport>({
    question: question?.question || '',
    options: question?.options || ['', '', '', ''],
    correctAnswer: question?.correctAnswer || 0,
    source: question?.source || '',
    category: question?.category || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!formData.question.trim()) {
      alert('La pregunta es requerida');
      return;
    }

    if (formData.options.some(opt => !opt.trim())) {
      alert('Todas las opciones son requeridas');
      return;
    }

    if (!formData.source.trim() || !formData.category.trim()) {
      alert('La fuente y categoría son requeridas');
      return;
    }

    onSave(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {question ? 'Editar Pregunta' : 'Nueva Pregunta'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Pregunta</label>
            <textarea
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              className="w-full mt-1 min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Escribe la pregunta..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.options.map((option, index) => (
              <div key={index}>
                <label className="text-sm font-medium">
                  Opción {String.fromCharCode(65 + index)}
                  {formData.correctAnswer === index && ' (Correcta)'}
                </label>
                <Input
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...formData.options];
                    newOptions[index] = e.target.value;
                    setFormData({ ...formData, options: newOptions });
                  }}
                  placeholder={`Opción ${String.fromCharCode(65 + index)}`}
                  required
                />
              </div>
            ))}
          </div>

          <div>
            <label className="text-sm font-medium">Respuesta Correcta</label>
            <select
              value={formData.correctAnswer}
              onChange={(e) => setFormData({ ...formData, correctAnswer: parseInt(e.target.value) })}
              className="w-full mt-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {formData.options.map((_, index) => (
                <option key={index} value={index}>
                  Opción {String.fromCharCode(65 + index)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Fuente</label>
              <Input
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                placeholder="Ej: 2015 ANDALUCÍA COT"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Categoría</label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Ej: Legislación Sanitaria"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit">
              {question ? 'Actualizar' : 'Guardar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
