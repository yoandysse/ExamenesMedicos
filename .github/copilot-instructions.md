# ExamenesMedicos - Plataforma de Exámenes COT

**ALWAYS follow these instructions first and only fallback to additional search or bash commands if the information here is incomplete or found to be in error.**

Modern exam platform for COT (Cirugía Ortopédica y Traumatología) built with React 18, TypeScript, Vite, Tailwind CSS, and SQLite.

## Working Effectively

### Bootstrap and Dependencies
- **Install dependencies**: `npm install` -- takes ~1 second, dependencies are well-resolved
- **Node.js requirement**: Requires Node.js v16+ (validated with v20.19.5)

### Build and Development 
- **Development server**: `npm run dev` -- starts instantly on http://localhost:5173/
- **Production build**: `npm run build` -- takes ~6 seconds. NEVER CANCEL. Set timeout to 60+ seconds for safety
- **Preview production**: `npm run preview` -- starts instantly on http://localhost:4173/
- **Linting**: `npm run lint` -- **FAILS** because ESLint is not configured. Do not rely on this command

### Key Project Files and Structure
```
/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui base components  
│   │   ├── exam/            # Exam interface components
│   │   └── admin/           # Admin panel components
│   ├── database/            # SQLite configuration (browser & memory)
│   ├── types/               # TypeScript definitions
│   ├── lib/                 # Utilities
│   ├── App.tsx              # Main React app
│   └── main.tsx             # Vite entry point
├── package.json             # Dependencies and scripts
├── vite.config.ts           # Vite configuration with path aliases
├── tailwind.config.js       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
├── migrate-questions.js     # Migration script (see notes below)
├── questions-data.js        # Legacy question data
├── app.js                   # Legacy vanilla JS implementation
└── classic.html             # Legacy HTML interface
```

## Validation Requirements

### CRITICAL: Always Test Complete User Scenarios
After making any changes, **MANUALLY VALIDATE** by running through these scenarios:

1. **Start dev server and verify main page**:
   - Run `npm run dev`
   - Navigate to http://localhost:5173/
   - Verify statistics display (Total Questions: 4, Categories: 4)
   - Check that "Comenzar Examen" button is visible

2. **Test exam functionality**:
   - Click "Comenzar Examen" button
   - Verify exam interface loads with question 1 of 4
   - Select an answer option (A, B, C, or D)
   - Click "Siguiente" to navigate to next question
   - Verify question counter updates and timer is running
   - Test "Anterior" button navigation works

3. **Test admin panel**:
   - Click "Administración" in navigation
   - Verify admin dashboard loads at /admin
   - Check statistics display correctly
   - Verify "Abrir Gestor de Preguntas" and import sections are visible

### Build Validation
- **Always run build before finalizing changes**: `npm run build`
- **Verify dist/ output**: Check that `dist/index.html` and `dist/assets/` are created
- **Test production build**: `npm run preview` and verify functionality at http://localhost:4173/

## Important Implementation Notes

### Database & Data Management
- **SQLite database**: Auto-created as `exam-platform.db` when app starts
- **Default questions**: 4 sample questions included covering categories: Cicatrización, Estatuto Marco, Legislación Sanitaria, Planificación Sanitaria
- **Migration script limitation**: `node migrate-questions.js` **FAILS** due to TypeScript module resolution. This is a known issue - questions are loaded directly into SQLite via the React app instead

### Technology Stack Details
- **Vite**: Ultra-fast build tool, dev server starts instantly
- **React 18**: With React Router for navigation
- **TypeScript**: Strict mode enabled with path aliases (`@/*` → `./src/*`)
- **Tailwind CSS**: With shadcn/ui components and CSS variables for theming
- **SQLite**: via better-sqlite3 for local data storage

### Key Routes & Components
- **Main page** (`/`): `src/components/exam/MainMenu.tsx` - displays stats and start exam
- **Exam interface** (`/exam`): Question display, navigation, timer functionality  
- **Admin panel** (`/admin`): `src/components/admin/AdminDashboard.tsx` - question management
- **Database layer**: `src/database/browser.ts` - SQLite operations wrapper

## Common Tasks & Troubleshooting

### Working with Questions
- **Add questions**: Use admin panel import feature with JSON format
- **Question format**: `{"question": "text", "options": ["A","B","C","D"], "correctAnswer": 0, "source": "exam", "category": "topic"}`
- **Categories**: Auto-detected from question data, displayed in UI

### Styling & UI Changes
- **CSS variables**: Defined in `src/globals.css` for theme customization
- **Component library**: Uses shadcn/ui components in `src/components/ui/`
- **Responsive design**: Tailwind classes throughout, mobile-friendly

### Development Workflow
1. **Always start with**: `npm run dev` 
2. **Make incremental changes** and test in browser immediately
3. **For data changes**: Test both main exam flow and admin panel
4. **Before committing**: Run `npm run build` and verify production build works
5. **Manual validation**: Test complete user scenarios as described above

### Common Issues
- **Migration script fails**: This is expected, use admin panel import instead
- **Build errors**: Check TypeScript errors, most commonly import path issues
- **Database not persisting**: Check that `exam-platform.db` file permissions are correct
- **Styling issues**: Verify Tailwind classes and check `src/globals.css` for custom CSS variables

### Performance Expectations
- **Dev server startup**: Instant (< 1 second)
- **Build time**: ~6 seconds for full production build
- **Hot reload**: Instant for most changes
- **App loading**: Very fast due to Vite optimization

## Testing Strategy

Since there are no automated tests configured:
- **Always manually test** all affected user flows after changes
- **Use both desktop and mobile viewport** sizes during testing  
- **Test error scenarios**: Try invalid data, navigation edge cases
- **Verify data persistence**: Ensure exam results and questions save correctly
- **Cross-browser compatibility**: Test in Chrome/Firefox if making significant changes

## CI/CD Notes

No GitHub Actions workflow currently configured. Manual validation is critical before merging changes.