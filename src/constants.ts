export const EXAM_TYPES = ['JKSSB', 'SSC'] as const;

export const CATEGORIES = [
  {
    id: 'gk',
    name: 'General Knowledge',
    examTypes: ['JKSSB', 'SSC'],
    topics: [
      'History (Ancient, Medieval, Modern)',
      'Geography (India + World)',
      'Polity',
      'Economy',
      'Static GK',
      'Science (Physics, Chemistry, Biology)'
    ]
  },
  {
    id: 'ga',
    name: 'General Awareness',
    examTypes: ['JKSSB', 'SSC'],
    topics: [
      'Current Affairs (Monthly + Yearly)',
      'Government Schemes',
      'Awards & Honors',
      'Sports',
      'Important Days'
    ]
  },
  {
    id: 'english',
    name: 'English',
    examTypes: ['JKSSB', 'SSC'],
    topics: [
      'Grammar (Tenses, Articles, Prepositions)',
      'Vocabulary',
      'Synonyms/Antonyms',
      'Error Detection',
      'Fill in the Blanks',
      'Comprehension'
    ]
  },
  {
    id: 'math',
    name: 'Mathematics',
    examTypes: ['JKSSB', 'SSC'],
    topics: [
      'Arithmetic',
      'Algebra',
      'Geometry',
      'Trigonometry',
      'Data Interpretation',
      'Number System'
    ]
  },
  {
    id: 'reasoning',
    name: 'Reasoning',
    examTypes: ['JKSSB', 'SSC'],
    topics: [
      'Verbal Reasoning',
      'Non-Verbal Reasoning',
      'Logical Reasoning',
      'Coding-Decoding',
      'Blood Relations',
      'Puzzles'
    ]
  },
  {
    id: 'computer',
    name: 'Computer Knowledge',
    examTypes: ['JKSSB', 'SSC'],
    topics: [
      'Basics of Computer',
      'MS Office',
      'Internet',
      'Hardware & Software',
      'Networking',
      'Cyber Security'
    ]
  },
  {
    id: 'jk_gk',
    name: 'Jammu & Kashmir Specific GK',
    examTypes: ['JKSSB'],
    topics: [
      'JK History',
      'JK Geography',
      'JK Polity',
      'JK Culture',
      'Important Personalities',
      'Current Affairs (JK)'
    ]
  },
  {
    id: 'accountancy',
    name: 'Accountancy',
    examTypes: ['JKSSB'],
    topics: [
      'Basic Accounting Principles',
      'Journal & Ledger',
      'Bank Reconciliation',
      'Cash Flow Statement',
      'Partnership Accounts',
      'Company Accounts',
      'Analysis of Financial Statements'
    ]
  }
];

export const RANKS = ['Beginner', 'Intermediate', 'Expert', 'Master'] as const;
export const DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const;
