import { AuthenticatedRoute } from '@/components/AuthenticatedRoute'
import { useSidebar } from '@/hooks/sidebar'
import { UserType } from 'clinic-common/types/user.types'
import { Person, Wallet } from '@mui/icons-material'
import Container from '@mui/material/Container'
import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import GroupIcon from '@mui/icons-material/Group'
import { useAuth } from '@/hooks/auth'
import { useQuery } from '@tanstack/react-query'
import { CardPlaceholder } from '@/components/CardPlaceholder'
import { Typography } from '@mui/material'
import { getDoctor } from '@/api/doctor'
import { DoctorStatus } from 'clinic-common/types/doctor.types'
import VisibilityIcon from '@mui/icons-material/Visibility'

export function DoctorDashboardLayout() {
  const { setSidebarLinks } = useSidebar()
  const { user } = useAuth()

  const doctorQuery = useQuery({
    queryKey: ['doctor', user!.username],
    queryFn: () => getDoctor(user!.username),
    enabled: !!user,
  })

  useEffect(() => {
    if (!user) {
      return
    }

    if (doctorQuery.data?.requestStatus != DoctorStatus.Approved) {
      setSidebarLinks([])

      return
    }

    setSidebarLinks([
      {
        to: '/doctor-dashboard/profile',
        text: 'Update Details',
        icon: <Person />,
      },
      {
        to: '/doctor-dashboard/appointments',
        text: 'Appoitments',
        icon: <AccessTimeIcon />,
      },
      {
        to: '/doctor-dashboard/view-patients',
        text: 'View Patients',
        icon: <GroupIcon />,
      },
      {
        to: '/doctor-dashboard/view-my-available-time-slots',
        text: 'View My Available Time Slots',
        icon: <VisibilityIcon />,
      },
      {
        to: '/doctor-dashboard/wallet',
        text: 'Wallet',
        icon: <Wallet />,
      },
    ])
  }, [setSidebarLinks, user, doctorQuery.data?.requestStatus])

  if (!user) {
    return <Navigate to="/" />
  }

  if (doctorQuery.isLoading) {
    return <CardPlaceholder />
  }

  if (doctorQuery.data?.requestStatus == DoctorStatus.Pending) {
    return (
      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mt: 2 }}>
          Your account is not approved yet
        </Typography>
      </Container>
    )
  }

  if (doctorQuery.data?.requestStatus == DoctorStatus.Rejected) {
    return (
      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mt: 2 }}>
          Your account is rejected
        </Typography>
      </Container>
    )
  }

  return (
    <AuthenticatedRoute requiredUserType={UserType.Doctor}>
      <Container maxWidth="xl">
        <Container maxWidth="xl">
          <Outlet />
        </Container>
      </Container>
    </AuthenticatedRoute>
  )
}
