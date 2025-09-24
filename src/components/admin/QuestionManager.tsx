import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { questionDB } from '@/database/config';
import { Question, QuestionImport } from '@/types';
import { Trash2, Edit, Plus, Upload, Download, Loader2, AlertCircle, Search, Filter, CheckCircle, X } from 'lucide-react';

export function QuestionManager() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, []);

  // Auto-hide success messages
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    filterQuestions();
  }, [questions, searchTerm, selectedCategory]);

  const loadQuestions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [allQuestions, allCategories] = await Promise.all([
        questionDB.getAll(),
        questionDB.getCategories()
      ]);
      
      setQuestions(allQuestions);
      setCategories(allCategories);
    } catch (error) {
      console.error('Error loading questions:', error);
      setError('Error al cargar las preguntas. Por favor, recarga la página.');
    } finally {
      setIsLoading(false);
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

  const deleteQuestion = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta pregunta? Esta acción no se puede deshacer.')) {
      try {
        setIsDeleting(id);
        setError(null);
        
        await questionDB.delete(id);
        
        // Actualizar la lista local inmediatamente para mejor UX
        setQuestions(prev => prev.filter(q => q.id !== id));
        setSuccessMessage('Pregunta eliminada exitosamente');
      } catch (error) {
        console.error('Error deleting question:', error);
        setError('Error al eliminar la pregunta. Por favor, inténtalo de nuevo.');
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const questionsData = JSON.parse(content) as QuestionImport[];

        // Validar formato
        if (!Array.isArray(questionsData)) {
          throw new Error('El archivo debe contener un array de preguntas');
        }

        if (questionsData.length === 0) {
          throw new Error('El archivo está vacío');
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
        const imported = await questionDB.importBatch(questionsData);
        setSuccessMessage(`Se importaron ${imported} preguntas exitosamente`);
        await loadQuestions();

      } catch (error) {
        console.error('Error importing questions:', error);
        setError(`Error al importar: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      } finally {
        setIsImporting(false);
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

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="text-muted-foreground">Cargando preguntas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={loadQuestions} className="ml-auto">
            Reintentar
          </Button>
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2 text-green-700">
          <CheckCircle className="h-5 w-5" />
          <span>{successMessage}</span>
          <Button variant="ghost" size="sm" onClick={() => setSuccessMessage(null)} className="ml-auto p-1">
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestor de Preguntas</h1>
          <p className="text-muted-foreground">Administra el banco de preguntas ({questions.length} preguntas)</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportQuestions} disabled={questions.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <label className="cursor-pointer">
            <Button variant="outline" asChild disabled={isImporting}>
              <span>
                {isImporting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Importando...</>
                ) : (
                  <><Upload className="mr-2 h-4 w-4" /> Importar</>
                )}
              </span>
            </Button>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isImporting}
            />
          </label>
          <Button onClick={() => setShowAddForm(true)} disabled={isSaving}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Pregunta
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium flex items-center gap-2">
                <Search className="h-4 w-4" />
                Buscar
              </label>
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
                <option value="">Todas las categorías ({categories.length})</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Mostrando {filteredQuestions.length} de {questions.length} preguntas
            </div>
            {(searchTerm || selectedCategory) && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                }}
              >
                <X className="h-4 w-4 mr-1" />
                Limpiar filtros
              </Button>
            )}
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
                    disabled={isSaving || isDeleting === question.id}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteQuestion(question.id)}
                    disabled={isSaving || isDeleting === question.id}
                  >
                    {isDeleting === question.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
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
          isSaving={isSaving}
          onSave={async (questionData) => {
            try {
              setIsSaving(true);
              setError(null);
              
              if (editingQuestion) {
                await questionDB.update(editingQuestion.id, questionData);
                // Actualizar la lista local inmediatamente
                setQuestions(prev => 
                  prev.map(q => q.id === editingQuestion.id ? 
                    { ...q, ...questionData, updatedAt: new Date().toISOString() } : q
                  )
                );
                setSuccessMessage('Pregunta actualizada exitosamente');
              } else {
                const newId = await questionDB.create(questionData);
                // Agregar a la lista local inmediatamente
                const newQuestion = {
                  id: newId,
                  ...questionData,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                };
                setQuestions(prev => [newQuestion, ...prev]);
                setSuccessMessage('Pregunta creada exitosamente');
              }
              
              // Actualizar categorías si es necesario
              if (!categories.includes(questionData.category)) {
                setCategories(prev => [...prev, questionData.category].sort());
              }
              
              setShowAddForm(false);
              setEditingQuestion(null);
            } catch (error) {
              console.error('Error saving question:', error);
              setError(`Error al ${editingQuestion ? 'actualizar' : 'crear'} la pregunta. Por favor, inténtalo de nuevo.`);
            } finally {
              setIsSaving(false);
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
  isSaving: boolean;
  onSave: (question: QuestionImport) => Promise<void>;
  onCancel: () => void;
}

function QuestionForm({ question, isSaving, onSave, onCancel }: QuestionFormProps) {
  const [formData, setFormData] = useState<QuestionImport>({
    question: question?.question || '',
    options: question?.options || ['', '', '', ''],
    correctAnswer: question?.correctAnswer || 0,
    source: question?.source || '',
    category: question?.category || '',
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.question.trim()) {
      errors.question = 'La pregunta es requerida';
    }

    formData.options.forEach((option, index) => {
      if (!option.trim()) {
        errors[`option${index}`] = `La opción ${String.fromCharCode(65 + index)} es requerida`;
      }
    });

    if (!formData.source.trim()) {
      errors.source = 'La fuente es requerida';
    }

    if (!formData.category.trim()) {
      errors.category = 'La categoría es requerida';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    await onSave(formData);
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
            <label className="text-sm font-medium">Pregunta *</label>
            <textarea
              value={formData.question}
              onChange={(e) => {
                setFormData({ ...formData, question: e.target.value });
                if (formErrors.question) {
                  setFormErrors(prev => ({ ...prev, question: '' }));
                }
              }}
              className={`w-full mt-1 min-h-[100px] rounded-md border px-3 py-2 text-sm ${
                formErrors.question ? 'border-red-500' : 'border-input'
              }`}
              placeholder="Escribe la pregunta..."
              disabled={isSaving}
              required
            />
            {formErrors.question && (
              <p className="text-sm text-red-600 mt-1">{formErrors.question}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.options.map((option, index) => (
              <div key={index}>
                <label className="text-sm font-medium">
                  Opción {String.fromCharCode(65 + index)} *
                  {formData.correctAnswer === index && (
                    <span className="ml-1 text-green-600 font-semibold">(Correcta)</span>
                  )}
                </label>
                <Input
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...formData.options];
                    newOptions[index] = e.target.value;
                    setFormData({ ...formData, options: newOptions });
                    if (formErrors[`option${index}`]) {
                      setFormErrors(prev => ({ ...prev, [`option${index}`]: '' }));
                    }
                  }}
                  placeholder={`Opción ${String.fromCharCode(65 + index)}`}
                  disabled={isSaving}
                  className={formErrors[`option${index}`] ? 'border-red-500' : ''}
                  required
                />
                {formErrors[`option${index}`] && (
                  <p className="text-sm text-red-600 mt-1">{formErrors[`option${index}`]}</p>
                )}
              </div>
            ))}
          </div>

          <div>
            <label className="text-sm font-medium">Respuesta Correcta *</label>
            <select
              value={formData.correctAnswer}
              onChange={(e) => setFormData({ ...formData, correctAnswer: parseInt(e.target.value) })}
              className="w-full mt-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              disabled={isSaving}
            >
              {formData.options.map((option, index) => (
                <option key={index} value={index}>
                  Opción {String.fromCharCode(65 + index)}{option && `: ${option.slice(0, 30)}${option.length > 30 ? '...' : ''}`}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Fuente *</label>
              <Input
                value={formData.source}
                onChange={(e) => {
                  setFormData({ ...formData, source: e.target.value });
                  if (formErrors.source) {
                    setFormErrors(prev => ({ ...prev, source: '' }));
                  }
                }}
                placeholder="Ej: 2015 ANDALUCÍA COT"
                disabled={isSaving}
                className={formErrors.source ? 'border-red-500' : ''}
                required
              />
              {formErrors.source && (
                <p className="text-sm text-red-600 mt-1">{formErrors.source}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Categoría *</label>
              <Input
                value={formData.category}
                onChange={(e) => {
                  setFormData({ ...formData, category: e.target.value });
                  if (formErrors.category) {
                    setFormErrors(prev => ({ ...prev, category: '' }));
                  }
                }}
                placeholder="Ej: Legislación Sanitaria"
                disabled={isSaving}
                className={formErrors.category ? 'border-red-500' : ''}
                required
              />
              {formErrors.category && (
                <p className="text-sm text-red-600 mt-1">{formErrors.category}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {question ? 'Actualizando...' : 'Guardando...'}
                </>
              ) : (
                question ? 'Actualizar Pregunta' : 'Crear Pregunta'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
