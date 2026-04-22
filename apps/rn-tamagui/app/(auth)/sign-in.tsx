import { useState } from 'react'
import { router } from 'expo-router'
import { YStack, XStack, Text, Button, Input, Separator, Spinner } from 'tamagui'
import { useAuthStore } from '@/store/auth'
import { authClient } from '@/lib/auth/client'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const setSession = useAuthStore((s) => s.setSession)

  async function handleEmailSignIn() {
    if (!email || !password) return
    setLoading(true)
    setError(null)
    try {
      const result = await authClient.signIn.email({ email, password })
      if (result.error) throw new Error(result.error.message)
      setSession(result.data)
      router.replace('/(tabs)')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleWalletSignIn() {
    setLoading(true)
    setError(null)
    try {
      const result = await authClient.suiWallet.signIn()
      if (result.error) throw new Error(result.error.message)
      setSession(result.data)
      router.replace('/(tabs)')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Wallet sign in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <YStack f={1} bg="$background" px="$4" jc="center" gap="$4">
      <YStack gap="$1">
        <Text fontFamily="$heading" fontSize="$9" fontWeight="700" color="$color">
          Sessions
        </Text>
        <Text color="$colorHover" fontSize="$5">
          The gig economy for music
        </Text>
      </YStack>

      <YStack gap="$3" mt="$4">
        <Input
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          size="$5"
        />
        <Input
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          size="$5"
        />

        {error && (
          <Text color="$error" fontSize="$3">
            {error}
          </Text>
        )}

        <Button
          size="$5"
          bg="$brand"
          color="$brandText"
          onPress={handleEmailSignIn}
          disabled={loading}
          icon={loading ? <Spinner /> : undefined}
        >
          Sign in
        </Button>
      </YStack>

      <XStack ai="center" gap="$3">
        <Separator f={1} />
        <Text color="$placeholderColor" fontSize="$3">
          or
        </Text>
        <Separator f={1} />
      </XStack>

      <Button
        size="$5"
        variant="outlined"
        borderColor="$brand"
        color="$brand"
        onPress={handleWalletSignIn}
        disabled={loading}
      >
        Connect SUI Wallet
      </Button>

      <Button
        size="$4"
        variant="outlined"
        onPress={() => router.push('/(auth)/sign-up')}
        disabled={loading}
      >
        Create account
      </Button>
    </YStack>
  )
}
