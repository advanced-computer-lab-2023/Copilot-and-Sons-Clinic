import { Router } from 'express'
import { asyncWrapper } from '../utils/asyncWrapper'
import {
  createAndRemoveTime,
  getfilteredAppointments,
  createFollowUpAppointment,
  deleteAppointment,
  requestFollowUpAppointment,
  checkForExistingFollowUp,
} from '../services/appointment.service'
import {
  AppointmentStatus,
  GetFilteredAppointmentsResponse,
} from 'clinic-common/types/appointment.types'
import { PatientModel } from '../models/patient.model'
import { DoctorModel } from '../models/doctor.model'
import { type HydratedDocument } from 'mongoose'
import { type UserDocument, UserModel } from '../models/user.model'
import { changeAvailableTimeSlot } from '../services/doctor.service'
import { AppointmentModel } from '../models/appointment.model'
import { NotFoundError } from '../errors'
import { sendAppointmentNotificationToPatient } from '../services/sendNotificationForAppointment'
import AppError from '../utils/appError'

export const appointmentsRouter = Router()

appointmentsRouter.get(
  '/filter',
  asyncWrapper(async (req, res) => {
    const query: any = {}

    const user: HydratedDocument<UserDocument> | null = await UserModel.findOne(
      { username: req.username }
    )

    if (user != null && user.type === 'Patient') {
      const patient = await PatientModel.findOne({ user: user.id })
      query.patientID = patient?.id
    } else if (user != null && user.type === 'Doctor') {
      const doctor = await DoctorModel.findOne({ user: user.id })
      query.doctorID = doctor?.id
    }

    const filterAppointments = await getfilteredAppointments(query)

    const appointmentResponses = await Promise.all(
      filterAppointments.map(async (appointment) => {
        const doctor = await DoctorModel.findById(appointment.doctorID)

        return {
          id: appointment.id,
          patientID: appointment.patientID.toString(),
          doctorID: appointment.doctorID.toString(),
          doctorName: doctor?.name || '',
          doctorTimes:
            doctor?.availableTimes.map((date) => date.toISOString()) || [],
          date: appointment.date,
          familyID: appointment.familyID || '',
          reservedFor: appointment.reservedFor || 'Me',
          status:
            new Date(appointment.date) < new Date() &&
            appointment.status === AppointmentStatus.Upcoming
              ? AppointmentStatus.Completed
              : (appointment.status as AppointmentStatus),
        }
      })
    )

    // Reorder filterAppointments based on appointment status
    appointmentResponses.sort((a, b) => {
      const statusOrder = {
        [AppointmentStatus.Upcoming]: 1,
        [AppointmentStatus.Completed]: 2,
        [AppointmentStatus.Cancelled]: 3,
      }

      return (
        statusOrder[a.status as keyof typeof statusOrder] -
        statusOrder[b.status as keyof typeof statusOrder]
      )
    })

    res.send(new GetFilteredAppointmentsResponse(appointmentResponses))
  })
)

appointmentsRouter.post(
  '/makeappointment',
  asyncWrapper(async (req, res) => {
    const { date, familyID, reservedFor, toPayUsingWallet, sessionPrice } =
      req.body // Assuming the date is sent in the request body intype DaTe

    const user = await UserModel.findOne({ username: req.username })

    if (user != null) {
      if (user.type === 'Patient') {
        const patient = await PatientModel.findOne({ user: user.id })

        if (patient) {
          const doctorID = req.body.doctorid
          const doctor = await DoctorModel.findOne({ _id: doctorID })

          if (patient.walletMoney - toPayUsingWallet < 0) {
            res.status(403).send('Not enough money in wallet')
          } else if (!doctor) {
            res.status(404).send('Issues fetching doctor')
          } else {
            patient.walletMoney -= toPayUsingWallet
            await patient.save()

            doctor.walletMoney += doctor.hourlyRate
            await doctor.save()

            const appointment = await createAndRemoveTime(
              patient.id,
              doctorID,
              date,
              familyID,
              reservedFor,
              sessionPrice,
              doctor.hourlyRate
            )

            if (appointment) {
              res.status(201).json(appointment)
            } else {
              patient.walletMoney += toPayUsingWallet //reverting the wallet money
              await patient.save()

              doctor.walletMoney -= doctor.hourlyRate
              await doctor.save()

              res.status(500).send('Appointment creation failed')
            }
          }
        } else {
          res.status(404).send('Patient not found')
        }
      } else {
        res.status(403).send('Only patients can make appointments')
      }
    } else {
      res.status(401).send('User not found')
    }
  })
)

appointmentsRouter.post(
  '/createFollowUp',
  asyncWrapper(async (req, res) => {
    const appointment = req.body.appointment
    const appointmentID = req.body.appointmentID

    const newAppointment = await createFollowUpAppointment(
      appointment,
      appointmentID
    )
    res.send(newAppointment)
  })
)
appointmentsRouter.get(
  '/checkFollowUp/:appointmentID',
  asyncWrapper(async (req, res) => {
    const { appointmentID } = req.params

    try {
      const hasFollowUp = await checkForExistingFollowUp(appointmentID)
      res.json({ exists: hasFollowUp })
    } catch (error) {
      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json({ exists: true, message: error.message })
      } else {
        res.status(500).json({ message: 'Internal server error' })
      }
    }
  })
)

appointmentsRouter.post(
  '/reschedule',
  asyncWrapper(async (req, res) => {
    changeAvailableTimeSlot(
      req.body.appointment.doctorID,
      req.body.appointment.date,
      req.body.rescheduleDate
    )
    const appointment = await AppointmentModel.findById(req.body.appointment.id)

    if (!appointment) {
      throw new NotFoundError()
    }

    appointment.date = req.body.rescheduleDate
    //appointment.status = AppointmentStatus.Rescheduled
    //appointment.save()
    // const newAppointment = new AppointmentModel({
    //   patientID: appointment.patientID,
    //   doctorID: appointment.doctorID,
    //   date: req.body.rescheduleDate,
    //   familyID: appointment.familyID,
    //   reservedFor: appointment.reservedFor,
    //   status: AppointmentStatus.Upcoming,
    //   paidByPatient: appointment.paidByPatient,
    //   paidToDoctor: appointment.paidToDoctor,
    // })
    await appointment.save()
    sendAppointmentNotificationToPatient(appointment, 'rescheduled')

    res.send(appointment)
  })
)
appointmentsRouter.post(
  '/requestFollowUp',
  asyncWrapper(async (req, res) => {
    const request = await requestFollowUpAppointment(
      req.body.appointmentID,
      req.body.date
    )
    res.send(request)
  })
)

appointmentsRouter.post(
  '/delete/:appointmentId',
  asyncWrapper(async (req, res) => {
    const appointmentId = req.params.appointmentId
    const cancelledByDoctor = req.body.cancelledByDoctor

    try {
      const deletedAppointment = await deleteAppointment(
        appointmentId,
        cancelledByDoctor
      )

      if (!deletedAppointment) {
        res.status(404).send('Error in the DeleteAppointment function')
      } else {
        res.status(200).json(deletedAppointment)
      }
    } catch (error: any) {
      res.status(error.status || 500).send(error.message)
    }
  })
)
