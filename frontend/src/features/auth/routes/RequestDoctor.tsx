import { useState } from 'react'
import Button from '@mui/material/Button'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import {
  TextField,
  Typography,
  Grid,
  RadioGroup,
  Radio,
  Box,
  Container,
  FormControlLabel,
  LinearProgress,
} from '@mui/material'
import { sendDoctorRequest } from '@/api/doctor'
import { LoadingButton } from '@mui/lab'
import { z } from 'zod'
import { CommonSchema } from 'clinic-common/validators/doctorRegister.validator'

export const RequestDoctor = () => {
  const [activeStep, setActiveStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  //mobile number
  const [hourlyRate, setHourlyRate] = useState('')
  const [affilation, setAffilation] = useState('')
  const [educationalBackground, setEducationalBackground] = useState('')
  const [speciality, setSpeciality] = useState('')
  const [fieldValue, setFieldValue] = useState({ files: new Array(3) })

  // Field-specific error messages
  const [nameError, setNameError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [dateOfBirthError, setDateOfBirthError] = useState('')
  const [hourlyRateError, setHourlyRateError] = useState('')
  const [affiliationError, setAffiliationError] = useState('')
  const [educationalBackgroundError, setEducationalBackgroundError] =
    useState('')
  const [specialityError, setSpecialityError] = useState('')

  const steps = [
    'Personal Information',
    'Educational Background',
    'Document Upload',
  ]

  const handleFileChange = (event: any, index: any) => {
    const newFiles = Array.from(event.currentTarget.files)
    setFieldValue((prevValues: any) => {
      const updatedFiles: any = [...prevValues.files]
      updatedFiles[index] = newFiles

      return { ...prevValues, files: updatedFiles }
    })
  }

  const Step1Schema = CommonSchema.pick({
    name: true,
    email: true,
    username: true,
    password: true,
    dateOfBirth: true,
    hourlyRate: true,
    affiliation: true,
  }).partial()
  const Step2Schema = CommonSchema.pick({
    educationalBackground: true,
    speciality: true,
  }).partial()
  // const Step3Schema = CommonSchema.pick({ documents: true }).partial();

  const validateStep1 = () => {
    try {
      Step1Schema.parse({
        name,
        email,
        username,
        password,
        dateOfBirth: new Date(dateOfBirth),
        hourlyRate: Number(hourlyRate),
        affiliation: affilation,
      })
      setNameError('')
      setEmailError('')
      setUsernameError('')
      setPasswordError('')
      setHourlyRateError('')
      setAffiliationError('')

      console.log(hourlyRate == '')

      if (hourlyRate === '') {
        setHourlyRateError('Enter  hourly Rate')

        return false
      }

      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        setNameError(
          error.errors.find((err) => err.path[0] === 'name')?.message || ''
        )
        setEmailError(
          error.errors.find((err) => err.path[0] === 'email')?.message || ''
        )
        setUsernameError(
          error.errors.find((err) => err.path[0] === 'username')?.message || ''
        )
        setPasswordError(
          error.errors.find((err) => err.path[0] === 'password')?.message || ''
        )
        setHourlyRateError(
          error.errors.find((err) => err.path[0] === 'hourlyRate')?.message ||
            ''
        )
        setAffiliationError(
          error.errors.find((err) => err.path[0] === 'affiliation')?.message ||
            ''
        )
        setDateOfBirthError(
          error.errors.find((err) => err.path[0] === 'dateOfBirth')?.message ||
            ''
        )

        if (hourlyRate === '') {
          setHourlyRateError('Enter  hourly Rate')
        }
      }

      return false
    }
  }

  const validateStep2 = () => {
    try {
      Step2Schema.parse({
        educationalBackground,
        speciality,
      })
      setEducationalBackgroundError('')
      setSpecialityError('')

      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        setEducationalBackgroundError(
          error.errors.find((err) => err.path[0] === 'educationalBackground')
            ?.message || ''
        )
        console.log(error.errors)
        setSpecialityError(
          error.errors.find((err) => err.path[0] === 'speciality')?.message ||
            ''
        )
      }

      return false
    }
  }

  const handleNext = () => {
    switch (activeStep) {
      case 0:
        if (validateStep1()) {
          setActiveStep((prevStep) => prevStep + 1)
        }

        break
      case 1:
        if (validateStep2()) {
          setActiveStep((prevStep) => prevStep + 1)
        }

        break
      case 2:
        setActiveStep((prevStep) => prevStep + 1)

        break
      default:
        break
    }
  }

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1)
  }

  async function submit(e: any) {
    setIsLoading(true)
    console.log('submit')
    console.log(fieldValue.files)

    e.preventDefault()
    const requiredFields = [
      name,
      email,
      username,
      password,
      dateOfBirth,
      hourlyRate,
      affilation,
      educationalBackground,
      speciality,
    ]

    if (requiredFields.some((field) => field.trim() === '')) {
      toast.error('Please fill out all the required fields.')
      setIsLoading(false)

      return
    }

    // Check if all files are uploaded, if not error
    for (let i = 0; i < fieldValue.files.length; i++) {
      if (fieldValue.files[i] === undefined) {
        toast.error('Please upload all required documents.')
        setIsLoading(false)

        return
      }
    }

    // Check if any file is selected
    if (
      fieldValue.files.some(
        (files: any) => files === undefined || files.length === 0
      )
    ) {
      toast.error('Please choose files for document upload.')

      return
    }

    const formData = new FormData()

    formData.append('name', name)
    formData.append('email', email)
    formData.append('username', username)
    formData.append('password', password)
    formData.append('dateOfBirth', dateOfBirth)
    formData.append('hourlyRate', hourlyRate)
    formData.append('affiliation', affilation)
    formData.append('educationalBackground', educationalBackground)

    formData.append('speciality', speciality)

    for (let i = 0; i < fieldValue.files.length; i++) {
      formData.append('documents', fieldValue.files[i][0])
    }

    console.log(fieldValue.files[0])

    try {
      await sendDoctorRequest(formData)
      toast.success('Your request has been sent successfully')
    } catch (e: any) {
      console.log(e)
      toast.error(e.message)
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="standard-basic"
                label="Name"
                type="text"
                onChange={(e) => {
                  setName(e.target.value)
                }}
                placeholder="Enter your Name"
                value={name}
                required
                error={!!nameError}
                helperText={nameError}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                id="standard-basic"
                onChange={(e) => {
                  setEmail(e.target.value)
                }}
                placeholder="Enter your email address"
                value={email}
                required
                error={!!emailError}
                helperText={emailError}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="standard-basic"
                type="text"
                label="Username"
                onChange={(e) => {
                  setUsername(e.target.value)
                }}
                placeholder="Enter userrname"
                value={username}
                required
                error={!!usernameError}
                helperText={usernameError}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="standard-basic"
                type="password"
                label="Password"
                onChange={(e) => {
                  setPassword(e.target.value)
                }}
                placeholder="Enter password"
                value={password}
                required
                error={!!passwordError}
                helperText={passwordError}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Date of Birth"
                InputLabelProps={{ shrink: true }}
                id="standard-basic"
                type="date"
                onChange={(e) => {
                  setDateOfBirth(e.target.value)
                }}
                placeholder="Enter date of birth"
                value={dateOfBirth}
                required
                error={!!dateOfBirthError}
                helperText={dateOfBirthError}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                id="standard-basic"
                type="number"
                label="Excpected Hourly Rate"
                onChange={(e) => {
                  setHourlyRate(e.target.value)
                }}
                placeholder="Enter hourly rate in EGP"
                value={hourlyRate}
                required
                error={!!hourlyRateError}
                helperText={hourlyRateError}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Affiliation"
                id="standard-basic"
                type="text"
                onChange={(e) => {
                  setAffilation(e.target.value)
                }}
                placeholder="Enter affiliation"
                value={affilation}
                required
                error={!!affiliationError}
                helperText={affiliationError}
              />
            </Grid>
          </Grid>
        )
      case 1:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="standard-basic"
                label="Speciality"
                type="text"
                required
                onChange={(e) => {
                  setSpeciality(e.target.value)
                }}
                placeholder="Enter your speciality"
                value={speciality}
                error={!!specialityError}
                helperText={specialityError}
              />
            </Grid>

            <Grid item xs={12}>
              <label>Select your educational background *</label>

              <RadioGroup
                onChange={(e) => {
                  setEducationalBackground(e.target.value)
                }}
                value={educationalBackground}
              >
                <FormControlLabel
                  value="Associate degree"
                  control={<Radio />}
                  label="Associate degree"
                />
                <FormControlLabel
                  value="Bachelor's degree"
                  control={<Radio />}
                  label="Bachelor's degree"
                />
                <FormControlLabel
                  value="Master's degree"
                  control={<Radio />}
                  label="Master's degree"
                />
                <FormControlLabel
                  value="Doctoral degree"
                  control={<Radio />}
                  label="Doctoral degree"
                />
              </RadioGroup>
              {educationalBackgroundError && (
                <Typography variant="body2" color="error">
                  {educationalBackgroundError}
                </Typography>
              )}
            </Grid>
          </Grid>
        )

      case 2:
        return (
          <Grid container spacing={2}>
            {['ID', 'Medical License', 'Degree'].map((docType, index) => (
              <Grid item xs={12} key={index}>
                <div
                  style={{
                    marginBottom: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <label style={{ marginBottom: '5px', textAlign: 'left' }}>
                    Upload your {docType} *
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      id={`${docType.toLowerCase()}File`}
                      name={`${docType.toLowerCase()}File`}
                      type="file"
                      onChange={(event) => handleFileChange(event, index)}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor={`${docType.toLowerCase()}File`}>
                      <Button
                        component="span"
                        variant="contained"
                        color="primary"
                      >
                        Choose File
                      </Button>
                    </label>
                    {fieldValue.files[index] && fieldValue.files[index][0] && (
                      <div
                        style={{
                          marginLeft: '10px',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <Typography style={{ marginRight: '10px' }}>
                          {fieldValue.files[index][0].name}
                        </Typography>
                      </div>
                    )}
                  </div>
                </div>
              </Grid>
            ))}
          </Grid>
        )

      default:
        return null
    }
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ marginTop: 4 }}>
        {/* Progress Bar */}
        <Typography variant="h4" align="center" gutterBottom>
          Register
        </Typography>
        {/* Progress Bar */}
        <LinearProgress
          variant="determinate"
          value={(activeStep / (steps.length - 1)) * 100}
        />

        {/* Step Indicator */}
        {/* Step Indicator */}
        <Typography variant="h6" align="center" gutterBottom>
          {steps[activeStep]}
        </Typography>
        <form onSubmit={submit}>
          {renderStep()}

          {activeStep == 2 && (
            <Grid container spacing={2} marginTop={'10px'}>
              <LoadingButton
                loading={isLoading}
                type="submit"
                fullWidth
                className="btn btn-primary"
                variant="contained"
              >
                Register
              </LoadingButton>
            </Grid>
          )}
          <div>
            {activeStep > 0 && (
              <LoadingButton onClick={handleBack}>Back</LoadingButton>
            )}
            {activeStep < steps.length - 1 && (
              <LoadingButton onClick={handleNext}>Next</LoadingButton>
            )}
          </div>
        </form>
      </Box>
    </Container>
  )
}

export default RequestDoctor
