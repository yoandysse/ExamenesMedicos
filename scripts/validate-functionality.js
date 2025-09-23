#!/usr/bin/env node

// Functional validation script for ExamenesMedicos platform
import { questionDB } from '../src/database/browser.js';

console.log('🧪 Running functional validation tests for ExamenesMedicos Platform\n');

// Test 1: Database connectivity and question loading
console.log('1️⃣  Testing database connectivity...');
try {
  const questions = questionDB.getAll();
  console.log(`   ✅ Successfully loaded ${questions.length} questions`);
  
  if (questions.length > 0) {
    console.log(`   ✅ First question: "${questions[0].question.substring(0, 50)}..."`);
  }
} catch (error) {
  console.log(`   ❌ Database error: ${error.message}`);
}

// Test 2: Categories functionality
console.log('\n2️⃣  Testing categories functionality...');
try {
  const categories = questionDB.getCategories();
  console.log(`   ✅ Found ${categories.length} categories: ${categories.join(', ')}`);
} catch (error) {
  console.log(`   ❌ Categories error: ${error.message}`);
}

// Test 3: Random question selection
console.log('\n3️⃣  Testing random question selection...');
try {
  const randomQuestions = questionDB.getRandom(2);
  console.log(`   ✅ Successfully got ${randomQuestions.length} random questions`);
} catch (error) {
  console.log(`   ❌ Random selection error: ${error.message}`);
}

// Test 4: Search functionality
console.log('\n4️⃣  Testing search functionality...');
try {
  const searchResults = questionDB.search('salud');
  console.log(`   ✅ Search for 'salud' returned ${searchResults.length} results`);
} catch (error) {
  console.log(`   ❌ Search error: ${error.message}`);
}

// Test 5: Question validation
console.log('\n5️⃣  Testing question structure validation...');
try {
  const questions = questionDB.getAll();
  let validQuestions = 0;
  let errors = [];

  questions.forEach((question, index) => {
    if (!question.id || !question.question || !Array.isArray(question.options) || 
        question.options.length !== 4 || typeof question.correctAnswer !== 'number' ||
        question.correctAnswer < 0 || question.correctAnswer > 3) {
      errors.push(`Question ${index + 1} has invalid structure`);
    } else {
      validQuestions++;
    }
  });

  if (errors.length === 0) {
    console.log(`   ✅ All ${validQuestions} questions have valid structure`);
  } else {
    console.log(`   ⚠️  ${validQuestions} valid questions, ${errors.length} errors:`);
    errors.slice(0, 5).forEach(error => console.log(`      - ${error}`));
  }
} catch (error) {
  console.log(`   ❌ Validation error: ${error.message}`);
}

console.log('\n🎉 Functional validation completed!');
console.log('\n📋 Manual testing checklist:');
console.log('   □ Navigate to main menu and verify statistics');
console.log('   □ Start exam and verify question loading');
console.log('   □ Test answer selection and navigation');
console.log('   □ Complete exam and verify results screen');
console.log('   □ Test admin panel functionality');
console.log('   □ Test question manager and filtering');