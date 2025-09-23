import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MainMenu } from './components/exam/MainMenu';
import { ExamSession } from './components/exam/ExamSession';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { QuestionManager } from './components/admin/QuestionManager';
import { Navigation } from './components/Navigation';
import './globals.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<MainMenu />} />
            <Route path="/exam" element={<ExamSession />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/questions" element={<QuestionManager />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
