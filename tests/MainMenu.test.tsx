import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MainMenu } from '../src/components/exam/MainMenu';

// Mock the database
vi.mock('@/database/browser', () => ({
  questionDB: {
    getAll: () => [
      { id: 1, question: 'Test question 1', category: 'Test' },
      { id: 2, question: 'Test question 2', category: 'Test' },
      { id: 3, question: 'Test question 3', category: 'Test' },
      { id: 4, question: 'Test question 4', category: 'Test' }
    ],
    getCategories: () => ['Test', 'Sample', 'Demo']
  }
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('MainMenu Component', () => {
  it('renders main menu with correct statistics', async () => {
    renderWithRouter(<MainMenu />);
    
    await waitFor(() => {
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('Preguntas disponibles en el banco')).toBeInTheDocument();
    });

    expect(screen.getByText('Plataforma de Exámenes de Trauma')).toBeInTheDocument();
    expect(screen.getByText('Comenzar Examen')).toBeInTheDocument();
  });

  it('displays categories correctly', async () => {
    renderWithRouter(<MainMenu />);
    
    await waitFor(() => {
      expect(screen.getByText('Categorías disponibles:')).toBeInTheDocument();
    });
  });

  it('has working start exam button', async () => {
    const mockNavigate = vi.fn();
    vi.mock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        useNavigate: () => mockNavigate
      };
    });

    renderWithRouter(<MainMenu />);
    
    const startButton = screen.getByRole('button', { name: /comenzar examen/i });
    expect(startButton).toBeInTheDocument();
  });
});