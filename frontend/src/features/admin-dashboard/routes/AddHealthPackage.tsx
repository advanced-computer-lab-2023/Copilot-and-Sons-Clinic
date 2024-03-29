import { addHealthPackage } from '@/api/healthPackages'
import { ApiForm } from '@/components/ApiForm'
import { createHealthPackageRequest } from 'clinic-common/types/healthPackage.types'
import { CreateHealthPackageRequestValidator } from 'clinic-common/validators/healthPackage.validator'
import { useNavigate } from 'react-router-dom'

export function AddHealthPackage() {
  const navigate = useNavigate()

  return (
    <ApiForm<createHealthPackageRequest>
      fields={[
        { label: 'Name', property: 'name' },
        {
          label: 'Price Per Year',
          property: 'pricePerYear',
          valueAsNumber: true,
        },
        {
          label: 'Session Discount Percentage',
          property: 'sessionDiscount',
          valueAsNumber: true,
        },
        {
          label: 'Medicine Discount Percentage',
          property: 'medicineDiscount',
          valueAsNumber: true,
        },
        {
          label: 'Family Member Subscribtion Discount Percentage',
          property: 'familyMemberSubscribtionDiscount',
          valueAsNumber: true,
        },
      ]}
      validator={CreateHealthPackageRequestValidator}
      successMessage="Added health package successfully"
      action={(data) => addHealthPackage(data)}
      onSuccess={() => {
        navigate('/admin-dashboard/health-packages')
      }}
    />
  )
}
