import express from 'express'
import { getUser } from '../discord/discord.module.js'
import httpError from 'http-errors'
const { Router } = express

const router = Router()

// IN-DEV
// VERIFICAR DADOS PASSADOS PELO USUÁRIO, COMO O LIBRARY E/OU OUTROS!

export default function botModule (BotModel) {
  function verifyBot (bot) {
    const updatedBot = {}
    if (bot.anotherOwners === undefined) {
      updatedBot.anotherOwners = []
    }

    if (bot.detailedDescription === undefined) {
      updatedBot.detailedDescription = null
    }

    if (bot.customURL === undefined) {
      updatedBot.customURL = null
    }

    if (bot.id === undefined) {
      throw new Error('ID can not be undefined!')
    } else if (bot.owner === undefined) {
      throw new Error('Owner can not be undefined!')
    } else if (bot.prefix === undefined) {
      throw new Error('Prefix can not be undefined!')
    } else if (bot.summary === undefined) {
      throw new Error('Summary can not be undefined!')
    } else if (bot.tags === undefined) {
      throw new Error('Tags can not be undefined!')
    } else if (bot.library === undefined) {
      throw new Error('Library can not be undefined!')
    }
    return { ...bot, ...updatedBot }
  }

  router.post('/', async (req, res, next) => {
    try {
      const botBody = req.body
      const { id, username, discriminator, avatar, bot } = await getUser(botBody.id, true)
      if (!bot) {
        throw new Error('User sent was not a Bot')
      }
      const { owner, prefix, library, summary, detailedDescription, customURL, anotherOwners, tags } = verifyBot(botBody)
      const finalBot = { id, username, discriminator, avatar, owner, details: { prefix, library, summary, detailedDescription, customURL, anotherOwners, tags } }
      // const createdBot = new BotModel(finalBot)

      // res.send(createdBot)
      res.send(finalBot)
    } catch (error) {
      const badRequest = httpError(400)
      badRequest.message = `${badRequest.message} - ${error.message}`
      next(badRequest)
    }
  })

  router.get('/', async (req, res) => {
    const params = {
      $and: [
        {
          'details.approvedBy': {
            $ne: null
          }
        }
      ]
    }
    let sortBy = {}
    const { search, sort, tags } = req.query
    let { page } = req.query
    const pageLimit = 20
    if (page === undefined) {
      page = 1
    }

    if (search !== undefined) {
      if (search.length > 0) {
        const regex = { $regex: search, $options: 'i' }
        params.$or = [
          {
            username: regex
          },
          {
            'details.summary': regex
          }
        ]
      }
    }

    if (sort !== undefined) {
      if (sort === 'recent') {
        sortBy = { 'dates.sentAt': -1 }
      } else if (sort === 'mostVoted') {
        sortBy = { 'details.votes.amount': -1 }
      }
    }

    if (tags !== undefined) {
      params.$and = [
        {
          'details.tags': {
            $all: tags
          }
        }
      ]
    }

    const bots = await BotModel
      .find(params)
      .sort(sortBy)
      .limit(pageLimit)
      .skip((page - 1) * pageLimit)
      .exec()

    res.send(bots)
  })

  router.get('/:id', async (req, res) => {
    const { id } = req.params
    const { showOwner } = req.query
    let search = BotModel.findOne({
      $or: [
        {
          _id: id
        },
        {
          'details.customURL': id
        }
      ]
    })

    if (showOwner !== undefined) {
      if (showOwner) {
        search = search
          .populate('owner')
          .populate('details.anotherOwners')
      }
    }

    const bot = await search.exec()
    if (bot === null) {
      return
    }

    res.send(bot)
  })

  return router
}
