import * as zod from 'zod'

export const AddFamilyMemberRequestValidator = zod.object({
  name: zod.string().min(3).max(255),
  nationalId: zod.string().min(10).max(10),
  age: zod.number().min(1),
  gender: zod.string().min(3).max(255),
  relation: zod.string().min(3).max(255),
})