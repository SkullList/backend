import express from 'express'
const { Router } = express

const router = Router()

// IN-DEV

export default function userModule (userModel) {
  router.get('/:id', (req, res) => {
    const { id } = req.params
    console.log(id)
    res.send(id)
  })

  return router
}
