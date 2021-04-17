import mongoose from 'mongoose'
import userSchema from './Schema/User.schema.js'
import botSchema from './Schema/Bot.schema.js'
import { join } from 'path'
import { readFileSync } from 'fs'
const { connect, model } = mongoose

const config = JSON.parse(readFileSync(join(process.cwd(), 'config.json')))

connect(config.database.uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
})

const BotModel = model('bots', botSchema)
const UserModel = model('users', userSchema)

export { BotModel, UserModel }
