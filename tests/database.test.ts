import { describe, it, expect, beforeEach } from 'vitest';
import { questionDB } from '../src/database/browser';

describe('Database Browser Module', () => {
  beforeEach(() => {
    // Reset to initial state before each test
    // In a real test, we'd want to mock or use a test database
  });

  it('should return all questions', () => {
    const questions = questionDB.getAll();
    expect(Array.isArray(questions)).toBe(true);
    expect(questions.length).toBeGreaterThan(0);
  });

  it('should return random questions', () => {
    const randomQuestions = questionDB.getRandom(2);
    expect(randomQuestions.length).toBeLessThanOrEqual(2);
    expect(Array.isArray(randomQuestions)).toBe(true);
  });

  it('should return all categories', () => {
    const categories = questionDB.getCategories();
    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBeGreaterThan(0);
  });

  it('should return questions by category', () => {
    const categories = questionDB.getCategories();
    if (categories.length > 0) {
      const categoryQuestions = questionDB.getByCategory(categories[0]);
      expect(Array.isArray(categoryQuestions)).toBe(true);
      categoryQuestions.forEach(question => {
        expect(question.category).toBe(categories[0]);
      });
    }
  });

  it('should search questions', () => {
    const searchResults = questionDB.search('salud');
    expect(Array.isArray(searchResults)).toBe(true);
    // Results should contain the search term in question, source, or category
    searchResults.forEach(question => {
      const searchText = `${question.question} ${question.source} ${question.category}`.toLowerCase();
      expect(searchText).toContain('salud');
    });
  });

  it('should validate question structure', () => {
    const questions = questionDB.getAll();
    questions.forEach(question => {
      expect(question).toHaveProperty('id');
      expect(question).toHaveProperty('question');
      expect(question).toHaveProperty('options');
      expect(question).toHaveProperty('correctAnswer');
      expect(question).toHaveProperty('source');
      expect(question).toHaveProperty('category');
      
      expect(Array.isArray(question.options)).toBe(true);
      expect(question.options.length).toBe(4);
      expect(question.correctAnswer).toBeGreaterThanOrEqual(0);
      expect(question.correctAnswer).toBeLessThan(4);
    });
  });
});