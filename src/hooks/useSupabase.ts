// Applications hook: fetch all applications with job, status, interview, shift, and contact info
export const useApplications = () => {
  return useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      // Join jobs and applications tables for richer info
      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          job_id,
          status,
          interview_date,
          shift_info,
          applied_at,
          name,
          contact,
          job_title,
          company
        `)
        .order('applied_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });
}
import { createClient } from '@supabase/supabase-js'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const supabaseUrl = 'https://tzvzranspvtifnlgrkwi.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6dnpyYW5zcHZ0aWZubGdya3dpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyOTkxODcsImV4cCI6MjA2ODg3NTE4N30.oMG8VGPew29xAoaKPal0rsSs8aVmvyjXsyErC45jcfg'

export const supabase = createClient(supabaseUrl, supabaseKey)

export const useJobs = () => {
  return useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
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
      
      return data || {
        total_jobs: 0,
        applied: 0,
        pending: 0,
        success_rate: 0,
        automation_runs: 0,
        webhooks_triggered: 0
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



// Job Sites hooks
export const useJobSites = () => {
  return useQuery({
    queryKey: ['job_sites'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []
      const { data, error } = await supabase
        .from('job_sites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data
    }
  })
}

export const useAddJobSite = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (site: { name: string; url: string; keywords?: string[]; location?: string; enabled?: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('job_sites')
        .upsert({
          user_id: user.id,
          name: site.name,
          url: site.url,
          keywords: site.keywords ?? [],
          location: site.location ?? null,
          enabled: site.enabled ?? true
        }, { onConflict: 'user_id,url' })
        .select()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job_sites'] })
    }
  })
}

export const useToggleJobSite = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { data, error } = await supabase
        .from('job_sites')
        .update({ enabled, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job_sites'] })
    }
  })
}

export const useRemoveJobSite = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('job_sites')
        .delete()
        .eq('id', id)
      if (error) throw error
      return true
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job_sites'] })
    }
  })
}

export const useBulkUpsertJobSites = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (sites: Array<{ name: string; url: string; keywords?: string[]; location?: string }>) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const payload = sites.map(s => ({
        user_id: user.id,
        name: s.name,
        url: s.url,
        keywords: s.keywords ?? [],
        location: s.location ?? null,
        enabled: true
      }))
      const { data, error } = await supabase
        .from('job_sites')
        .upsert(payload, { onConflict: 'user_id,url' })
        .select()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job_sites'] })
    }
  })
}
