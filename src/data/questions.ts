
export type Category =
  | 'General Knowledge'
  | 'Science'
  | 'Information Technology'

export type Question = {
  question: string
  options: string[]
  answer: number
}

export const questions: Record<Category, Question[]> = {
  'General Knowledge': [
    {
      question: 'What is the capital of Japan?',
      options: ['Seoul', 'Tokyo', 'Beijing', 'Bangkok'],
      answer: 1,
    },
    {
      question: 'Which is the largest ocean?',
      options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'],
      answer: 3,
    },
    {
      question: 'How many continents are there?',
      options: ['5', '6', '7', '8'],
      answer: 2,
    },
    {
      question: 'Which country is famous for the Eiffel Tower?',
      options: ['Italy', 'France', 'Spain', 'Germany'],
      answer: 1,
    },
    {
      question: 'Which planet is known as the Red Planet?',
      options: ['Venus', 'Saturn', 'Mars', 'Jupiter'],
      answer: 2,
    },
  ],

  Science: [
    {
      question: 'What is the chemical formula for water?',
      options: ['CO2', 'H2O', 'O2', 'NaCl'],
      answer: 1,
    },
    {
      question: 'Which organ pumps blood?',
      options: ['Brain', 'Liver', 'Heart', 'Lungs'],
      answer: 2,
    },
    {
      question: 'What gas do plants absorb during photosynthesis?',
      options: ['Oxygen', 'Nitrogen', 'Hydrogen', 'Carbon dioxide'],
      answer: 3,
    },
    {
      question: 'What force pulls objects toward Earth?',
      options: ['Friction', 'Gravity', 'Magnetism', 'Pressure'],
      answer: 1,
    },
    {
      question: 'What is the center of an atom called?',
      options: ['Electron', 'Proton', 'Nucleus', 'Neutron'],
      answer: 2,
    },
  ],

  'Information Technology': [
    {
      question: 'What does CPU stand for?',
      options: [
        'Central Processing Unit',
        'Computer Power Unit',
        'Central Program Utility',
        'Control Processing User',
      ],
      answer: 0,
    },
    {
      question: 'Which language styles web pages?',
      options: ['Python', 'HTML', 'CSS', 'SQL'],
      answer: 2,
    },
    {
      question: 'Which protocol is used for secure web browsing?',
      options: ['FTP', 'HTTP', 'SMTP', 'HTTPS'],
      answer: 3,
    },
    {
      question: 'What does RAM stand for?',
      options: [
        'Read Access Memory',
        'Random Access Memory',
        'Remote Active Memory',
        'Rapid Application Module',
      ],
      answer: 1,
    },
    {
      question: 'Which command checks Git repository status?',
      options: ['git push', 'git init', 'git status', 'git clone'],
      answer: 2,
    },
  ],
}
