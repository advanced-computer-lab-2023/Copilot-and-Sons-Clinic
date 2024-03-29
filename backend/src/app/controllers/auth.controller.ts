import { Router } from 'express'
import { asyncWrapper } from '../utils/asyncWrapper'
import {
  getEmailAndNameForUsername,
  getUserByUsername,
  isAdmin,
  login,
  registerPatient,
  submitDoctorRequest,
} from '../services/auth.service'
import { validate } from '../middlewares/validation.middleware'
import {
  LoginRequestValidator,
  RegisterRequestValidator,
} from 'clinic-common/validators/user.validator'
import {
  LoginResponse,
  type LoginRequest,
  type RegisterRequest,
  RegisterResponse,
} from 'clinic-common/types/auth.types'
import { allowAuthenticated } from '../middlewares/auth.middleware'
import { NotAuthorizedError } from '../errors/auth.errors'
import {
  GetCurrentUserResponse,
  GetUserByUsernameResponse,
  UserType,
} from 'clinic-common/types/user.types'

import {
  type DoctorStatus,
  RegisterDoctorRequestResponse,
} from 'clinic-common/types/doctor.types'
import { getModelIdForUsername } from '../services/auth.service'
import multer from 'multer'

const storage = multer.memoryStorage() // You can choose a different storage method

const upload = multer({ storage })

export const authRouter = Router()

authRouter.post(
  '/register-patient',
  validate(RegisterRequestValidator),
  asyncWrapper<RegisterRequest>(async (req, res) => {
    const token = await registerPatient(req.body)
    res.send(new RegisterResponse(token))
  })
)

authRouter.post(
  '/login',
  validate(LoginRequestValidator),
  asyncWrapper<LoginRequest>(async (req, res) => {
    const { username, password } = req.body
    const token = await login(username, password)
    res.send(new LoginResponse(token))
  })
)

/**
 * Get the currently logged in user
 */
authRouter.get(
  '/me',
  allowAuthenticated,
  asyncWrapper(async (req, res) => {
    const user = await getUserByUsername(req.username!)
    const { email, name } = await getEmailAndNameForUsername(req.username!)

    res.send({
      id: user.id,
      username: user.username,
      type: user.type as UserType,
      modelId: await getModelIdForUsername(user.username),
      email,
      name,
    } satisfies GetCurrentUserResponse)
  })
)

authRouter.get(
  '/:username',
  allowAuthenticated,
  asyncWrapper(async (req, res) => {
    // Only admins and the user itself can access this endpoint
    if (
      req.params.username !== req.username &&
      !(await isAdmin(req.username as string))
    ) {
      throw new NotAuthorizedError()
    }

    const user = await getUserByUsername(req.params.username)
    const { email, name } = await getEmailAndNameForUsername(
      req.params.username
    )

    res.send({
      id: user.id,
      username: user.username,
      type: user.type as UserType,
      modelId: await getModelIdForUsername(user.username),
      email,
      name,
    } satisfies GetUserByUsernameResponse)
  })
)

// Submit a Request to Register as a Doctor
authRouter.post(
  '/request-doctor',
  upload.array('documents', 50),
  asyncWrapper(async (req, res) => {
    const doctor = await submitDoctorRequest({
      ...req.body,
      documents: req.files as Express.Multer.File[],
    })
    res.send({
      id: doctor.id,
      username: doctor.user.username,
      name: doctor.name,
      email: doctor.email,
      dateOfBirth: doctor.dateOfBirth,
      hourlyRate: doctor.hourlyRate,
      affiliation: doctor.affiliation,
      educationalBackground: doctor.educationalBackground,
      speciality: doctor.speciality,
      requestStatus: doctor.requestStatus as DoctorStatus,
    } satisfies RegisterDoctorRequestResponse)
  })
)
