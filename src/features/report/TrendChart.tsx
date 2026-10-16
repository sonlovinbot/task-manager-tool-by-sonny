import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface Props {
  data: { date: string; count: number }[]
}

export function TrendChart({ data }: Props) {
  return (
    <div data-testid="trend" data-days={data.length}>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <XAxis dataKey="date" tickFormatter={(d: string) => d.slice(5)} interval="preserveStartEnd" />
          <YAxis allowDecimals={false} width={28} />
          <Tooltip />
          <Bar dataKey="count" name="Hoàn thành" fill="#1a7f4b" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
