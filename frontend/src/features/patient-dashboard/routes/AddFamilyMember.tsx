import { useAuth } from '@/hooks/auth'
import { AddFamilyMemberRequest } from 'clinic-common/types/familyMember.types'
import { AddFamilyMemberRequestValidator } from 'clinic-common/validators/familyMembers.validator'
import { addFamilyMember } from '@/api/familyMembers'
import { ApiForm } from '@/components/ApiForm'
import { useState } from 'react'
import { LinkFamilyMember } from './LinkFamilyMember'
import { Button, Stack } from '@mui/material'

export function AddFamilyMember({ onSuccess }: { onSuccess: () => void }) {
  const [isLinkingExistingAccount, setIsLinkingExistingAccount] =
    useState(false)
  const { user } = useAuth()

  const handleLinkExistingAccount = () => {
    setIsLinkingExistingAccount(true)
  }

  return (
    <>
      {!isLinkingExistingAccount && (
        <Stack spacing={2}>
          <ApiForm<AddFamilyMemberRequest>
            fields={[
              { label: 'Name', property: 'name' },
              { label: 'National ID', property: 'nationalId' },
              { label: 'Age', property: 'age', valueAsNumber: true },
              {
                label: 'Gender',
                property: 'gender',
                selectedValues: [
                  // TODO: use enum
                  {
                    label: 'Male',
                    value: 'Male',
                  },
                  {
                    label: 'Female',
                    value: 'Female',
                  },
                ],
              },
              {
                label: 'Relation',
                property: 'relation',
                selectedValues: [
                  // TODO: use enum
                  {
                    label: 'Wife',
                    value: 'Wife',
                  },
                  {
                    label: 'Husband',
                    value: 'Husband',
                  },
                  {
                    label: 'Son',
                    value: 'Son',
                  },
                  {
                    label: 'Daughter',
                    value: 'Daughter',
                  },
                ],
              },
            ]}
            validator={AddFamilyMemberRequestValidator}
            successMessage="Added family member successfully"
            action={(data) => addFamilyMember(user!.username, data)}
            onSuccess={onSuccess}
          />
          <Button variant="contained" onClick={handleLinkExistingAccount}>
            Or link existing patient account
          </Button>
        </Stack>
      )}

      {isLinkingExistingAccount && <LinkFamilyMember onSuccess={onSuccess} />}
    </>
  )
}
