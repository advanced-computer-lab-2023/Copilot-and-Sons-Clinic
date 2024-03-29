import * as zod from 'zod'

export const RegisterRequestValidator = zod.object({
  username: zod
    .string()
    .min(3)
    .max(255)
    .regex(/^[a-zA-Z0-9_]+$/),
  password: zod
    .string()
    .min(8)
    .refine(
      (password: any) => {
        const hasLowercase = /[a-z]/.test(password)
        const hasUppercase = /[A-Z]/.test(password)
        const hasDigit = /\d/.test(password)
        const hasSymbol = /[!@#$%^&*()_+{}[\]:;<>,.?~\\-]/.test(password)

        return hasLowercase && hasUppercase && hasDigit && hasSymbol
      },
      {
        message:
          'Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character.',
      }
    ),
  name: zod.string().min(3).max(255),
  email: zod.string().email(),
  mobileNumber: zod.string().min(11).max(11),
  dateOfBirth: zod.coerce.date(),
  gender: zod.string().min(3).max(255),
  emergencyContact: zod.object({
    fullName: zod.string().min(3).max(255),
    mobileNumber: zod.string().min(11).max(11),
    relation: zod.string().min(3).max(255),
  }),
})

export const LoginRequestValidator = zod.object({
  username: zod.string().min(1),
  password: zod.string().min(1),
})
