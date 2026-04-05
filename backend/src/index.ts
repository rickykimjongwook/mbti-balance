import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import questionsRouter from './routes/questions'
import votesRouter from './routes/votes'
import streamRouter from './routes/stream'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
].filter(Boolean) as string[]

app.use(cors({
  origin: (origin, callback) => {
    // 서버 간 요청(origin 없음) 또는 허용된 origin이면 통과
    if (!origin || allowedOrigins.some((o) => origin.startsWith(o))) {
      callback(null, true)
    } else {
      callback(new Error(`CORS 차단: ${origin}`))
    }
  },
  credentials: true,
}))

app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/questions', questionsRouter)
app.use('/votes', votesRouter)
app.use('/stream', streamRouter)

app.listen(PORT, () => {
  console.log(`백엔드 서버 실행 중: http://localhost:${PORT}`)
})
