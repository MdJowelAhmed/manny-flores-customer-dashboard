import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Cell, Pie, PieChart, PieLabelRenderProps, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'

const STATUS_CONFIG: Record<string, { name: string; color: string }> = {
  PENDING: { name: 'Pending Estimates', color: '#9333EA' },
  IN_PROGRESS: { name: 'In Progress', color: '#3B82F6' },
}

function renderSliceLabel({
  cx = 0,
  cy = 0,
  midAngle = 0,
  innerRadius = 0,
  outerRadius = 0,
  percent = 0,
}: PieLabelRenderProps) {
  if (percent === 0) return null

  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.52
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      style={{ fontSize: 15, fontWeight: 700 }}
    >
      {`${Math.round(percent * 100)}%`}
    </text>
  )
}

export function ProjectStatusOverviewChart({ overviewProjectStatus }: { overviewProjectStatus: any }) {
  const apiData = overviewProjectStatus?.data || []

  const chartData = apiData.map((item: any) => {
    const config = STATUS_CONFIG[item.status] || {
      name: item.status.replace('_', ' ').toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase()),
      color: '#CBD5E1',
    }
    return {
      name: config.name,
      value: item.percentage,
      color: config.color,
    }
  })

  // Show the pie chart if we have data and at least one category is non-zero
  const hasData = chartData.length > 0 && chartData.some((item: any) => item.value > 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className="h-full w-full"
    >
      <Card className="h-full border-none bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-gray-800">
            Project Status Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="mx-auto h-[260px] w-full max-w-[320px] sm:h-[280px] sm:max-w-none">
            {hasData ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius="88%"
                    startAngle={90}
                    endAngle={-270}
                    stroke="#ffffff"
                    strokeWidth={2}
                    isAnimationActive
                    label={renderSliceLabel}
                    labelLine={false}
                  >
                    {chartData?.map((entry: any) => (
                      <Cell key={entry.name} fill={entry.color} stroke="#ffffff" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-400">
                No project status data available
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-3">
            {chartData?.map((item: any) => (
              <div key={item.name} className="flex items-center gap-2.5">
                <div
                  className="h-3.5 w-3.5 shrink-0 rounded-sm"
                  style={{ backgroundColor: item.color }}
                  aria-hidden
                />
                <span className="text-sm text-gray-600">
                  {item.name} : {item.value}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

