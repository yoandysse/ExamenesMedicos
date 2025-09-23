import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { BookOpen, Settings, Home } from 'lucide-react';

export function Navigation() {
  const location = useLocation();

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6" />
              <span className="font-bold text-xl">Plataforma de Exámenes</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant={location.pathname === '/' ? 'default' : 'ghost'}
              asChild
              size="sm"
            >
              <Link to="/" className="flex items-center space-x-2">
                <Home className="h-4 w-4" />
                <span>Inicio</span>
              </Link>
            </Button>

            <Button
              variant={location.pathname.startsWith('/admin') ? 'default' : 'ghost'}
              asChild
              size="sm"
            >
              <Link to="/admin" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Administración</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
