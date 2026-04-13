import 'next-auth'
import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    email: string
    full_name?: string
    phone?: string
    role: 'user' | 'admin'
    avatar_url?: string
  }

  interface Session {
    user: {
      id: string
      email: string
      full_name?: string
      phone?: string
      role: 'user' | 'admin'
      avatar_url?: string
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: 'user' | 'admin'
    full_name?: string
    phone?: string
  }
}
