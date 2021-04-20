import { getUser } from '../discord/discord.module.js'
import { libraries, botTags } from './dataTypes.js'

export default async function verifyData (bot, BotModel) {
  const { id, owner, prefix, summary, tags, library, anotherOwners } = bot

  return await new Promise((resolve, reject) => {
    try {
      if (id === undefined) {
        reject(new Error('ID can not be undefined!'))
      } else if (owner === undefined) {
        reject(new Error('Owner can not be undefined!'))
      } else if (prefix === undefined) {
        reject(new Error('Prefix can not be undefined!'))
      } else if (summary === undefined) {
        reject(new Error('Summary can not be undefined!'))
      } else if (tags === undefined) {
        reject(new Error('Tags can not be undefined!'))
      } else if (library === undefined) {
        reject(new Error('Library can not be undefined!'))
      }

      BotModel.findById(id).exec()
        .then(result => {
          if (result !== null) {
            reject(new Error('This bot already exists.'))
          }
        })

      const ownersSet = new Set(anotherOwners)
      ownersSet.delete(owner)
      const cleanAnotherOwners = [...ownersSet]
      const cleanTags = [...new Set(tags)]

      if (cleanAnotherOwners.length > 4) {
        reject(new Error('You can only add 4 Another Owners'))
      }

      getUser(id)
        .then(result => {
          if (!result.bot) {
            reject(new Error(`The gived user with id '${id}' is not a bot`))
          }
        })

      getUser(owner)
        .then(result => {
          if (result === undefined) {
            reject(new Error(`The owner with id '${owner}' does not exist on Discord!`))
          }
          if (result.bot) {
            reject(new Error(`The owner with id '${owner}' is a Bot!`))
          }
        })

      if (cleanAnotherOwners.length > 0) {
        cleanAnotherOwners.forEach(async ownerID => {
          const anotherOwner = await getUser(ownerID)
          if (anotherOwner === undefined) {
            reject(new Error(`The another owner with id '${ownerID}' does not exist on Discord!`))
          }
          if (anotherOwner.bot) {
            reject(new Error(`The another owner with id '${ownerID}' is a Bot!`))
          }
        })
      }

      const dbFriendlyTags = []
      cleanTags.forEach(tag => {
        if (!Object.values(botTags).includes(tag)) {
          reject(new Error(`Invalid Tag '${tag}'!`))
        }
        dbFriendlyTags.push(Object.keys(botTags).find(key => botTags[key] === tag))
      })

      if (!Object.values(libraries).includes(library)) {
        reject(new Error(`Invalid Library '${library}'!`))
      }

      const dbFriendlyLibrary = Object.keys(libraries).find(key => libraries[key] === library)

      const updatedBot = {
        ...bot,
        anotherOwners: cleanAnotherOwners,
        tags: dbFriendlyTags,
        library: dbFriendlyLibrary
      }

      setTimeout(() => {
        resolve(updatedBot)
      }, 2000)
    } catch (error) {
      reject(error)
    }
  })
}
