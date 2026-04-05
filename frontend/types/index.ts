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

export interface QuestionStats {
  question_id: string
  total: number
  a_count: number
  b_count: number
  mbti_breakdown: Record<MbtiType, { a: number; b: number }>
}

export interface UserChoice {
  question_id: string
  choice: 'A' | 'B'
}
