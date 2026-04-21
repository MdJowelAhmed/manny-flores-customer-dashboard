import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Cell, Pie, PieChart, PieLabelRenderProps, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'

const PROJECT_STATUS_DATA = [
  { name: 'Pending Estimates', value: 35, color: '#9333EA' },
  { name: 'In Progress', value: 65, color: '#3B82F6' },
] as const

function renderSliceLabel({
  cx = 0,
  cy = 0,
  midAngle = 0,
  innerRadius = 0,
  outerRadius = 0,
  percent = 0,
}: PieLabelRenderProps) {
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

export function ProjectStatusOverviewChart() {
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
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[...PROJECT_STATUS_DATA]}
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
                  {PROJECT_STATUS_DATA.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} stroke="#ffffff" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            {PROJECT_STATUS_DATA.map((item) => (
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
