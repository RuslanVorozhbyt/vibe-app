'use client'

import { useState } from 'react'
import { SignIn, SignUp } from '@clerk/nextjs'
import { dark } from '@clerk/themes'

enum Mode {
  SIGN_IN = 'sign_in',
  SIGN_UP= 'sign_UP',
}

export default function Home() {
  const [mode, setMode] = useState<Mode>(Mode.SIGN_IN)

  return (
    <main className="flex items-center justify-center pb-8 bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-black dark:to-zinc-900">
      <div className="flex flex-col items-center justify-center w-full max-w-[600px] rounded-2xl bg-white dark:bg-zinc-900 shadow-xl p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">
            {mode === Mode.SIGN_IN ? 'Welcome back 👋' : 'Create your account'}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {mode === Mode.SIGN_IN
              ? 'Sign in to continue'
              : 'Sign up to get started'}
          </p>
        </div>

        {mode === Mode.SIGN_IN ? (
          <SignIn
            appearance={{
              theme: dark,
              elements: {
                headerTitle: { display: 'none' },
                headerSubtitle: { display: 'none' },
                dividerText: { display: 'none' },
                footerAction: { display: 'none' },
              },
            }}
          />
        ) : (
          <SignUp
            appearance={{
              theme: dark,
              elements: {
                headerTitle: { display: 'none' },
                headerSubtitle: { display: 'none' },
                dividerText: { display: 'none' },
                footerAction: { display: 'none' },
              },
            }}
          />
        )}

        <div className="mt-4 text-center">
          {mode === Mode.SIGN_IN ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Don’t have an account?{' '}
              <button
                onClick={() => setMode(Mode.SIGN_UP)}
                className="text-[#6c47ff] font-medium hover:underline"
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Already have an account?{' '}
              <button
                onClick={() => setMode(Mode.SIGN_IN)}
                className="text-[#6c47ff] font-medium hover:underline"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </main>
  )
}
