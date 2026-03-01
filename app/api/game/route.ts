import { NextRequest, NextResponse } from 'next/server'
import { TRIVIA_QUESTIONS, shuffleQuestions } from '@/lib/trivia-questions'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const count = Math.min(parseInt(searchParams.get('count') || '10'), 20)

  const questions = shuffleQuestions(TRIVIA_QUESTIONS, count)

  // Return questions — client will handle answer validation
  return NextResponse.json(questions)
}
