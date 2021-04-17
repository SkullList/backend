import express from 'express'
const { Router } = express

const router = Router()

// IN-DEV

export default function botModule (botModel) {
  router.get('/', (_, res) => {
    const bots = botModel.find({})
    res.send(bots)
  })

  router.get('/:id', (req, res) => {
    const { id } = req.params
    console.log(id)
    res.send(id)
  })

  return router
}
