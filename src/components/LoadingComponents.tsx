import { Loader2, BookOpen, Timer, CheckCircle } from 'lucide-react';
import { Card, CardContent } from './ui/card';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <Loader2 className={`${sizeClasses[size]} animate-spin ${className}`} />
  );
}

interface LoadingStateProps {
  message?: string;
  type?: 'general' | 'exam' | 'questions' | 'results';
  showProgress?: boolean;
  progress?: number;
}

export function LoadingState({ 
  message = 'Cargando...', 
  type = 'general',
  showProgress = false,
  progress = 0
}: LoadingStateProps) {
  const getIcon = () => {
    switch (type) {
      case 'exam':
        return <Timer className="h-8 w-8 text-blue-500" />;
      case 'questions':
        return <BookOpen className="h-8 w-8 text-blue-500" />;
      case 'results':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      default:
        return <LoadingSpinner size="lg" className="text-blue-500" />;
    }
  };

  const getTypeMessage = () => {
    switch (type) {
      case 'exam':
        return 'Preparando tu examen...';
      case 'questions':
        return 'Cargando banco de preguntas...';
      case 'results':
        return 'Calculando resultados...';
      default:
        return message;
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <Card className="w-full max-w-md shadow-lg border-blue-100">
        <CardContent className="flex flex-col items-center space-y-4 p-8">
          <div className="flex items-center space-x-3">
            {getIcon()}
            <LoadingSpinner size="md" className="text-blue-500" />
          </div>
          
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-blue-800">
              {getTypeMessage()}
            </h3>
            <p className="text-sm text-blue-600">
              Por favor espera un momento
            </p>
          </div>

          {showProgress && (
            <div className="w-full space-y-2">
              <div className="w-full bg-blue-100 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
              </div>
              <p className="text-xs text-center text-blue-500">
                {Math.round(progress)}%
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface SkeletonProps {
  className?: string;
  rows?: number;
}

export function Skeleton({ className = '', rows = 1 }: SkeletonProps) {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div 
          key={i}
          className="bg-gray-200 rounded h-4 mb-2 last:mb-0"
          style={{ width: `${Math.random() * 40 + 60}%` }}
        />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <Card className="shadow-lg">
      <CardContent className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-3/4" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-4 bg-gray-200 rounded w-4/6" />
          </div>
          <div className="flex space-x-2 pt-4">
            <div className="h-8 bg-gray-200 rounded w-20" />
            <div className="h-8 bg-gray-200 rounded w-16" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}