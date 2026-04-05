'use client'

import type { QuestionStats, MbtiType } from '@/types'

interface Props {
  stats: QuestionStats
  myMbti: MbtiType
  myChoice: 'A' | 'B'
}

export default function StatsBar({ stats, myMbti, myChoice }: Props) {
  const aPercent = stats.total > 0 ? Math.round((stats.a_count / stats.total) * 100) : 50
  const bPercent = 100 - aPercent

  const myMbtiStats = stats.mbti_breakdown[myMbti]
  const myMbtiTotal = myMbtiStats.a + myMbtiStats.b
  const myMbtiPercent =
    myMbtiTotal > 0
      ? Math.round(
          ((myChoice === 'A' ? myMbtiStats.a : myMbtiStats.b) / myMbtiTotal) * 100
        )
      : 0

  return (
    <div className="bg-gray-800/60 rounded-2xl p-5">
      {/* 전체 통계 바 */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>A 선택</span>
          <span>전체 {stats.total}명</span>
          <span>B 선택</span>
        </div>
        <div className="flex h-3 rounded-full overflow-hidden">
          <div
            className="bg-violet-500 transition-all duration-700"
            style={{ width: `${aPercent}%` }}
          />
          <div
            className="bg-pink-500 transition-all duration-700"
            style={{ width: `${bPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-sm font-bold mt-1">
          <span className="text-violet-400">{aPercent}%</span>
          <span className="text-pink-400">{bPercent}%</span>
        </div>
      </div>

      {/* 내 MBTI 통계 */}
      {myMbtiTotal > 0 && (
        <div className="border-t border-gray-700 pt-4 text-center">
          <p className="text-sm text-gray-400 mb-1">
            같은 <span className="text-violet-300 font-bold">{myMbti}</span>들 중에서
          </p>
          <p className="text-2xl font-bold text-white">
            {myMbtiPercent}%
            <span className="text-sm font-normal text-gray-400 ml-2">
              가 나랑 같은 선택
            </span>
          </p>
        </div>
      )}
    </div>
  )
}
