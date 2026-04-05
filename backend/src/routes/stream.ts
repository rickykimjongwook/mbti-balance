import { Router } from 'express'
import type { Response } from 'express'
import type { QuestionStats, SseClient } from '../types'

const router = Router()

// 연결된 SSE 클라이언트 목록
const clients: SseClient[] = []

// 모든 클라이언트에 데이터 브로드캐스트
export function broadcast(stats: QuestionStats) {
  const data = `data: ${JSON.stringify(stats)}\n\n`
  for (const client of clients) {
    client.res.write(data)
  }
}

// GET /stream — SSE 연결
router.get('/', (req, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  const clientId = Date.now().toString()
  const client: SseClient = { id: clientId, res }
  clients.push(client)

  // 연결 확인 메시지
  res.write(`data: ${JSON.stringify({ type: 'connected', clientId })}\n\n`)

  // 클라이언트 연결 해제 시 목록에서 제거
  req.on('close', () => {
    const index = clients.findIndex((c) => c.id === clientId)
    if (index !== -1) clients.splice(index, 1)
  })
})

export default router
