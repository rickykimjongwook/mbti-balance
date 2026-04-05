'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { getQuestions, submitVote, createSSEConnection } from '@/lib/api'
import type { Question, QuestionStats, UserChoice, MbtiType } from '@/types'
import { MBTI_EMOJI } from '@/lib/mbti'
import StatsBar from './StatsBar'

export default function PlayClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const mbti = searchParams.get('mbti') as MbtiType | null

  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userChoice, setUserChoice] = useState<'A' | 'B' | null>(null)
  const [stats, setStats] = useState<QuestionStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)
  const [choices, setChoices] = useState<UserChoice[]>([])
  const [loading, setLoading] = useState(true)
  const esRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!mbti) {
      router.replace('/')
      return
    }

    getQuestions().then((qs) => {
      setQuestions(qs.slice(0, 10)) // 최대 10문항
      setLoading(false)
    })

    // SSE 연결
    esRef.current = createSSEConnection((newStats) => {
      setStats(newStats)
      setStatsLoading(false)
    })

    return () => {
      esRef.current?.close()
    }
  }, [mbti, router])

  async function handleChoice(choice: 'A' | 'B') {
    if (userChoice || !mbti) return
    const question = questions[currentIndex]

    setUserChoice(choice)
    setStatsLoading(true)
    setChoices((prev) => [...prev, { question_id: question.id, choice }])

    await submitVote({ question_id: question.id, mbti, choice })
  }

  function handleNext() {
    if (currentIndex + 1 >= questions.length) {
      // 결과 페이지로
      const choicesParam = encodeURIComponent(JSON.stringify(choices))
      router.push(`/result?mbti=${mbti}&choices=${choicesParam}`)
      return
    }
    setCurrentIndex((i) => i + 1)
    setUserChoice(null)
    setStats(null)
    setStatsLoading(false)
  }

  if (!mbti) return null
  if (loading) return <div className="text-gray-400 text-lg">질문을 불러오는 중...</div>
  if (questions.length === 0) return <div className="text-gray-400 text-lg">질문이 없습니다.</div>

  const question = questions[currentIndex]
  const progress = ((currentIndex + 1) / questions.length) * 100

  return (
    <div className="w-full max-w-xl">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-gray-400 text-sm">
          {currentIndex + 1} / {questions.length}
        </span>
        <span className="font-bold text-violet-400">
          {MBTI_EMOJI[mbti]} {mbti}
        </span>
      </div>

      {/* 진행바 */}
      <div className="h-1.5 bg-gray-800 rounded-full mb-8">
        <div
          className="h-1.5 bg-violet-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 카테고리 */}
      {question.category && (
        <div className="text-center mb-4">
          <span className="text-xs text-violet-400 bg-violet-400/10 px-3 py-1 rounded-full">
            {question.category}
          </span>
        </div>
      )}

      {/* 선택 카드 */}
      <div className="flex flex-col gap-4 mb-6">
        {(['A', 'B'] as const).map((choice) => {
          const text = choice === 'A' ? question.option_a : question.option_b
          const isChosen = userChoice === choice
          const isOther = userChoice !== null && userChoice !== choice

          return (
            <button
              key={choice}
              onClick={() => handleChoice(choice)}
              disabled={userChoice !== null}
              className={`
                relative p-6 rounded-2xl text-left font-medium text-lg transition-all
                ${!userChoice ? 'bg-gray-800 hover:bg-gray-700 hover:scale-[1.02] cursor-pointer' : ''}
                ${isChosen ? 'bg-violet-600 text-white scale-[1.02] shadow-lg shadow-violet-500/30' : ''}
                ${isOther ? 'bg-gray-800/50 text-gray-500' : ''}
              `}
            >
              <span className="text-violet-400 font-bold mr-3">{choice}</span>
              {text}
              {isChosen && (
                <span className="absolute top-4 right-4 text-white">✓</span>
              )}
            </button>
          )
        })}
      </div>

      {/* 실시간 통계 */}
      {userChoice && (
        <div className="mb-6">
          {statsLoading ? (
            <div className="bg-gray-800/60 rounded-2xl p-5 flex items-center justify-center gap-3 text-gray-400">
              <span className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce [animation-delay:300ms]" />
              </span>
              <span className="text-sm">결과 집계 중...</span>
            </div>
          ) : stats && stats.question_id === question.id ? (
            <StatsBar stats={stats} myMbti={mbti} myChoice={userChoice} />
          ) : null}
        </div>
      )}

      {/* 다음 버튼 */}
      {userChoice && (
        <button
          onClick={handleNext}
          disabled={statsLoading}
          className="w-full py-4 rounded-2xl font-bold text-lg transition-all
            bg-violet-600 hover:bg-violet-500
            disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
        >
          {currentIndex + 1 >= questions.length ? '결과 보기 🎉' : '다음 질문 →'}
        </button>
      )}
    </div>
  )
}
