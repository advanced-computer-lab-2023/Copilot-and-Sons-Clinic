import { AuthenticatedRoute } from '@/components/AuthenticatedRoute'
import { useSidebar } from '@/hooks/sidebar'
import {
  DocumentScannerOutlined,
  Group,
  Healing,
  MedicalInformation,
  VpnKey,
} from '@mui/icons-material'
import { UserType } from 'clinic-common/types/user.types'
import { Container } from '@mui/material'
import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import AccessTimeIcon from '@mui/icons-material/AccessTime'

export function PatientDashboardLayout() {
  const { setSidebarLinks } = useSidebar()

  useEffect(() => {
    setSidebarLinks([
      {
        to: '/patient-dashboard/family-members',
        text: 'Family Members',
        icon: <Group />,
      },
      {
        to: '/patient-dashboard/prescriptions',
        text: 'Prescriptions',
        icon: <MedicalInformation />,
      },
      {
        to: '/patient-dashboard/approved-doctors',
        text: 'Doctors',
        icon: <Healing />,
      },
      {
        to: '/patient-dashboard/appointments',
        text: 'Appointments',
        icon: <AccessTimeIcon />,
      },
      {
        to: '/patient-dashboard/health-packages',
        text: 'Health Packages',
        icon: <Healing />,
      },
      {
        to: '/patient-dashboard/MyHealthRecords',
        text: 'Health Records',
        icon: <DocumentScannerOutlined />,
      },
      {
        to: '/patient-dashboard/MyMedicalHistory',
        text: 'Medical History',
        icon: <DocumentScannerOutlined />,
      },
      {
        to: '/patient-dashboard/change-password',
        text: 'Change Password',
        icon: <VpnKey />,
      },
      {
        to: '/patient-dashboard/my-doctors',
        text: 'My Doctors',
        icon: <Healing />,
      },
    ])
  }, [setSidebarLinks])

  return (
    <AuthenticatedRoute requiredUserType={UserType.Patient}>
      <Container maxWidth="xl">
        <Outlet />
      </Container>
    </AuthenticatedRoute>
  )
}
