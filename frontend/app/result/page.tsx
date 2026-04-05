import { Suspense } from 'react'
import ResultClient from '@/components/ResultClient'

export default function ResultPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <Suspense fallback={<div className="text-gray-400">결과 계산 중...</div>}>
        <ResultClient />
      </Suspense>
    </main>
  )
}
