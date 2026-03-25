'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { ThemeToggle } from '@/components/theme-toggle'
import { Sparkles, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

export const dynamic = 'force-dynamic'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/feed'

  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()

      // Check if identifier is email
      const isEmail = formData.identifier.includes('@')

      const { error } = await supabase.auth.signInWithPassword({
        email: isEmail ? formData.identifier : `${formData.identifier}@placeholder.com`,
        password: formData.password,
      })

      if (error) {
        // If not email, try to fetch the email from the API
        if (!isEmail) {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          })

          if (!response.ok) {
            const data = await response.json()
            throw new Error(data.error || 'Invalid credentials')
          }

          toast.success('Logged in successfully!')
          router.push(redirect)
          router.refresh()
          return
        }
        throw error
      }

      toast.success('Logged in successfully!')
      router.push(redirect)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Invalid credentials')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="backdrop-blur-sm bg-background/50 hover:bg-background/80">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back home
          </Link>
        </Button>
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md border-border/40 bg-card/50 backdrop-blur-sm shadow-2xl">
        <CardHeader className="space-y-1 text-center pb-6">
          <Link href="/" className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg hover:scale-105 transition-transform duration-300">
            <Sparkles className="h-7 w-7 text-primary-foreground" />
          </Link>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Welcome back
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Sign in to your SocialConnect account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="identifier" className="text-sm font-medium">
                Email or Username
              </Label>
              <Input
                id="identifier"
                type="text"
                placeholder="you@example.com or username"
                value={formData.identifier}
                onChange={(e) => setFormData(prev => ({ ...prev, identifier: e.target.value }))}
                required
                disabled={isLoading}
                className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required
                disabled={isLoading}
                className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pt-6">
            <Button
              type="submit"
              className="w-full h-11 shadow-lg hover:shadow-xl transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              {"Don't have an account?"}{' '}
              <Link href="/register" className="text-primary hover:underline font-medium transition-colors">
                Create one here
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
