import type { Question, QuestionStats } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export async function getQuestions(): Promise<Question[]> {
  const res = await fetch(`${API_URL}/questions`)
  if (!res.ok) throw new Error('질문을 불러오지 못했습니다.')
  return res.json()
}

export async function getQuestionStats(questionId: string): Promise<QuestionStats> {
  const res = await fetch(`${API_URL}/questions/${questionId}/stats`)
  if (!res.ok) throw new Error('통계를 불러오지 못했습니다.')
  return res.json()
}

export async function submitVote(data: {
  question_id: string
  mbti: string
  choice: 'A' | 'B'
}): Promise<void> {
  const res = await fetch(`${API_URL}/votes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('투표 제출에 실패했습니다.')
}

export function createSSEConnection(
  onStats: (stats: QuestionStats) => void
): EventSource {
  const es = new EventSource(`${API_URL}/stream`)
  es.onmessage = (event) => {
    const data = JSON.parse(event.data)
    if (data.type === 'connected') return
    onStats(data as QuestionStats)
  }
  return es
}
