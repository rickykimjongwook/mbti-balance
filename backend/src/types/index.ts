export type MbtiType =
  | 'INTJ' | 'INTP' | 'ENTJ' | 'ENTP'
  | 'INFJ' | 'INFP' | 'ENFJ' | 'ENFP'
  | 'ISTJ' | 'ISFJ' | 'ESTJ' | 'ESFJ'
  | 'ISTP' | 'ISFP' | 'ESTP' | 'ESFP'

export interface Question {
  id: string
  option_a: string
  option_b: string
  category: string
  active: boolean
  created_at: string
}

export interface Vote {
  id: string
  question_id: string
  mbti: MbtiType
  choice: 'A' | 'B'
  created_at: string
}

export interface QuestionStats {
  question_id: string
  total: number
  a_count: number
  b_count: number
  mbti_breakdown: Record<MbtiType, { a: number; b: number }>
}

export interface SseClient {
  id: string
  res: import('express').Response
}
