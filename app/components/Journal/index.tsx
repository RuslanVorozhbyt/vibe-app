"use client"

import {useJournal} from "@/app/components/Journal/useJournal";

export default function Journal () {
  const {
    textInput,
    setTextInput,
    isLoaded,
    user,
    isLoading,
    handleAnalyze,
    error,
    object
  } = useJournal()

  return (
    <>
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
    </>
  )
}
