import { Router } from 'express'
import { supabase } from '../db/supabase'
import type { MbtiType, QuestionStats } from '../types'

const router = Router()

// GET /questions — 활성 질문 목록 (랜덤 순서)
router.get('/', async (_req, res) => {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false })

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }

  // 랜덤 셔플
  const shuffled = data.sort(() => Math.random() - 0.5)
  res.json(shuffled)
})

// GET /questions/:id/stats — 질문별 MBTI 통계
router.get('/:id/stats', async (req, res) => {
  const { id } = req.params

  const { data: votes, error } = await supabase
    .from('votes')
    .select('mbti, choice')
    .eq('question_id', id)

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }

  const mbtiList: MbtiType[] = [
    'INTJ', 'INTP', 'ENTJ', 'ENTP',
    'INFJ', 'INFP', 'ENFJ', 'ENFP',
    'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
    'ISTP', 'ISFP', 'ESTP', 'ESFP',
  ]

  const mbti_breakdown = Object.fromEntries(
    mbtiList.map((m) => [m, { a: 0, b: 0 }])
  ) as Record<MbtiType, { a: number; b: number }>

  let a_count = 0
  let b_count = 0

  for (const vote of votes) {
    if (vote.choice === 'A') {
      a_count++
      mbti_breakdown[vote.mbti as MbtiType].a++
    } else {
      b_count++
      mbti_breakdown[vote.mbti as MbtiType].b++
    }
  }

  const stats: QuestionStats = {
    question_id: id,
    total: votes.length,
    a_count,
    b_count,
    mbti_breakdown,
  }

  res.json(stats)
})

export default router
