import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ThemeToggle } from '@/components/theme-toggle'
import { MessageCircle, Users, Heart, Zap, Sparkles, ArrowRight, Star } from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/feed')
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              SocialConnect
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
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
        <section className="relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
          </div>

          <div className="container px-4 py-16 md:py-24 lg:py-32">
            <div className="mx-auto max-w-4xl text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Star className="h-4 w-4" />
                Connect with amazing people worldwide
              </div>

              <h1 className="text-balance text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
                Connect with the
                <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  world around you
                </span>
              </h1>

              <p className="mt-6 text-pretty text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto leading-relaxed">
                Share your thoughts, follow interesting people, and join the conversation.
                SocialConnect is where communities are built and ideas spread.
              </p>

              <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                <Button size="lg" asChild className="group shadow-lg hover:shadow-xl transition-all duration-300">
                  <Link href="/register" className="flex items-center gap-2">
                    Get started
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild className="backdrop-blur-sm bg-background/50 hover:bg-background/80">
                  <Link href="/users">Explore users</Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="mt-12 flex justify-center gap-8 text-sm text-muted-foreground">
                <div className="text-center">
                  <div className="font-bold text-2xl text-foreground">10+</div>
                  <div>Active users</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-2xl text-foreground">5+</div>
                  <div>Posts shared</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-2xl text-foreground">1+</div>
                  <div>Connections made</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-border/40 bg-gradient-to-b from-muted/20 to-background py-16 md:py-24">
          <div className="container px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold md:text-4xl bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                Everything you need to connect
              </h2>
              <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
                Powerful features designed to help you build meaningful connections
              </p>
            </div>

            <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/40 bg-card/50 backdrop-blur-sm">
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 group-hover:scale-110 transition-transform duration-300">
                    <MessageCircle className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="mt-4 font-semibold text-lg">Share Posts</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Express yourself in 280 characters with text and images
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/40 bg-card/50 backdrop-blur-sm">
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/10 group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-7 w-7 text-blue-500" />
                  </div>
                  <h3 className="mt-4 font-semibold text-lg">Follow People</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Build your network and discover interesting accounts
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/40 bg-card/50 backdrop-blur-sm">
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500/20 to-red-500/10 group-hover:scale-110 transition-transform duration-300">
                    <Heart className="h-7 w-7 text-red-500" />
                  </div>
                  <h3 className="mt-4 font-semibold text-lg">Like & Comment</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Engage with posts through likes and comments
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/40 bg-card/50 backdrop-blur-sm">
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-500/20 to-yellow-500/10 group-hover:scale-110 transition-transform duration-300">
                    <Zap className="h-7 w-7 text-yellow-500" />
                  </div>
                  <h3 className="mt-4 font-semibold text-lg">Real-time Feed</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Stay updated with a personalized chronological feed
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
          <div className="container px-4 text-center">
            <div className="mx-auto max-w-2xl">
              <h2 className="text-3xl font-bold md:text-4xl bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                Ready to join the conversation?
              </h2>
              <p className="mt-4 text-muted-foreground text-lg">
                Create your free account and start connecting today.
              </p>
              <Button size="lg" className="mt-8 shadow-lg hover:shadow-xl transition-all duration-300" asChild>
                <Link href="/register" className="flex items-center gap-2">
                  Create account
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/20 py-8">
        <div className="container flex flex-col items-center justify-between gap-4 px-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm">SocialConnect</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Built with Next.js, Supabase, and shadcn/ui
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/users" className="hover:text-primary transition-colors">
              Discover
            </Link>
            <Link href="/login" className="hover:text-primary transition-colors">
              Log in
            </Link>
            <Link href="/register" className="hover:text-primary transition-colors">
              Sign up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
