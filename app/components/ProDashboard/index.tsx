"use client"

import {FilterEnum} from "@/app/enums/FilterEnum";
import {CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import {useProDashboard} from "@/app/components/ProDashboard/useProDashboard";

export default function ProDashboard () {
  const {
    isLoaded,
    user,
    filter,
    setFilter,
    loading,
    chartData
  } = useProDashboard()

  if (!isLoaded) return <p>Loading user...</p>
  if (!user) return <p>Please log in</p>

  return (
    <>
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
    </>
  )
}
