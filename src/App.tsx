
import { useEffect, useState } from 'react'
import {
  questions,
  type Category,
  type Question,
} from './data/questions'
import './App.css'

type Screen = 'home' | 'quiz' | 'result' | 'history' | 'review'
type HighScores = Partial<Record<Category, number>>

type QuizAttempt = {
  id: string
  category: Category
  score: number
  total: number
  percentage: number
  completedAt: string
}

type AnswerRecord = {
  question: string
  options: string[]
  correctAnswer: number
  selectedAnswer: number | null
  status: 'correct' | 'incorrect' | 'timeout'
}

const QUESTION_TIME = 15
const HIGH_SCORE_KEY = 'quizmaster-high-scores'
const HISTORY_KEY = 'quizmaster-history'

const categories = Object.keys(questions) as Category[]

function shuffleQuestions(items: Question[]): Question[] {
  const shuffled = [...items]

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = shuffled[i]

    shuffled[i] = shuffled[j]
    shuffled[j] = temp
  }

  return shuffled
}

function loadHighScores(): HighScores {
  try {
    const saved = localStorage.getItem(HIGH_SCORE_KEY)
    if (!saved) return {}

    const parsed: unknown = JSON.parse(saved)

    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return {}
    }

    const data = parsed as Record<string, unknown>
    const result: HighScores = {}

    for (const category of categories) {
      const value = data[category]

      if (
        typeof value === 'number' &&
        Number.isInteger(value) &&
        value >= 0 &&
        value <= questions[category].length
      ) {
        result[category] = value
      }
    }

    return result
  } catch {
    return {}
  }
}

function loadHistory(): QuizAttempt[] {
  try {
    const saved = localStorage.getItem(HISTORY_KEY)
    if (!saved) return []

    const parsed: unknown = JSON.parse(saved)
    if (!Array.isArray(parsed)) return []

    return parsed.filter((item): item is QuizAttempt => {
      if (
        typeof item !== 'object' ||
        item === null ||
        Array.isArray(item)
      ) {
        return false
      }

      const record = item as Record<string, unknown>

      return (
        typeof record.id === 'string' &&
        categories.some(category => category === record.category) &&
        typeof record.score === 'number' &&
        Number.isInteger(record.score) &&
        typeof record.total === 'number' &&
        Number.isInteger(record.total) &&
        record.total > 0 &&
        record.score >= 0 &&
        record.score <= record.total &&
        typeof record.percentage === 'number' &&
        record.percentage ===
          Math.round((record.score / record.total) * 100) &&
        typeof record.completedAt === 'string' &&
        Number.isFinite(Date.parse(record.completedAt))
      )
    })
  } catch {
    return []
  }
}

