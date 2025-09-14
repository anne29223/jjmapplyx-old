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

// Scraped Jobs hooks
export const useScrapedJobs = () => {
  return useQuery({
    queryKey: ['scraped_jobs'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []
      
      const { data, error } = await supabase
        .from('scraped_jobs')
        .select('*')
        .eq('user_id', user.id)
        .order('scraped_at', { ascending: false })
        .limit(100)
      
      if (error) throw error
      return data
    }
  })
}

export const useScrapedJobsBySource = (source: string) => {
  return useQuery({
    queryKey: ['scraped_jobs', source],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []
      
      const { data, error } = await supabase
        .from('scraped_jobs')
        .select('*')
        .eq('user_id', user.id)
        .eq('source', source)
        .order('scraped_at', { ascending: false })
        .limit(50)
      
      if (error) throw error
      return data
    }
  })
}

export const useUpdateScrapedJobStatus = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ jobId, status }: { jobId: string; status: string }) => {
      const { data, error } = await supabase
        .from('scraped_jobs')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', jobId)
        .select()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scraped_jobs'] })
    }
  })
}

export const useDeleteScrapedJob = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (jobId: string) => {
      const { error } = await supabase
        .from('scraped_jobs')
        .delete()
        .eq('id', jobId)
      
      if (error) throw error
      return true
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scraped_jobs'] })
    }
  })
}

export const useJobScrapingConfig = () => {
  return useQuery({
    queryKey: ['job_scraping_config'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null
      
      const { data, error } = await supabase
        .from('job_scraping_config')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      if (error && error.code !== 'PGRST116') throw error
      
      return data || {
        enabled_job_boards: ['indeed', 'remoteok', 'weworkremotely'],
        search_queries: ['remote work', 'work from home'],
        locations: ['remote', 'anywhere'],
        max_jobs_per_board: 50,
        scraping_frequency: 'daily'
      }
    }
  })
}

export const useUpdateJobScrapingConfig = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (config: any) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('job_scraping_config')
        .upsert({
          user_id: user.id,
          ...config,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job_scraping_config'] })
    }
  })
}

export const useTriggerJobScraping = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ jobBoards, searchQuery, location, maxJobs }: {
      jobBoards: string[];
      searchQuery: string;
      location: string;
      maxJobs: number;
    }) => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const response = await supabase.functions.invoke('job-scraper', {
        body: { jobBoards, searchQuery, location, maxJobs }
      })

      if (response.error) throw response.error
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scraped_jobs'] })
      queryClient.invalidateQueries({ queryKey: ['automation_logs'] })
    }
  })
}

// Resume management hooks
export const useUserResumes = () => {
  return useQuery({
    queryKey: ['user_resumes'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []
      
      const { data, error } = await supabase
        .from('user_resumes')
        .select('*')
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false })
      
      if (error) throw error
      return data
    }
  })
}

export const useActiveResume = () => {
  return useQuery({
    queryKey: ['active_resume'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null
      
      const { data, error } = await supabase
        .from('user_resumes')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single()
      
      if (error && error.code !== 'PGRST116') throw error
      return data
    }
  })
}

export const useJobApplications = () => {
  return useQuery({
    queryKey: ['job_applications'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []
      
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          scraped_jobs (
            title,
            company,
            url,
            source
          ),
          user_resumes (
            filename
          )
        `)
        .eq('user_id', user.id)
        .order('application_date', { ascending: false })
      
      if (error) throw error
      return data
    }
  })
}

export const useApplyToJob = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ jobId, resumeId, notes }: {
      jobId: string;
      resumeId?: string;
      notes?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('job_applications')
        .insert({
          user_id: user.id,
          job_id: jobId,
          resume_id: resumeId,
          notes: notes || 'Auto-applied via JJMapplyx',
          application_status: 'submitted'
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job_applications'] })
      queryClient.invalidateQueries({ queryKey: ['scraped_jobs'] })
    }
  })
}

export const useUpdateApplicationStatus = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ applicationId, status, notes }: {
      applicationId: string;
      status: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('job_applications')
        .update({ 
          application_status: status,
          notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId)
        .select()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job_applications'] })
    }
  })
}
