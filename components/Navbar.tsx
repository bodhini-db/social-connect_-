'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/theme-toggle'
import { Home, Users, Search, LogOut, User, Settings, Menu, Sparkles } from 'lucide-react'
import type { Profile } from '@/types'

interface NavbarProps {
  user: Profile | null
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    setIsMobileMenuOpen(false)
    router.push('/login')
    router.refresh()
  }

  const getInitials = (profile: Profile) => {
    const first = profile.first_name?.[0] || ''
    const last = profile.last_name?.[0] || ''
    return (first + last).toUpperCase() || profile.username[0].toUpperCase()
  }

  const NavLinks = ({ mobile = false, onLinkClick }: { mobile?: boolean; onLinkClick?: () => void }) => (
    <>
      <Button
        variant="ghost"
        size={mobile ? "default" : "sm"}
        asChild
        className={mobile ? "justify-start" : ""}
        onClick={onLinkClick}
      >
        <Link href="/feed" className="flex items-center gap-2">
          <Home className="h-4 w-4" />
          <span>Feed</span>
        </Link>
      </Button>
      <Button
        variant="ghost"
        size={mobile ? "default" : "sm"}
        asChild
        className={mobile ? "justify-start" : ""}
        onClick={onLinkClick}
      >
        <Link href="/users" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span>Discover</span>
        </Link>
      </Button>
    </>
  )

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href={user ? '/feed' : '/'} className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="hidden font-bold text-lg bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent sm:inline-block">
              SocialConnect
            </span>
          </Link>

          {user && (
            <nav className="hidden items-center gap-1 md:flex">
              <NavLinks />
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {user && (
            <div className="relative hidden w-64 sm:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-9 bg-muted/50 border-0 focus-visible:ring-1"
              />
            </div>
          )}

          {user ? (
            <>
              {/* Desktop Menu */}
              <div className="hidden md:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full hover:bg-muted/50 transition-colors">
                      <Avatar className="h-9 w-9 ring-2 ring-transparent hover:ring-primary/20 transition-all">
                        <AvatarImage src={user.avatar_url || undefined} alt={user.username} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                          {getInitials(user)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center gap-3 p-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar_url || undefined} alt={user.username} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-sm">
                          {getInitials(user)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <p className="text-sm font-medium">{user.first_name} {user.last_name}</p>
                        <p className="text-xs text-muted-foreground">@{user.username}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={`/profile/${user.username}`} className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="text-destructive focus:text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{isLoggingOut ? 'Logging out...' : 'Log out'}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Mobile Menu */}
              <div className="md:hidden">
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <div className="flex flex-col gap-6 mt-6">
                      <div className="flex items-center gap-3 pb-4 border-b">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.avatar_url || undefined} alt={user.username} />
                          <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                            {getInitials(user)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <p className="font-medium">{user.first_name} {user.last_name}</p>
                          <p className="text-sm text-muted-foreground">@{user.username}</p>
                        </div>
                      </div>

                      <nav className="flex flex-col gap-2">
                        <NavLinks mobile onLinkClick={() => setIsMobileMenuOpen(false)} />
                      </nav>

                      <div className="flex flex-col gap-2 pt-4 border-t">
                        <Button variant="ghost" asChild className="justify-start" onClick={() => setIsMobileMenuOpen(false)}>
                          <Link href={`/profile/${user.username}`}>
                            <User className="mr-2 h-4 w-4" />
                            Profile
                          </Link>
                        </Button>
                        <Button variant="ghost" asChild className="justify-start" onClick={() => setIsMobileMenuOpen(false)}>
                          <Link href="/settings">
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                          className="justify-start text-destructive hover:text-destructive"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          {isLoggingOut ? 'Logging out...' : 'Log out'}
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                <Link href="/login">Log in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Sign up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