function formatDate(date: string): string {
  return new Date(date).toLocaleString('en-LK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function App() {
  const [category, setCategory] =
    useState<Category>('General Knowledge')

  const [screen, setScreen] = useState<Screen>('home')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] =
    useState<number | null>(null)

  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME)

  const [activeQuestions, setActiveQuestions] =
    useState<Question[]>([])

  const [answerRecords, setAnswerRecords] =
    useState<AnswerRecord[]>([])

  const [highScores, setHighScores] =
    useState<HighScores>(loadHighScores)

  const [history, setHistory] =
    useState<QuizAttempt[]>(loadHistory)

  const [storageMessage, setStorageMessage] = useState('')

  const totalQuestions = activeQuestions.length
  const question = activeQuestions[currentQuestion]

  const timedOut = timeLeft === 0
  const answered = selectedAnswer !== null || timedOut

  const percentage =
    totalQuestions > 0
      ? Math.round((score / totalQuestions) * 100)
      : 0

  const correctCount = answerRecords.filter(
    answer => answer.status === 'correct',
  ).length

  const incorrectCount = answerRecords.filter(
    answer => answer.status === 'incorrect',
  ).length

  const timeoutCount = answerRecords.filter(
    answer => answer.status === 'timeout',
  ).length

  useEffect(() => {
    if (screen !== 'quiz' || answered) return

    const timer = window.setTimeout(() => {
      setTimeLeft(previous => Math.max(0, previous - 1))
    }, 1000)

    return () => window.clearTimeout(timer)
  }, [screen, answered, timeLeft])

  function startQuiz() {
    setActiveQuestions(shuffleQuestions(questions[category]))
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setScore(0)
    setTimeLeft(QUESTION_TIME)
    setAnswerRecords([])
    setStorageMessage('')
    setScreen('quiz')
  }

  function selectAnswer(index: number) {
    if (screen !== 'quiz' || answered || !question) return

    setSelectedAnswer(index)

    if (index === question.answer) {
      setScore(previous => previous + 1)
    }
  }

  function saveCompletedQuiz() {
    const attempt: QuizAttempt = {
      id: crypto.randomUUID(),
      category,
      score,
      total: totalQuestions,
      percentage,
      completedAt: new Date().toISOString(),
    }

    const updatedHistory = [attempt, ...history]
    const previousBest = highScores[category]

    const updatedScores: HighScores = {
      ...highScores,
      [category]: Math.max(score, previousBest ?? 0),
    }

    setHistory(updatedHistory)
    setHighScores(updatedScores)

    try {
      localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(updatedHistory),
      )

      localStorage.setItem(
        HIGH_SCORE_KEY,
        JSON.stringify(updatedScores),
      )

      setStorageMessage('')
    } catch {
      setStorageMessage(
        'Your result is available, but it could not be saved permanently in this browser.',
      )
    }
  }

  function nextQuestion() {
    if (screen !== 'quiz' || !answered || !question) return

    const status: AnswerRecord['status'] =
      selectedAnswer === null
        ? 'timeout'
        : selectedAnswer === question.answer
          ? 'correct'
          : 'incorrect'

    const record: AnswerRecord = {
      question: question.question,
      options: [...question.options],
      correctAnswer: question.answer,
      selectedAnswer,
      status,
    }

    setAnswerRecords(previous => [...previous, record])

    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(previous => previous + 1)
      setSelectedAnswer(null)
      setTimeLeft(QUESTION_TIME)
    } else {
      saveCompletedQuiz()
      setScreen('result')
    }
  }

  function goHome() {
    setScreen('home')
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setScore(0)
    setTimeLeft(QUESTION_TIME)
    setActiveQuestions([])
    setAnswerRecords([])
    setStorageMessage('')
  }

  function clearHistory() {
    const confirmed = window.confirm(
      'Are you sure you want to delete your quiz history? This action cannot be undone.',
    )

    if (!confirmed) return

    try {
      localStorage.removeItem(HISTORY_KEY)
      setHistory([])
      setStorageMessage('')
    } catch {
      setStorageMessage(
        'Quiz history could not be removed from browser storage.',
      )
    }
  }

  function getResultMessage() {
    if (score === totalQuestions) {
      return 'Excellent work. You answered every question correctly.'
    }

    if (percentage >= 80) {
      return 'Great performance. Keep up the good work.'
    }

    if (percentage >= 60) {
      return 'Good effort. Keep practicing to improve your score.'
    }

    return 'Keep learning and try again to improve your result.'
  }

  return (
    <main className="app">
      <div className="quiz-card">

        {screen === 'home' && (
          <>
            <h1>QuizMaster</h1>

            <p className="subtitle">
              Challenge your mind. Test your knowledge.
            </p>

            <h2>Choose a Category</h2>

            <div className="categories">
              {categories.map(item => (
                <button
                  key={item}
                  type="button"
                  className={
                    category === item
                      ? 'category active'
                      : 'category'
                  }
                  onClick={() => setCategory(item)}
                  aria-pressed={category === item}
                >
                  {item}
                </button>
              ))}
            </div>

            <p className="high-score-text">
              Best Score:{' '}
              {highScores[category] === undefined
                ? 'Not played yet'
                : `${highScores[category]} / ${questions[category].length}`}
            </p>

            <button
              type="button"
              className="start-button"
              onClick={startQuiz}
            >
              Start Quiz
            </button>

            <button
              type="button"
              className="back-button"
              onClick={() => {
                setStorageMessage('')
                setScreen('history')
              }}
            >
              View Quiz History
            </button>

            <p className="footer-text">
              Select a category and test your knowledge
              with five questions.
            </p>
          </>
        )}

        {screen === 'quiz' && question && (
          <>
            <p className="quiz-category">{category}</p>

            <p
              className={`quiz-timer ${
                timeLeft <= 5 ? 'warning' : ''
              }`}
              role="timer"
            >
              Time Remaining: {timeLeft} seconds
            </p>

            <div className="progress-info">
              <span>
                Question {currentQuestion + 1} of {totalQuestions}
              </span>
              <span>Score: {score}</span>
            </div>

            <div
              className="progress-track"
              role="progressbar"
              aria-label="Quiz progress"
              aria-valuenow={currentQuestion + 1}
              aria-valuemin={0}
              aria-valuemax={totalQuestions}
            >
              <div
                className="progress-fill"
                style={{
                  width: `${
                    ((currentQuestion + 1) / totalQuestions) * 100
                  }%`,
                }}
              />
            </div>

            <h2 className="question-title">
              {question.question}
            </h2>

            <div className="answer-list">
              {question.options.map((option, index) => {
                let className = 'answer-option'

                if (answered) {
                  if (index === question.answer) {
                    className += ' correct'
                  } else if (index === selectedAnswer) {
                    className += ' incorrect'
                  }
                }

                return (
                  <button
                    key={index}
                    type="button"
                    className={className}
                    onClick={() => selectAnswer(index)}
                    disabled={answered}
                  >
                    <span>
                      {String.fromCharCode(65 + index)}.
                    </span>
                    {option}
                  </button>
                )
              })}
            </div>

            {answered && (
              <p className="answer-feedback" role="status">
                {selectedAnswer === null
                  ? 'Time is up. No points awarded.'
                  : selectedAnswer === question.answer
                    ? 'Correct Answer'
                    : 'Incorrect Answer. The correct option is highlighted.'}
              </p>
            )}

            <button
              type="button"
              className="start-button"
              onClick={nextQuestion}
              disabled={!answered}
            >
              {currentQuestion === totalQuestions - 1
                ? 'View Results'
                : 'Next Question'}
            </button>
          </>
        )}

        {screen === 'result' && (
          <>
            <h1>Quiz Completed</h1>
            <p className="subtitle">{category}</p>

            <div className="result-score">
              {score} / {totalQuestions}
            </div>

            <p className="high-score-text">
              Personal Best:{' '}
              {highScores[category] ?? score} / {totalQuestions}
            </p>

            <h2>{percentage}%</h2>

            <p className="subtitle">
              {getResultMessage()}
            </p>

            {storageMessage && (
              <p className="history-message" role="alert">
                {storageMessage}
              </p>
            )}

            <button
              type="button"
              className="start-button"
              onClick={() => setScreen('review')}
            >
              Review Answers
            </button>

            <button
              type="button"
              className="back-button"
              onClick={startQuiz}
            >
              Try Again
            </button>

            <button
              type="button"
              className="back-button"
              onClick={() => {
                setStorageMessage('')
                setScreen('history')
              }}
            >
              View Quiz History
            </button>

            <button
              type="button"
              className="back-button"
              onClick={goHome}
            >
              Back to Categories
            </button>
          </>
        )}

        {screen === 'review' && (
          <>
            <h1>Answer Review</h1>

            <p className="subtitle">{category}</p>

            <div className="review-summary">
              <span>Correct: {correctCount}</span>
              <span>Incorrect: {incorrectCount}</span>
              <span>Timed Out: {timeoutCount}</span>
            </div>

            <div className="review-list">
              {answerRecords.map((record, index) => (
                <article className="review-item" key={index}>
                  <div className="review-item-header">
                    <span>Question {index + 1}</span>
                    <span className={`review-status ${record.status}`}>
                      {record.status === 'timeout'
                        ? 'Timed Out'
                        : record.status === 'correct'
                          ? 'Correct'
                          : 'Incorrect'}
                    </span>
                  </div>

                  <h3>{record.question}</h3>

                  <p>
                    <strong>Your Answer: </strong>
                    {record.selectedAnswer === null
                      ? 'No answer selected'
                      : record.options[record.selectedAnswer]}
                  </p>

                  <p>
                    <strong>Correct Answer: </strong>
                    {record.options[record.correctAnswer]}
                  </p>
                </article>
              ))}
            </div>

            <button
              type="button"
              className="start-button"
              onClick={() => setScreen('result')}
            >
              Back to Results
            </button>

            <button
              type="button"
              className="back-button"
              onClick={goHome}
            >
              Back to Categories
            </button>
          </>
        )}

        {screen === 'history' && (
          <>
            <h1>Quiz History</h1>

            <p className="subtitle">
              Review your previous quiz attempts.
            </p>

            {storageMessage && (
              <p className="history-message" role="alert">
                {storageMessage}
              </p>
            )}

            {history.length === 0 ? (
              <div className="history-empty">
                <h2>No Quiz History Yet</h2>
                <p>
                  Complete a quiz to see your results here.
                </p>
              </div>
            ) : (
              <>
                <p className="history-count">
                  Total Attempts: {history.length}
                </p>

                <div className="history-list">
                  {history.map(attempt => (
                    <article
                      className="history-item"
                      key={attempt.id}
                    >
                      <div className="history-item-header">
                        <h3>{attempt.category}</h3>
                        <span>{attempt.percentage}%</span>
                      </div>

                      <p>
                        Score: {attempt.score} / {attempt.total}
                      </p>

                      <p className="history-date">
                        {formatDate(attempt.completedAt)}
                      </p>
                    </article>
                  ))}
                </div>

                <button
                  type="button"
                  className="clear-history-button"
                  onClick={clearHistory}
                >
                  Clear Quiz History
                </button>
              </>
            )}

            <button
              type="button"
              className="back-button"
              onClick={goHome}
            >
              Back to Categories
            </button>
          </>
        )}
      </div>
    </main>
  )
}

export default App
