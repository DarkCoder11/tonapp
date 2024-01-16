import express, { json, urlencoded } from 'express'
import { createServer } from 'http'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { connect, connection } from 'mongoose'

import { TelegramBot } from './bot/telegramBot'
import tonRoutes from './routes/tonRoutes'

const connectDB = (): void => {
  connect('mongodb+srv://77gevorgyan77:JC86x0cfp3zYe95y@cluster0.bivgtdk.mongodb.net/').catch(
    (err) => {
      console.log(err.message)
    },
  )

  connection.once('open', () => {
    console.log('>>> Connected to DB')
  })
}

connectDB()

const app = express()
const PORT = 3000

app.use(express.json())
app.use(json())
app.use(cookieParser())
app.use(urlencoded({ extended: true }))
app.use(cors({ origin: true, credentials: true }))

app.use('/api/ton', tonRoutes)

const server = createServer(app)

const telegramBot = new TelegramBot()
telegramBot.setupCommands()
telegramBot.startBot()

server.listen(PORT, async () => {
  console.log(`>>> Server running on port ${PORT}`)
})
