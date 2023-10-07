import * as zod from 'zod'

export const UpdateDoctorRequestValidator = zod.object({
  name: zod.string().min(1).optional(),
  email: zod.string().email().optional(),
  dateOfBirth: zod.date().optional(),
  hourlyRate: zod.number().optional(),
  affiliation: zod.string().min(1).optional(),
  educationalBackground: zod.string().min(1).optional(),
})
