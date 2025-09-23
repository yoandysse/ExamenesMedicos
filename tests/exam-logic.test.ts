import { describe, it, expect } from 'vitest';

// Test utility functions that would be used in the exam
function calculateScore(userAnswers: (number | null)[], questions: { correctAnswer: number }[]) {
  return userAnswers.filter((answer, index) => 
    answer !== null && answer === questions[index].correctAnswer
  ).length;
}

function calculatePercentage(score: number, totalQuestions: number) {
  return Math.round((score / totalQuestions) * 100);
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function validateAnswerIndex(answerIndex: number | null, optionsLength: number) {
  if (answerIndex === null) return true;
  return answerIndex >= 0 && answerIndex < optionsLength;
}

function getAnsweredCount(userAnswers: (number | null)[]) {
  return userAnswers.filter(answer => answer !== null).length;
}

describe('Exam Logic Functions', () => {
  const mockQuestions = [
    { correctAnswer: 0, options: ['A', 'B', 'C', 'D'] },
    { correctAnswer: 1, options: ['A', 'B', 'C', 'D'] },
    { correctAnswer: 2, options: ['A', 'B', 'C', 'D'] },
    { correctAnswer: 3, options: ['A', 'B', 'C', 'D'] }
  ];

  describe('calculateScore', () => {
    it('should calculate correct score for all correct answers', () => {
      const userAnswers = [0, 1, 2, 3];
      const score = calculateScore(userAnswers, mockQuestions);
      expect(score).toBe(4);
    });

    it('should calculate correct score for partial correct answers', () => {
      const userAnswers = [0, 1, 0, 0]; // 2 correct
      const score = calculateScore(userAnswers, mockQuestions);
      expect(score).toBe(2);
    });

    it('should handle null answers correctly', () => {
      const userAnswers = [0, null, 2, null]; // 2 correct, 2 null
      const score = calculateScore(userAnswers, mockQuestions);
      expect(score).toBe(2);
    });

    it('should return 0 for all wrong answers', () => {
      const userAnswers = [1, 0, 0, 0]; // all wrong
      const score = calculateScore(userAnswers, mockQuestions);
      expect(score).toBe(0);
    });
  });

  describe('calculatePercentage', () => {
    it('should calculate 100% for perfect score', () => {
      const percentage = calculatePercentage(4, 4);
      expect(percentage).toBe(100);
    });

    it('should calculate 50% for half correct', () => {
      const percentage = calculatePercentage(2, 4);
      expect(percentage).toBe(50);
    });

    it('should calculate 0% for no correct answers', () => {
      const percentage = calculatePercentage(0, 4);
      expect(percentage).toBe(0);
    });

    it('should round to nearest integer', () => {
      const percentage = calculatePercentage(1, 3); // 33.33%
      expect(percentage).toBe(33);
    });
  });

  describe('formatTime', () => {
    it('should format seconds correctly', () => {
      expect(formatTime(0)).toBe('00:00');
      expect(formatTime(59)).toBe('00:59');
      expect(formatTime(60)).toBe('01:00');
      expect(formatTime(125)).toBe('02:05');
      expect(formatTime(3661)).toBe('61:01');
    });
  });

  describe('validateAnswerIndex', () => {
    it('should accept null answers', () => {
      expect(validateAnswerIndex(null, 4)).toBe(true);
    });

    it('should accept valid indices', () => {
      expect(validateAnswerIndex(0, 4)).toBe(true);
      expect(validateAnswerIndex(3, 4)).toBe(true);
    });

    it('should reject invalid indices', () => {
      expect(validateAnswerIndex(-1, 4)).toBe(false);
      expect(validateAnswerIndex(4, 4)).toBe(false);
      expect(validateAnswerIndex(10, 4)).toBe(false);
    });
  });

  describe('getAnsweredCount', () => {
    it('should count non-null answers', () => {
      expect(getAnsweredCount([0, 1, null, 3])).toBe(3);
      expect(getAnsweredCount([null, null, null, null])).toBe(0);
      expect(getAnsweredCount([0, 1, 2, 3])).toBe(4);
    });
  });

  describe('Exam State Validation', () => {
    it('should validate complete exam session', () => {
      const examSession = {
        id: 'test-123',
        questions: mockQuestions,
        currentQuestionIndex: 0,
        userAnswers: [0, null, 2, 3],
        startTime: new Date('2023-01-01T10:00:00Z'),
        isFinished: false
      };

      // Validate basic properties
      expect(examSession.id).toBeTruthy();
      expect(examSession.questions.length).toBe(4);
      expect(examSession.currentQuestionIndex).toBeGreaterThanOrEqual(0);
      expect(examSession.currentQuestionIndex).toBeLessThan(examSession.questions.length);
      expect(examSession.userAnswers.length).toBe(examSession.questions.length);
      expect(examSession.startTime).toBeInstanceOf(Date);

      // Validate answer indices
      examSession.userAnswers.forEach((answer, index) => {
        if (answer !== null) {
          expect(answer).toBeGreaterThanOrEqual(0);
          expect(answer).toBeLessThan(examSession.questions[index].options.length);
        }
      });
    });
  });
});