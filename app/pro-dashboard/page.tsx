'use client'

import {useUser} from '@clerk/nextjs'
import {useEffect, useMemo, useState} from 'react'
import {CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,} from 'recharts'
import {FilterEnum} from "@/app/enums/FilterEnum";
import {JournalRecord} from "@/app/types/JournalRecord";
import {ApplicationApiRoutes} from "@/app/enums/ApplicationApiRoutes";

function startOfDay(date: Date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function getLastNDays(n: number) {
  const days: string[] = []
  const today = startOfDay(new Date())

  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }

  return days
}

export default function AnalyticsPage() {
  const { user, isLoaded } = useUser()
  const [records, setRecords] = useState<JournalRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<FilterEnum>(FilterEnum.WEEK)

  useEffect(() => {
    if (!isLoaded || !user) return

    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `${ApplicationApiRoutes.JOURNALS}?userId=${user.id}&page=1&pageSize=1000`
        )
        const data = await res.json()
        setRecords(res.ok ? data.records : [])
      } catch {
        setRecords([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isLoaded, user])

  const chartData = useMemo(() => {
    const days =
      filter === FilterEnum.WEEK ? getLastNDays(7) : getLastNDays(30)

    const grouped = new Map<string, { total: number; count: number }>()

    records.forEach((r) => {
      const dateKey = startOfDay(new Date(r.created_at))
        .toISOString()
        .slice(0, 10)

      if (!days.includes(dateKey)) return

      const existing = grouped.get(dateKey) ?? { total: 0, count: 0 }
      existing.total += r.stress_level
      existing.count += 1
      grouped.set(dateKey, existing)
    })

    return days.map((date) => {
      const value = grouped.get(date)
      return {
        date,
        stress: value
          ? Number((value.total / value.count).toFixed(2))
          : null,
      }
    })
  }, [records, filter])

  if (!isLoaded) return <p>Loading user...</p>
  if (!user) return <p>Please log in</p>

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Stress Analytics</h1>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setFilter(FilterEnum.WEEK)}
          className={`px-4 py-2 rounded ${
            filter === 'week' ? 'bg-blue-600 text-white' : ''
          }`}
        >
          Last 7 days
        </button>
        <button
          onClick={() => setFilter(FilterEnum.MONTH)}
          className={`px-4 py-2 rounded ${
            filter === 'month' ? 'bg-blue-600 text-white' : ''
          }`}
        >
          Last 30 days
        </button>
      </div>

      {loading ? (
        <p>Loading analytics...</p>
      ) : chartData.every((d) => d.stress === null) ? (
        <p>No data for selected period.</p>
      ) : (
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="stress"
                strokeWidth={3}
                dot={{ r: 4 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
