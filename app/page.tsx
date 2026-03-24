import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MessageCircle, Users, Heart, Zap } from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/feed')
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">SC</span>
            </div>
            <span className="font-semibold">SocialConnect</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Sign up</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="container px-4 py-16 md:py-24 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              Connect with the world around you
            </h1>
            <p className="mt-6 text-pretty text-lg text-muted-foreground md:text-xl">
              Share your thoughts, follow interesting people, and join the conversation. 
              SocialConnect is where communities are built and ideas spread.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/register">Get started</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/users">Explore users</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t bg-muted/30 py-16 md:py-24">
          <div className="container px-4">
            <h2 className="text-center text-2xl font-bold md:text-3xl">
              Everything you need to connect
            </h2>
            <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <MessageCircle className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-4 font-semibold">Share Posts</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Express yourself in 280 characters with text and images
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-4 font-semibold">Follow People</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Build your network and discover interesting accounts
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-4 font-semibold">Like & Comment</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Engage with posts through likes and comments
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-4 font-semibold">Real-time Feed</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Stay updated with a personalized chronological feed
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24">
          <div className="container px-4 text-center">
            <h2 className="text-2xl font-bold md:text-3xl">
              Ready to join the conversation?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Create your free account and start connecting today.
            </p>
            <Button size="lg" className="mt-8" asChild>
              <Link href="/register">Create account</Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 px-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            Built with Next.js, Supabase, and shadcn/ui
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/users" className="hover:text-foreground">
              Discover
            </Link>
            <Link href="/login" className="hover:text-foreground">
              Log in
            </Link>
            <Link href="/register" className="hover:text-foreground">
              Sign up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
