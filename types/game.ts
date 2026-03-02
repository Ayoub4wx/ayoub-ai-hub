export interface TriviaQuestion {
  id: string
  question: string
  options: [string, string, string, string]
  correctIndex: 0 | 1 | 2 | 3
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
  category: 'models' | 'history' | 'companies' | 'concepts' | 'tools' | 'image_ai' | 'video_ai' | 'coding_ai' | 'ethics' | 'math' | 'prompting'
}

export type GameStatus = 'idle' | 'playing' | 'answered' | 'finished'

export interface GameState {
  status: GameStatus
  questions: TriviaQuestion[]
  currentIndex: number
  score: number
  streak: number
  selectedAnswer: number | null
  timeLeft: number
}
