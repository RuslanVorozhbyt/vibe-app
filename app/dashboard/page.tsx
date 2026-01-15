'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import {ApplicationApiRoutes} from "@/app/enums/ApplicationApiRoutes";
import {ExtendedJournalRecord} from "@/app/types/JournalRecord";

const PAGE_SIZE = 5

export default function Dashboard() {
  const { user, isLoaded } = useUser()
  const [records, setRecords] = useState<ExtendedJournalRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (!isLoaded || !user) return

    (async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `${ApplicationApiRoutes.JOURNALS}?userId=${user.id}&page=${page}&pageSize=${PAGE_SIZE}`
        )
        const data = await res.json()

        if (res.ok) {
          setRecords(data.records)
          setTotalPages(data.totalPages)
        } else {
          console.error('Error fetching journals:', data.error)
          setRecords([])
          setTotalPages(1)
        }
      } catch (err) {
        console.error('Fetch exception:', err)
        setRecords([])
        setTotalPages(1)
      }
      setLoading(false)
    })()
  }, [page, user, isLoaded])

  if (!isLoaded) return <p>Loading user...</p>
  if (!user) return <p>Please log in to see your journal history.</p>

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Your Journal History</h1>

      {loading ? (
        <p>Loading journals...</p>
      ) : records.length === 0 ? (
        <p>No journal records found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 rounded">
            <thead>
            <tr>
              <th className="px-4 py-2 border-b">Date</th>
              <th className="px-4 py-2 border-b">Mood</th>
              <th className="px-4 py-2 border-b">Stress Level</th>
              <th className="px-4 py-2 border-b">Summary</th>
              <th className="px-4 py-2 border-b">Advice</th>
            </tr>
            </thead>
            <tbody>
            {records.map((record) => (
              <tr key={record.id}>
                <td className="px-4 py-2 border-b">
                  {new Date(record.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-2 border-b">{record.mood}</td>
                <td className="px-4 py-2 border-b">{record.stress_level}/10</td>
                <td className="px-4 py-2 border-b">{record.summary}</td>
                <td className="px-4 py-2 border-b">{record.advice}</td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 flex justify-center space-x-2">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1 || loading}
          className="px-3 py-1 rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span className="px-3 py-1">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages || loading}
          className="px-3 py-1 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  )
}
