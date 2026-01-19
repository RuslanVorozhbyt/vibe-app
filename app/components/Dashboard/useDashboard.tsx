import {useUser} from "@clerk/nextjs";
import {useEffect, useState} from "react";
import {ExtendedJournalRecord} from "@/app/types/JournalRecord";
import {ApplicationApiRoutes} from "@/app/enums/ApplicationApiRoutes";
import {PAGE_SIZE} from "@/app/components/Dashboard/constants";

export const useDashboard = () => {
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

  return {
    isLoaded,
    user,
    loading,
    records,
    page,
    setPage,
    totalPages
  }
}
