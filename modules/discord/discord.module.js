import Axios from 'axios'
import { join } from 'path'
import NodeCache from 'node-cache'
import { readFileSync } from 'fs'
import moment from 'moment'
import _ from 'lodash'
moment.locale('pt-br')

const config = JSON.parse(readFileSync(join(process.cwd(), 'config.json')))
const { discord, frontend } = config

const discordURL = 'https://discord.com/api/v8'
const botToken = discord.bot.token
const cache = new NodeCache()

const api = Axios.create({
  baseURL: discordURL,
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bot ' + botToken
  }
})

async function getUser (id) {
  let user = cache.get(id)
  if (user === undefined) {
    try {
      user = (await api.get(`/users/${id}`)).data
      cache.set(id, user, 3600)
    } catch (error) {
      return undefined
    }
  }
  return user
}

async function sendVote (bot, user) {
  try {
    await api.post(`/channels/${discord.channels.siteLogs}/messages`, {
      embed: {
        author: {
          name: `${bot.username}`,
          url: `${frontend.url}/bots/${(bot.details.customURL !== null) ? bot.details.customURL : bot._id}`
        },
        description: `**${user.username}#${user.discriminator}** votou no bot **${bot.username}#${bot.discriminator}**`,
        color: '110591',
        footer: {
          text: `${user._id}`
        },
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error(`${moment(new Date()).format('DD/MM/YYYY - HH:mm')} Falha ao enviar o log de Voto`)
  }
}

async function removeFromTestGuild (botId) {
  try {
    await api.delete(`/guilds/${discord.guilds.test}/members/${botId}`)
    return true
  } catch (error) {
    return false
  }
}

async function approveBot (bot, user) {
  await removeFromTestGuild(bot._id)
  try {
    await api.post(`/channels/${discord.channels.siteLogs}/messages`, {
      content: `<@${bot.owner}>`,
      embed: {
        author: {
          name: `${bot.username}`,
          url: `${frontend.url}/bots/${(bot.details.customURL !== null) ? bot.details.customURL : bot._id}`
        },
        description: `O bot \`${bot.username}#${bot.discriminator}\` foi aprovado por \`${user.username}#${user.discriminator}\``,
        color: '110591'
      }
    })
  } catch (error) {
    console.error(`${moment(new Date()).format('DD/MM/YYYY - HH:mm')} Falha ao enviar o log de Aprovação`)
  }

  try {
    const { data: { id } } = await api.post('/users/@me/channels', {
      recipient_id: bot.owner
    })

    await api.post(`/channels/${id}/messages`, {
      embed: {
        title: 'Parabéns!',
        color: 0x7ED321,
        description: `O seu bot \`${bot.username}#${bot.discriminator}\` foi aprovado por \`${user.username}#${user.discriminator}\``
      }
    })
  } catch (error) {
    console.error(`${moment(new Date()).format('DD/MM/YYYY - HH:mm')} Falha ao enviar o log de Aprovação para o dono`)
  }

  try {
    await api.put(`/guilds/${discord.guilds.main}/members/${bot.owner}/roles/${discord.roles.developer}`)
  } catch (error) {

  }

  if (bot.details.anotherOwners !== undefined) {
    for (let i = 0; i < bot.details.anotherOwners.length; i++) {
      const owner = bot.details.anotherOwners[i]
      try {
        await api.put(`/guilds/${discord.guilds.main}/members/${owner}/roles/${discord.roles.developer}`)
      } catch (error) {

      }
    }
  }
}

async function reproveBot (bot, user, reason) {
  await removeFromTestGuild(bot._id)
  try {
    await api.post(`/channels/${discord.channels.siteLogs}/messages`, {
      content: `<@${bot.owner}>`,
      embed: {
        description: `O bot \`${bot.username}#${bot.discriminator}\` foi reprovado por \`${user.username}#${user.discriminator}\``,
        fields: [
          {
            name: 'Motivo:',
            value: (_.isEmpty(reason)) ? 'Sem Motivo informado' : reason
          }
        ],
        color: '110591'
      }
    })
  } catch (error) {
    console.error(`${moment(new Date()).format('DD/MM/YYYY - HH:mm')} Falha ao enviar o log de Reprovação`)
  }

  try {
    const { data: { id } } = await api.post('/users/@me/channels', {
      recipient_id: bot.owner
    })

    await api.post(`/channels/${id}/messages`, {
      embed: {
        title: 'Tente outra vez...',
        color: 0xff0000,
        description: `O seu bot \`${bot.username}#${bot.discriminator}\` foi reprovado por \`${user.username}#${user.discriminator}\``,
        fields: [
          {
            name: 'Motivo:',
            value: (_.isEmpty(reason)) ? 'Sem Motivo informado' : reason
          }
        ],
        footer: {
          text: 'Você pode enviar o bot de novo quando tiver corrigido os os motivos dele ter sido reprovado.'
        }
      }
    })
  } catch (error) {
    console.error(`${moment(new Date()).format('DD/MM/YYYY - HH:mm')} Falha ao enviar o log de Reprovação para o dono`)
  }
}

async function addBot (bot, user) {
  try {
    await api.post(`/channels/${discord.channels.siteLogs}/messages`, {
      content: `<@&${discord.roles.botsVerifier}>`,
      embed: {
        description: `\`${user.username}#${user.discriminator}\` enviou o bot **\`${bot.username}#${bot.discriminator}\`** para a verificação.`,
        color: '110591',
        footer: {
          text: `${user._id}`
        },
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error(`${moment(new Date()).format('DD/MM/YYYY - HH:mm')} Falha ao enviar o log de Verificação`)
  }

  try {
    const { data: { id } } = await api.post('/users/@me/channels', {
      recipient_id: bot.owner
    })

    await api.post(`/channels/${id}/messages`, {
      embed: {
        title: 'O seu bot foi enviado para verificação',
        color: 0xfbff00,
        description: `O seu bot \`${bot.username}#${bot.discriminator}\` foi para a fila de verificação`
      }
    })
  } catch (error) {
    console.error(`${moment(new Date()).format('DD/MM/YYYY - HH:mm')} Falha ao enviar o log de Verificação para o dono`)
  }
}

export { getUser, sendVote, approveBot, reproveBot, addBot }
