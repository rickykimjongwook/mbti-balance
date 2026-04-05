import type { MbtiType } from '@/types'

export const MBTI_LIST: MbtiType[] = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
]

export const MBTI_COLOR: Record<MbtiType, string> = {
  INTJ: '#4F46E5', INTP: '#7C3AED', ENTJ: '#DB2777', ENTP: '#DC2626',
  INFJ: '#2563EB', INFP: '#0891B2', ENFJ: '#059669', ENFP: '#D97706',
  ISTJ: '#374151', ISFJ: '#6B7280', ESTJ: '#92400E', ESFJ: '#B45309',
  ISTP: '#1E40AF', ISFP: '#065F46', ESTP: '#991B1B', ESFP: '#92400E',
}

export const MBTI_EMOJI: Record<MbtiType, string> = {
  INTJ: '🏰', INTP: '🔬', ENTJ: '⚔️', ENTP: '💡',
  INFJ: '🌙', INFP: '🌸', ENFJ: '🌟', ENFP: '🎨',
  ISTJ: '📋', ISFJ: '🛡️', ESTJ: '📊', ESFJ: '🤝',
  ISTP: '🔧', ISFP: '🎭', ESTP: '🏄', ESFP: '🎉',
}
