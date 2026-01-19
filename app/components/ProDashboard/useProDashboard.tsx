"use client"

import {useUser} from "@clerk/nextjs";
import {useEffect, useMemo, useState} from "react";
import {JournalRecord} from "@/app/types/JournalRecord";
import {FilterEnum} from "@/app/enums/FilterEnum";
import {ApplicationApiRoutes} from "@/app/enums/ApplicationApiRoutes";
import {getLastNDays, startOfDay} from "@/app/components/ProDashboard/helpers";

export const useProDashboard = () => {
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

  return {
    isLoaded,
    user,
    filter,
    setFilter,
    loading,
    chartData
  }
}
