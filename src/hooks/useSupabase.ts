import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'

export const useJobs = () => {
  return useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      // Transform database fields to match JobCard interface
      return data?.map(job => ({
        id: job.id,
        title: job.title,
        company: job.company,
        url: job.url,
        status: job.status as "applied" | "pending" | "rejected" | "no-response",
        appliedAt: job.applied_at ? new Date(job.applied_at) : undefined,
        payRange: job.pay_range,
        type: job.job_type,
        contact: {
          email: job.contact_email,
          phone: job.contact_phone
        },
        resumeRequired: job.resume_required || false,
        notes: job.notes
      })) || []
    }
  })
}

export const useAutomationLogs = () => {
  return useQuery({
    queryKey: ['automation_logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('automation_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (error) throw error
      return data
    }
  })
}

export const useAutomationStats = () => {
  return useQuery({
    queryKey: ['automation_stats'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('automation_stats')
        .select('*')
        .eq('date', today)
        .single()
      
      if (error && error.code !== 'PGRST116') throw error
      
      // Transform database fields to match StatsCards interface
      if (data) {
        return {
          totalJobs: data.total_jobs || 0,
          applied: data.applied || 0,
          pending: data.pending || 0,
          successRate: data.success_rate || 0,
          automationRuns: data.automation_runs || 0,
          webhooksTriggered: data.webhooks_triggered || 0
        }
      }
      
      return {
        totalJobs: 0,
        applied: 0,
        pending: 0,
        successRate: 0,
        automationRuns: 0,
        webhooksTriggered: 0
      }
    }
  })
}

export const useUserSettings = () => {
  return useQuery({
    queryKey: ['user_settings'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      if (error && error.code !== 'PGRST116') throw error
      
      return data || {
        auto_apply: false,
        runs_per_day: 5,
        webhook_make: '',
        webhook_power_automate: '',
        n8n_webhook_url: '',
        email: '',
        phone: ''
      }
    }
  })
}

export const useUpdateSettings = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (settings: any) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          ...settings,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_settings'] })
    }
  })
}

export const useTriggerN8N = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ workflow, jobData }: { workflow: string, jobData?: any }) => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const response = await supabase.functions.invoke('trigger-n8n', {
        body: { workflow, jobData }
      })

      if (response.error) throw response.error
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation_logs'] })
      queryClient.invalidateQueries({ queryKey: ['automation_stats'] })
    }
  })
}