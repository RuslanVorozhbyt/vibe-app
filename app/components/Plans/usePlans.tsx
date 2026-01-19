import {useState} from "react";
import {ApplicationApiRoutes} from "@/app/enums/ApplicationApiRoutes";

export const usePlans = () => {
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

  return {
    loading,
    handleSubscribe,
  }
}
