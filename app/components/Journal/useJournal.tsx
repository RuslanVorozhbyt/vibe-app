"use client"

import {useEffect, useRef, useState} from "react";
import {useUser} from "@clerk/nextjs";
import {experimental_useObject as useObject} from "@ai-sdk/react";
import {ApplicationApiRoutes} from "@/app/enums/ApplicationApiRoutes";
import {journalSchema} from "@/app/schemas/journalSchema";
import {supabaseClient} from "@/app/lib/supabaseClient";

export const useJournal = () => {
  const [textInput, setTextInput] = useState('')
  const { user, isLoaded } = useUser()
  const { object, submit, isLoading, error } = useObject({
    api: ApplicationApiRoutes.ANALYZE,
    schema: journalSchema,
  })

  const handleAnalyze = () => {
    if (!isLoaded || !user || !textInput.trim()) return

    hasSavedRef.current = false

    submit({
      text: textInput,
    })
  }

  const hasSavedRef = useRef(false)

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

  return {
    textInput,
    setTextInput,
    isLoaded,
    user,
    isLoading,
    handleAnalyze,
    error,
    object
  }
}
