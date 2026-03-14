import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { motion } from 'framer-motion'
import { years } from './dashboardData'

interface ChartDataPoint {
  month: string
  visibility: number
}

interface ProjectVisibilityChartProps {
  chartData: ChartDataPoint[]
  selectedYear: string
  onYearChange: (year: string) => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white text-gray-800 px-3 py-2 rounded text-sm font-medium shadow-md border border-gray-100">
        <p className="mb-1 text-gray-500 font-semibold">{payload[0].payload.month}</p>
        <p>
          Visibility: <span className="font-bold">{payload[0].value}</span>
        </p>
      </div>
    )
  }
  return null
}

export function ProjectVisibilityChart({
  chartData,
  selectedYear,
  onYearChange,
}: ProjectVisibilityChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className="w-full h-full"
    >
      <Card className="h-full border-none shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-800">
              Project Visibility
            </CardTitle>
            <Select value={selectedYear} onValueChange={onYearChange}>
              <SelectTrigger className="w-[100px] bg-white border border-gray-200">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="visibilityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  horizontal={true}
                  stroke="#F3F4F6"
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  allowDataOverflow={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                <Area
                  type="monotone"
                  dataKey="visibility"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fill="url(#visibilityGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
