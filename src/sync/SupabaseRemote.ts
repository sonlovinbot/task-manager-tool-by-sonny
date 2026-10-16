import type { SupabaseClient } from '@supabase/supabase-js'
import type { Task } from '../domain/task'
import { fromRow, TASK_COLUMNS, toRow, type TaskRow } from './remoteMapping'
import type { RemoteTasks } from './types'

const PAGE = 1000
const CHUNK = 200

export class SupabaseRemote implements RemoteTasks {
  private client: SupabaseClient

  constructor(client: SupabaseClient) {
    this.client = client
  }

  async fetchAll(): Promise<Task[]> {
    const out: Task[] = []
    for (let from = 0; ; from += PAGE) {
      const { data, error } = await this.client
        .from('tasks')
        .select(TASK_COLUMNS)
        .order('id')
        .range(from, from + PAGE - 1)
      if (error) throw error
      const rows = (data ?? []) as TaskRow[]
      out.push(...rows.map(fromRow))
      if (rows.length < PAGE) return out
    }
  }

  async upsert(tasks: Task[]): Promise<void> {
    for (let i = 0; i < tasks.length; i += CHUNK) {
      const { error } = await this.client
        .from('tasks')
        .upsert(tasks.slice(i, i + CHUNK).map(toRow), { onConflict: 'id' })
      if (error) throw error
    }
  }
}
