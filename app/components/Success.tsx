import Link from "next/link";
import React from "react";

export default function Success () {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-8 max-w-md text-center">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        🎉 Payment Successful!
      </h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Thank you for subscribing to the Pro plan. You now have access to all premium features.
      </p>
      <Link
        href="/journal"
        className="inline-block bg-indigo-500 text-white py-2 px-6 rounded-lg hover:bg-indigo-600 transition"
      >
        Go to Journal
      </Link>
    </div>
  )
}
