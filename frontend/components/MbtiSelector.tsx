'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MBTI_LIST, MBTI_EMOJI } from '@/lib/mbti'
import type { MbtiType } from '@/types'

export default function MbtiSelector() {
  const [selected, setSelected] = useState<MbtiType | null>(null)
  const router = useRouter()

  function handleStart() {
    if (!selected) return
    router.push(`/play?mbti=${selected}`)
  }

  return (
    <div>
      <p className="text-gray-300 font-medium mb-4">내 MBTI를 선택하세요</p>
      <div className="grid grid-cols-4 gap-2 mb-8">
        {MBTI_LIST.map((mbti) => (
          <button
            key={mbti}
            onClick={() => setSelected(mbti)}
            className={`
              py-3 px-2 rounded-xl font-bold text-sm transition-all
              ${selected === mbti
                ? 'bg-violet-600 text-white scale-105 shadow-lg shadow-violet-500/30'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }
            `}
          >
            <span className="block text-lg mb-1">{MBTI_EMOJI[mbti]}</span>
            {mbti}
          </button>
        ))}
      </div>
      <button
        onClick={handleStart}
        disabled={!selected}
        className="w-full py-4 rounded-2xl font-bold text-lg bg-violet-600 hover:bg-violet-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-all"
      >
        {selected ? `${selected}로 시작하기 →` : 'MBTI를 선택해주세요'}
      </button>
    </div>
  )
}
