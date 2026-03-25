'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Spinner } from '@/components/ui/spinner'
import { ImageUpload } from '@/components/ImageUpload'
import { toast } from 'sonner'
import { profileUpdateSchema } from '@/lib/validation'
import type { Profile } from '@/types'

interface EditProfileFormProps {
  profile: Profile
}

export function EditProfileForm({ profile }: EditProfileFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showAvatarUpload, setShowAvatarUpload] = useState(false)
  const [formData, setFormData] = useState({
    first_name: profile.first_name || '',
    last_name: profile.last_name || '',
    bio: profile.bio || '',
    website: profile.website || '',
    location: profile.location || '',
    avatar_url: profile.avatar_url || '',
  })

  const getInitials = () => {
    const first = formData.first_name?.[0] || ''
    const last = formData.last_name?.[0] || ''
    return (first + last).toUpperCase() || profile.username[0].toUpperCase()
  }

  const normalizeWebsite = (website: string) => {
    const trimmed = website.trim()
    if (!trimmed) return ''
    if (/^[a-zA-Z][a-zA-Z0-9+\-.]*:\/\//.test(trimmed)) {
      return trimmed
    }
    return `https://${trimmed}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const normalizedWebsite = normalizeWebsite(formData.website || '')
    const dataToSubmit = {
      ...formData,
      website: normalizedWebsite,
    }

    // Validate
    const result = profileUpdateSchema.safeParse(dataToSubmit)
    if (!result.success) {
      toast.error(result.error.errors[0]?.message || 'Invalid data')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSubmit),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update profile')
      }

      toast.success('Profile updated!')
      router.push(`/profile/${profile.username}`)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarUploaded = (url: string) => {
    setFormData(prev => ({ ...prev, avatar_url: url }))
    setShowAvatarUpload(false)
    toast.success('Avatar uploaded!')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>Update your profile information</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="space-y-4">
            <Label>Profile Picture</Label>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={formData.avatar_url || undefined} alt={profile.username} />
                <AvatarFallback className="bg-primary text-xl text-primary-foreground">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAvatarUpload(!showAvatarUpload)}
              >
                Change avatar
              </Button>
            </div>
            {showAvatarUpload && (
              <ImageUpload
                bucket="avatars"
                onUploaded={handleAvatarUploaded}
                onCancel={() => setShowAvatarUpload(false)}
              />
            )}
          </div>

          {/* Name fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="first_name">First name</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last name</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell us about yourself..."
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              maxLength={160}
              disabled={isLoading}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {formData.bio.length}/160 characters
            </p>
          </div>

          {/* Website */}
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              placeholder="https://example.com"
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              disabled={isLoading}
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="San Francisco, CA"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              disabled={isLoading}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Spinner className="mr-2 h-4 w-4" /> : null}
              Save changes
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  )
}
