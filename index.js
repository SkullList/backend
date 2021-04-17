import express from 'express'
import cors from 'cors'
import { join } from 'path'
import { readFileSync } from 'fs'
import { BotModel, UserModel } from './modules/database/database.module.js'
import userModule from './modules/user.module.js'
import botModule from './modules/bot.module.js'

const config = JSON.parse(readFileSync(join(process.cwd(), 'config.json')))

const app = express()

app.use(cors({ origin: [config.frontend.url] }))
app.use(express.json())

app.use('/bots', botModule(BotModel))
app.use('/users', userModule(UserModel))

app.listen(config.port, console.log('listen on port ' + config.port))
