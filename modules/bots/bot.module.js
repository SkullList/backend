import express from 'express'
import { getUser } from '../discord/discord.module.js'
import httpError from 'http-errors'
import verifyData from '../utils/verifyData.js'
import { Bot } from './bot.object.js'
const { Router } = express

const router = Router()

// IN-DEV

export default function botModule (BotModel) {
  router.post('/', async (req, res, next) => {
    try {
      const botBody = req.body
      const { id, username, discriminator, avatar } = await getUser(botBody.id)
      const { owner, prefix, library, summary, detailedDescription, customURL, anotherOwners, tags } = await verifyData(botBody, BotModel)
      const finalBot = { _id: id, username, discriminator, avatar, owner, details: { prefix, library, summary, detailedDescription, customURL, anotherOwners, tags } }
      const createdBot = new BotModel(finalBot)
      await createdBot.save()

      res.status(200).end()
    } catch (error) {
      const badRequest = httpError(400)
      badRequest.message = `${badRequest.message} - ${error.message}`
      next(badRequest)
    }
  })

  router.get('/', async (req, res, next) => {
    try {
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

      const botsFound = await BotModel
        .find(params)
        .sort(sortBy)
        .limit(pageLimit)
        .skip((page - 1) * pageLimit)
        .exec()

      const bots = []

      for (const bot of botsFound) {
        bots.push(new Bot(bot))
      }
      res.send(bots)
    } catch (error) {
      const badRequest = httpError(400)
      badRequest.message = `${badRequest.message} - ${error.message}`
      next(badRequest)
    }
  })

  router.get('/:id', async (req, res, next) => {
    try {
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
        throw new Error('The bot was not found')
      }

      res.send(bot)
    } catch (error) {
      const badRequest = httpError(400)
      badRequest.message = `${badRequest.message} - ${error.message}`
      next(badRequest)
    }
  })

  return router
}
