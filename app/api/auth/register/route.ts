import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { registerSchema } from '@/lib/validation'
import { checkUsernameExists } from '@/lib/db/users'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate input
    const result = registerSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      )
    }
    
    const { email, username, password, first_name, last_name } = result.data
    
    // Check if username already exists
    const usernameExists = await checkUsernameExists(username)
    if (usernameExists) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 409 }
      )
    }
    
    const supabase = await createClient()
    
    // Create auth user with metadata
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          first_name,
          last_name,
        },
        emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
          `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/feed`,
      },
    })
    
    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }
    
    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }
    
    // Profile is created automatically via trigger
    // Fetch the created profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()
    
    return NextResponse.json({
      user: profile,
      access_token: authData.session?.access_token,
      message: 'Please check your email to confirm your account',
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
