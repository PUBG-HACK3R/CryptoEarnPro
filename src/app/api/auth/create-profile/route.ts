import { NextRequest, NextResponse } from 'next/server'
import { createUserProfile } from '@/lib/auth-helpers'

export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await request.json()

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'Missing userId or email' },
        { status: 400 }
      )
    }

    const result = await createUserProfile(userId, email)

    if (result.error) {
      console.error('Profile creation error:', result.error)
      return NextResponse.json(
        { error: 'Failed to create user profile', details: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Profile created successfully', profile: result.data },
      { status: 200 }
    )
  } catch (error) {
    console.error('API error creating profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
