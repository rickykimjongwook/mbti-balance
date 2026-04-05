import { Router } from 'express'
import { supabase } from '../db/supabase'
import { broadcast } from './stream'
import type { MbtiType, QuestionStats } from '../types'

const router = Router()

// POST /votes — 투표 제출
router.post('/', async (req, res) => {
  const { question_id, mbti, choice } = req.body

  if (!question_id || !mbti || !['A', 'B'].includes(choice)) {
    res.status(400).json({ error: '유효하지 않은 투표 데이터입니다.' })
    return
  }

  const { error } = await supabase
    .from('votes')
    .insert({ question_id, mbti, choice })

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }

  // 투표 후 실시간 통계 계산 → SSE 브로드캐스트
  const { data: votes } = await supabase
    .from('votes')
    .select('mbti, choice')
    .eq('question_id', question_id)

  if (votes) {
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
      question_id,
      total: votes.length,
      a_count,
      b_count,
      mbti_breakdown,
    }

    broadcast(stats)
  }

  res.status(201).json({ success: true })
})

export default router
