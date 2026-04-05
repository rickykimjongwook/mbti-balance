import MbtiSelector from '@/components/MbtiSelector'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl text-center">
        <div className="mb-2 text-4xl">⚖️</div>
        <h1 className="text-4xl font-bold mb-3 tracking-tight">
          MBTI 밸런스 게임
        </h1>
        <p className="text-gray-400 text-lg mb-10">
          당신의 MBTI는 어떤 선택을 할까요?<br />
          실시간으로 같은 MBTI의 선택을 확인해보세요.
        </p>
        <MbtiSelector />
      </div>
    </main>
  )
}
