import { addAvailableTimeSlots, getDoctor } from '@/api/doctor'
import { CardPlaceholder } from '@/components/CardPlaceholder'
import { useAuth } from '@/hooks/auth'
import {
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import AddIcon from '@mui/icons-material/Add'
import { DateTimePicker, renderTimeViewClock } from '@mui/x-date-pickers'
import { useState } from 'react'
import dayjs from 'dayjs'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { DataGrid, GridColDef } from '@mui/x-data-grid'

export function ViewMyAvailableTimeSlots() {
  const [fromDate, setFromDate] = useState(dayjs)
  const [ToDate, setToDate] = useState(dayjs)
  const { user } = useAuth()
  const query = useQuery({
    queryFn: () => getDoctor(user!.username),
  })

  if (query.isLoading) {
    return <CardPlaceholder />
  }

  if (query.data?.availableTimes == null) {
    return (
      <Button size="small" startIcon={<AddIcon />}>
        Add Available Time Slots
      </Button>
    )
  }

  function handleAdd() {
    const fromTime = fromDate.toDate()
    const toTime = ToDate.toDate()
    const currentDate = new Date()
    const timeSlots = []

    if (
      currentDate.getMonth() !== fromTime.getMonth() ||
      currentDate.getFullYear() !== fromTime.getFullYear()
    )
      toast.error('You should enter dates within this month and year')
    else if (fromTime.getDate() !== toTime.getDate())
      toast.error('The from date and To date must be on the same day')
    else if (
      fromTime.getHours() > toTime.getHours() ||
      (fromTime.getHours() == toTime.getHours() &&
        fromTime.getMinutes() >= toTime.getMinutes())
    )
      toast.error('The from time must be before the to time')
    else if (fromTime.getTime() <= currentDate.getTime())
      toast.error('You can only add future dates')
    else {
      for (
        let i = 0;
        i <
        Math.floor((toTime.getTime() - fromTime.getTime()) / (1000 * 60 * 60));
        i++
      ) {
        const startDateTime = new Date(fromTime.getTime() + i * 1000 * 60 * 60)
        timeSlots.push(startDateTime)
      }

      timeSlots.forEach((time) => {
        addAvailableTimeSlots({ time }).then(() => {
          query.refetch()
        })
      })

      toast.success('Time slot(s) added successfully')
    }
  }

  const columns: GridColDef[] = [
    {
      field: 'day',
      headerName: 'Day',
      flex: 1,
      editable: false,
    },
    {
      field: 'date',
      headerName: 'Date',
      editable: false,
      flex: 1,
    },
    {
      field: 'time',
      headerName: 'Time',
      editable: false,
      flex: 1,
    },
  ]

  return (
    <>
      <ToastContainer />
      <Stack direction="row" justifyContent="space-between" spacing={1}>
        <Card variant="outlined" style={{ width: '70%' }}>
          <CardContent>
            <Stack spacing={2}>
              <Stack
                direction="row"
                spacing={1}
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h6" color="text.secondary">
                  Your available time slots in this month
                </Typography>
              </Stack>

              <Stack direction="row" alignItems="center">
                <DataGrid
                  autoHeight
                  rows={
                    query.data?.availableTimes
                      .map((data) => new Date(data))
                      .filter((data) => data.getTime() > Date.now())
                      .sort((a, b) => a.getTime() - b.getTime())
                      .map((data, i) => {
                        const dateString = data.toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'numeric',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: 'numeric',
                          hour12: true,
                        })
                        const dateObj = new Date(dateString)
                        const dayNumber = dateObj.getDay()
                        const weekday = [
                          'Sunday',
                          'Monday',
                          'Tuesday',
                          'Wednesday',
                          'Thursday',
                          'Friday',
                          'Saturday',
                        ][dayNumber]
                        const minutes = dateObj.getMinutes()
                        let string = ' '

                        if (minutes < 10) {
                          string = '0'
                        }

                        return {
                          id: i,
                          day: weekday,
                          date:
                            dateObj.getMonth() +
                            1 +
                            '/' +
                            dateObj.getDate() +
                            '/' +
                            dateObj.getFullYear(),
                          time:
                            dateObj.getHours() +
                            ':' +
                            string +
                            dateObj.getMinutes(),
                        }
                      }) || []
                  }
                  columns={columns}
                  style={{ display: 'flex', width: '100%' }}
                />
              </Stack>
            </Stack>
          </CardContent>
        </Card>
        <Grid item xl={3}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Stack
                  direction="row"
                  spacing={1}
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="h6" color="text.secondary">
                    Add the time slots you are available in within this month
                  </Typography>
                </Stack>
                <Stack direction="column" spacing={1}>
                  <DateTimePicker
                    label="From"
                    value={fromDate}
                    onChange={(newValue) => setFromDate(newValue!)}
                    viewRenderers={{
                      hours: renderTimeViewClock,
                      minutes: renderTimeViewClock,
                      seconds: renderTimeViewClock,
                    }}
                  />
                  <DateTimePicker
                    label="To"
                    value={ToDate}
                    onChange={(newValue) => setToDate(newValue!)}
                    viewRenderers={{
                      hours: renderTimeViewClock,
                      minutes: renderTimeViewClock,
                      seconds: renderTimeViewClock,
                    }}
                  />
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => {
                      handleAdd()
                    }}
                  >
                    Add Time Slot
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Stack>
    </>
  )
}
