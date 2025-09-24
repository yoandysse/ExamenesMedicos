import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MainMenu } from './components/exam/MainMenu';
import { ExamSession } from './components/exam/ExamSession';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { QuestionManager } from './components/admin/QuestionManager';
import { MigrationPanel } from './components/admin/MigrationPanel';
import { Navigation } from './components/Navigation';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';
import './globals.css';

function App() {
  return (
    <ErrorBoundary fallbackTitle="Error en la aplicación">
      <ToastProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Navigation />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={
                  <ErrorBoundary fallbackTitle="Error en el menú principal">
                    <MainMenu />
                  </ErrorBoundary>
                } />
                <Route path="/exam" element={
                  <ErrorBoundary fallbackTitle="Error en el examen">
                    <ExamSession />
                  </ErrorBoundary>
                } />
                <Route path="/admin" element={
                  <ErrorBoundary fallbackTitle="Error en el panel de administración">
                    <AdminDashboard />
                  </ErrorBoundary>
                } />
                <Route path="/admin/questions" element={
                  <ErrorBoundary fallbackTitle="Error en el gestor de preguntas">
                    <QuestionManager />
                  </ErrorBoundary>
                } />
                <Route path="/admin/migration" element={
                  <ErrorBoundary fallbackTitle="Error en el panel de migración">
                    <MigrationPanel />
                  </ErrorBoundary>
                } />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </Router>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
