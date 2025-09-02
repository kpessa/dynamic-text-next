'use client'

import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { selectUser, setUser, clearError } from '@/features/auth/model/authSlice'
import { selectTheme, toggleTheme } from '@/features/ui/model/uiSlice'
import { setTPNValue, selectTPNValues } from '@/features/tpn-calculations/model/tpnSlice'

export default function ReduxTestPage() {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectUser)
  const theme = useAppSelector(selectTheme)
  const tpnValues = useAppSelector(selectTPNValues)

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Redux Test Page</h1>
      
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Auth State</h2>
        <p>User: {user ? `${user.name} (${user.email})` : 'Not logged in'}</p>
        <button 
          onClick={() => dispatch(setUser({ id: '1', email: 'test@example.com', name: 'Test User' }))}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
        >
          Set User
        </button>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold">UI State</h2>
        <p>Theme: {theme}</p>
        <button 
          onClick={() => dispatch(toggleTheme())}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Toggle Theme
        </button>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold">TPN State</h2>
        <p>Values: {JSON.stringify(tpnValues)}</p>
        <button 
          onClick={() => dispatch(setTPNValue({ key: 'glucose', value: 100 }))}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Set Glucose Value
        </button>
      </div>
    </div>
  )
}