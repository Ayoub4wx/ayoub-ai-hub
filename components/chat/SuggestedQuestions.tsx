import { SUGGESTED_QUESTIONS } from '@/constants/suggested-questions'

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void
}

export default function SuggestedQuestions({ onSelect }: SuggestedQuestionsProps) {
  return (
    <div className="px-3 pb-2">
      <p className="text-xs text-muted-foreground mb-2">Try asking:</p>
      <div className="flex flex-wrap gap-1.5">
        {SUGGESTED_QUESTIONS.slice(0, 4).map((q, i) => (
          <button
            key={i}
            onClick={() => onSelect(q)}
            className="text-xs px-2.5 py-1.5 rounded-full bg-secondary hover:bg-accent border border-border text-muted-foreground hover:text-foreground transition-all duration-150 text-left"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  )
}
