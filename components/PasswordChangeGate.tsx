'use client'

import { useSession } from 'next-auth/react'
import ForcePasswordChange from './ForcePasswordChange'

export default function PasswordChangeGate() {
  const { data: session } = useSession()

  if (!session?.user?.mustChangePassword) return null

  return <ForcePasswordChange email={session.user.email ?? ''} />
}
