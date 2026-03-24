import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { loginSchema } from '@/lib/validation'
import { getProfileByUsername } from '@/lib/db/users'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate input
    const result = loginSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      )
    }
    
    const { identifier, password } = result.data
    
    // Determine if identifier is email or username
    const isEmail = identifier.includes('@')
    let email = identifier
    
    if (!isEmail) {
      // It's a username, need to find the email
      const profile = await getProfileByUsername(identifier)
      if (!profile) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      }
      
      // Get the email from auth.users via admin client
      const supabase = await createClient()
      const { data: userData } = await supabase.auth.admin?.getUserById(profile.id) || { data: null }
      
      if (!userData?.user?.email) {
        // Fall back to trying the identifier as email
        email = identifier
      } else {
        email = userData.user.email
      }
    }
    
    const supabase = await createClient()
    
    // Sign in with email and password
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (authError) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }
    
    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to sign in' },
        { status: 500 }
      )
    }
    
    // Fetch the user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()
    
    return NextResponse.json({
      user: profile,
      access_token: authData.session?.access_token,
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
