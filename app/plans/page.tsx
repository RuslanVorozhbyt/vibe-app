'use client'

import React, { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {StripePlans} from "@/app/enums/StripePlans";
import {ApplicationApiRoutes} from "@/app/enums/ApplicationApiRoutes";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function Plans () {
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async (priceId: string) => {
    setLoading(true)

    try {
      const res = await fetch(ApplicationApiRoutes.STRIPE_CHECKOUT_SESSION, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })

      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (err) {
      console.error(err)
      alert('Failed to start checkout')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl p-6">
        <div className="p-6 rounded-xl shadow-lg bg-white dark:bg-gray-800 text-center">
          <h2 className="text-2xl font-semibold mb-4">Free</h2>
          <p className="text-gray-500 dark:text-gray-300 mb-6">
            Access to basic features
          </p>
          <p className="text-3xl font-bold mb-6">$0 / month</p>
          <button
            disabled
            className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 py-2 px-4 rounded cursor-not-allowed"
          >
            Free
          </button>
        </div>

        <div className="p-6 rounded-xl shadow-lg bg-white dark:bg-gray-800 text-center border-2 border-indigo-500">
          <h2 className="text-2xl font-semibold mb-4">Pro</h2>
          <p className="text-gray-500 dark:text-gray-300 mb-6">
            Access to all features
          </p>
          <p className="text-3xl font-bold mb-6">$9.99 / month</p>
          <button
            onClick={() => handleSubscribe(StripePlans.PREMIUM)}
            className="bg-indigo-500 text-white py-2 px-4 rounded hover:bg-indigo-600 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Subscribe'}
          </button>
        </div>
      </div>
    </main>
  )
}
