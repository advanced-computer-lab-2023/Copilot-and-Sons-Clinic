import { Router } from 'express'
import { validate } from '../middlewares/validation.middleware'
import { AddAdminValidator } from '../validators/admin.validation'
import { asyncWrapper } from '../utils/asyncWrapper'
import { type AddAdminRequest } from '../types/admin.types'
import { addAdmin } from '../services/admin.service'

export const adminRouter = Router()
adminRouter.post(
  '/',
  validate(AddAdminValidator),
  asyncWrapper<AddAdminRequest>(async (req, res) => {
    const addAdminResponse = await addAdmin(req.body)
    res.send(addAdminResponse)
  })
)