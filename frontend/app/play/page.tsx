import { Suspense } from 'react'
import PlayClient from '@/components/PlayClient'

export default function PlayPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <Suspense fallback={<div className="text-gray-400">로딩 중...</div>}>
        <PlayClient />
      </Suspense>
    </main>
  )
}
