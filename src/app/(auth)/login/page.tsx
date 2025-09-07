'use client'

import React from 'react'
import { Typography, TextField, Button, Box, Link } from '@mui/material'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Temporary redirect - will implement actual auth later
    router.push('/')
  }

  return (
    <>
      <Typography component="h1" variant="h5" gutterBottom>
        Sign In
      </Typography>
      <Box component="form" onSubmit={handleLogin} sx={{ mt: 1, width: '100%' }}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          autoFocus
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="current-password"
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          Sign In
        </Button>
        <Box sx={{ textAlign: 'center' }}>
          <Link href="/auth/register" variant="body2">
            {"Don't have an account? Sign Up"}
          </Link>
        </Box>
      </Box>
    </>
  )
}