'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import type { MbtiType, UserChoice } from '@/types'
import { MBTI_EMOJI } from '@/lib/mbti'

export default function ResultClient() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const mbti = searchParams.get('mbti') as MbtiType | null
  const choicesParam = searchParams.get('choices')
  const choices: UserChoice[] = choicesParam ? JSON.parse(decodeURIComponent(choicesParam)) : []

  const aCount = choices.filter((c) => c.choice === 'A').length
  const bCount = choices.filter((c) => c.choice === 'B').length
  const total = choices.length

  if (!mbti) {
    router.replace('/')
    return null
  }

  const aPercent = total > 0 ? Math.round((aCount / total) * 100) : 0
  const mbtiEmoji = MBTI_EMOJI[mbti]

  function handleShare() {
    const text = `MBTI 밸런스 게임 결과\n나는 ${mbti} ${mbtiEmoji}\n${aCount}번은 A, ${bCount}번은 B 선택!\n\n#MBTI밸런스게임 #${mbti}`
    if (navigator.share) {
      navigator.share({ text })
    } else {
      navigator.clipboard.writeText(text)
      alert('결과가 클립보드에 복사됐어요!')
    }
  }

  return (
    <div className="w-full max-w-md text-center">
      <div className="text-6xl mb-4">{mbtiEmoji}</div>
      <h1 className="text-3xl font-bold mb-2">{mbti}의 선택 결과</h1>
      <p className="text-gray-400 mb-10">{total}개의 질문을 완료했어요!</p>

      {/* 결과 카드 */}
      <div className="bg-gray-800 rounded-3xl p-8 mb-6">
        <div className="flex justify-around mb-6">
          <div className="text-center">
            <p className="text-5xl font-black text-violet-400 mb-1">{aCount}</p>
            <p className="text-gray-400 text-sm">A 선택</p>
          </div>
          <div className="text-4xl text-gray-600 self-center">vs</div>
          <div className="text-center">
            <p className="text-5xl font-black text-pink-400 mb-1">{bCount}</p>
            <p className="text-gray-400 text-sm">B 선택</p>
          </div>
        </div>

        {/* 선택 바 */}
        <div className="flex h-4 rounded-full overflow-hidden mb-3">
          <div className="bg-violet-500" style={{ width: `${aPercent}%` }} />
          <div className="bg-pink-500" style={{ width: `${100 - aPercent}%` }} />
        </div>

        <p className="text-lg text-gray-200">
          {aPercent >= 70
            ? `${mbti}는 확실한 A파!`
            : aPercent <= 30
            ? `${mbti}는 확실한 B파!`
            : `${mbti}는 상황에 따라 달라요`}
        </p>
      </div>

      {/* 버튼들 */}
      <div className="flex flex-col gap-3">
        <button
          onClick={handleShare}
          className="w-full py-4 rounded-2xl font-bold text-lg bg-violet-600 hover:bg-violet-500 transition-all"
        >
          결과 공유하기 🔗
        </button>
        <button
          onClick={() => router.push('/')}
          className="w-full py-4 rounded-2xl font-bold text-lg bg-gray-800 hover:bg-gray-700 transition-all"
        >
          다시 하기
        </button>
      </div>
    </div>
  )
}
