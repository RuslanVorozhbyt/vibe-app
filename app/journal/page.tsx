'use client'

import { experimental_useObject as useObject } from '@ai-sdk/react'
import { journalSchema } from '@/app/schemas/journalSchema'
import { useEffect, useRef, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { supabaseClient } from '@/app/lib/supabaseClient'
import { ApplicationApiRoutes } from '@/app/enums/ApplicationApiRoutes'

export default function Journal() {
  const { user, isLoaded } = useUser()
  const [textInput, setTextInput] = useState('')

  const { object, submit, isLoading, error } = useObject({
    api: ApplicationApiRoutes.ANALYZE,
    schema: journalSchema,
  })

  const hasSavedRef = useRef(false)

  const handleAnalyze = () => {
    if (!isLoaded || !user || !textInput.trim()) return

    hasSavedRef.current = false

    submit({
      text: textInput,
    })
  }

  useEffect(() => {
    if (
      isLoading ||
      hasSavedRef.current ||
      !isLoaded ||
      !user ||
      !object
    ) {
      return
    }

    if (
      !object.mood ||
      object.stress_level === undefined ||
      !object.summary ||
      !object.advice
    ) {
      return
    }

    const saveJournal = async () => {
      hasSavedRef.current = true

      const { error } = await supabaseClient.from('journals').insert({
        clerk_user_id: user.id,
        mood: object.mood,
        stress_level: object.stress_level,
        summary: object.summary,
        advice: object.advice,
      })

      if (error) {
        console.error('Failed to save journal:', error)
        hasSavedRef.current = false
      }
    }

    saveJournal()
  }, [isLoading, object, user, isLoaded])

  return (
    <div className="p-8 max-w-xl mx-auto">
      <textarea
        value={textInput}
        onChange={(e) => setTextInput(e.target.value)}
        placeholder="Write your journal entry here..."
        rows={6}
        className="w-full p-3 border border-gray-300 rounded mb-4 resize-none"
        disabled={!isLoaded || !user}
      />

      <button
        onClick={handleAnalyze}
        disabled={isLoading || !isLoaded || !user || !textInput.trim()}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {isLoading ? 'Analyzing...' : 'Analyze Journal'}
      </button>
      {error && (
        <span className="block mt-4 text-red-500">{error.message}</span>
      )}

      <div className="mt-6 space-y-4">
        {object?.mood && <p><strong>Mood:</strong> {object.mood}</p>}
        {object?.stress_level !== undefined && (
          <p><strong>Stress Level:</strong> {object.stress_level}/10</p>
        )}
        {object?.summary && <p><strong>Summary:</strong> {object.summary}</p>}
        {object?.advice && (
          <div className="p-4 bg-gray-100 text-black rounded">
            <strong>AI Advice:</strong> {object.advice}
          </div>
        )}
      </div>
    </div>
  )
}
