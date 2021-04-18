import express from 'express'
const { Router } = express

const router = Router()

// IN-DEV

export default function userModule (UserModel) {
  router.get('/:id', (req, res) => {
    res.send('indev')
  })

  return router
}
