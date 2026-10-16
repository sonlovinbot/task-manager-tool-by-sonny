import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import type { Status } from '../../domain/task'
import { STATUS_LABEL } from '../tasks/labels'

const COLORS: Record<Status, string> = { todo: '#9aa0a6', doing: '#2f6fed', done: '#1a7f4b' }

export function StatusChart({ counts }: { counts: Record<Status, number> }) {
  const data = (Object.keys(counts) as Status[]).map((s) => ({
    key: s,
    name: STATUS_LABEL[s],
    count: counts[s],
  }))
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} layout="vertical" margin={{ left: 16 }}>
        <XAxis type="number" allowDecimals={false} hide />
        <YAxis type="category" dataKey="name" width={80} />
        <Bar dataKey="count" label={{ position: 'right' }}>
          {data.map((d) => (
            <Cell key={d.key} fill={COLORS[d.key]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
