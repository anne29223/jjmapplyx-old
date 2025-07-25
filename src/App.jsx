import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx'
import { ScrollArea } from '@/components/ui/scroll-area.jsx'
import { Download, Play, Settings, Mail, Search, Zap, GitBranch, ExternalLink, Code, FileText } from 'lucide-react'
import './App.css'

function App() {
  const [selectedWorkflow, setSelectedWorkflow] = useState(null)
  const [workflowData, setWorkflowData] = useState({})

  // Load workflow data
  useEffect(() => {
    const loadWorkflows = async () => {
      try {
        const [jobScraping, emailMonitoring, autoApply, completeAutomation] = await Promise.all([
          fetch('/generated_workflows/job-scraping-workflow.json').then(r => r.json()),
          fetch('/generated_workflows/email-monitoring-workflow.json').then(r => r.json()),
          fetch('/generated_workflows/auto-apply-workflow.json').then(r => r.json()),
          fetch('/generated_workflows/complete-job-automation-workflow.json').then(r => r.json())
        ])
        
        setWorkflowData({
          'job-scraping': jobScraping,
          'email-monitoring': emailMonitoring,
          'auto-apply': autoApply,
          'complete-automation': completeAutomation
        })
      } catch (error) {
        console.error('Failed to load workflow data:', error)
        // Fallback data
        setWorkflowData({
          'job-scraping': { name: 'Job Scraping Workflow', nodes: [], connections: {} },
          'email-monitoring': { name: 'Email Monitoring Workflow', nodes: [], connections: {} },
          'auto-apply': { name: 'Auto Apply Workflow', nodes: [], connections: {} },
          'complete-automation': { name: 'Complete Job Automation', nodes: [], connections: {} }
        })
      }
    }
    
    loadWorkflows()
  }, [])

  const workflows = [
    {
      id: 'job-scraping',
      title: 'Job Scraping Workflow',
      description: 'Scrapes Indeed, LinkedIn, Jobs2Careers and sends found jobs to your app via webhook',
      icon: Search,
      features: ['Multi-platform scraping', 'Webhook integration', 'Manual/scheduled triggers'],
      data: workflowData['job-scraping'] || {},
      color: 'bg-blue-500'
    },
    {
      id: 'email-monitoring',
      title: 'Email Monitoring Workflow',
      description: 'Monitors your email for job responses, detects interview invitations, rejections, confirmations',
      icon: Mail,
      features: ['Email analysis', 'Interview detection', 'Status updates'],
      data: workflowData['email-monitoring'] || {},
      color: 'bg-green-500'
    },
    {
      id: 'auto-apply',
      title: 'Auto-Apply Workflow',
      description: 'Receives job URLs from your app, analyzes if auto-application is possible, reports success/failure',
      icon: Zap,
      features: ['URL analysis', 'Auto-application', 'Success reporting'],
      data: workflowData['auto-apply'] || {},
      color: 'bg-orange-500'
    },
    {
      id: 'complete-automation',
      title: 'Complete Job Automation',
      description: 'Combines scraping + auto-apply in one workflow. Full end-to-end automation - most comprehensive option',
      icon: GitBranch,
      features: ['End-to-end automation', 'Multi-platform support', 'Advanced security'],
      data: workflowData['complete-automation'] || {},
      color: 'bg-purple-500'
    }
  ]

  const downloadWorkflow = (workflow) => {
    const dataStr = JSON.stringify(workflow.data, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `${workflow.id}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <GitBranch className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">JJMApplyX</h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">Job Automation Workflows</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                4 Workflows Available
              </Badge>
              <Button variant="outline" size="sm" asChild>
                <a href="https://jjmapplyx.com" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Visit Site
                </a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
            Automate Your
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Job Search</span>
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-3xl mx-auto">
            Powerful n8n workflows to streamline your job application process. From scraping job boards to auto-applying, 
            we've got you covered with enterprise-grade automation.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Play className="w-5 h-5 mr-2" />
              Get Started
            </Button>
            <Button size="lg" variant="outline">
              <FileText className="w-5 h-5 mr-2" />
              Documentation
            </Button>
          </div>
        </div>
      </section>

      {/* Workflows Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-12">
            Available Workflows
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {workflows.map((workflow) => {
              const IconComponent = workflow.icon
              return (
                <Card key={workflow.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className={`w-12 h-12 ${workflow.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {workflow.data.nodes?.length || 0} nodes
                      </Badge>
                    </div>
                    <CardTitle className="text-xl text-slate-900 dark:text-white">
                      {workflow.title}
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400">
                      {workflow.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {workflow.features.map((feature, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => setSelectedWorkflow(workflow)}
                            >
                              <Code className="w-4 h-4 mr-2" />
                              View Code
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh]">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <IconComponent className="w-5 h-5" />
                                {workflow.title}
                              </DialogTitle>
                              <DialogDescription>
                                {workflow.description}
                              </DialogDescription>
                            </DialogHeader>
                            <Tabs defaultValue="overview" className="w-full">
                              <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="nodes">Nodes</TabsTrigger>
                                <TabsTrigger value="json">JSON</TabsTrigger>
                              </TabsList>
                              <TabsContent value="overview" className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-semibold mb-2">Workflow Details</h4>
                                    <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                                      <li>• Nodes: {workflow.data.nodes?.length || 0}</li>
                                      <li>• Connections: {Object.keys(workflow.data.connections || {}).length}</li>
                                      <li>• Version: {workflow.data.versionId || '1'}</li>
                                      <li>• Updated: {workflow.data.updatedAt || 'N/A'}</li>
                                    </ul>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold mb-2">Features</h4>
                                    <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                                      {workflow.features.map((feature, index) => (
                                        <li key={index}>• {feature}</li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </TabsContent>
                              <TabsContent value="nodes">
                                <ScrollArea className="h-[400px] w-full">
                                  <div className="space-y-2">
                                    {workflow.data.nodes?.map((node, index) => (
                                      <Card key={index} className="p-3">
                                        <div className="flex items-center justify-between">
                                          <div>
                                            <h5 className="font-medium">{node.name}</h5>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">{node.type}</p>
                                          </div>
                                          <Badge variant="outline" className="text-xs">
                                            v{node.typeVersion}
                                          </Badge>
                                        </div>
                                      </Card>
                                    )) || <p>No nodes available</p>}
                                  </div>
                                </ScrollArea>
                              </TabsContent>
                              <TabsContent value="json">
                                <ScrollArea className="h-[400px] w-full">
                                  <pre className="text-xs bg-slate-100 dark:bg-slate-800 p-4 rounded-lg overflow-x-auto">
                                    <code>{JSON.stringify(workflow.data, null, 2)}</code>
                                  </pre>
                                </ScrollArea>
                              </TabsContent>
                            </Tabs>
                            <div className="flex gap-2 pt-4">
                              <Button 
                                onClick={() => downloadWorkflow(workflow)}
                                className="flex-1"
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Download JSON
                              </Button>
                              <Button 
                                variant="outline"
                                onClick={() => copyToClipboard(JSON.stringify(workflow.data, null, 2))}
                              >
                                Copy to Clipboard
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button 
                          size="sm" 
                          onClick={() => downloadWorkflow(workflow)}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white/50 dark:bg-slate-800/50">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-12">
            Why Choose JJMApplyX Workflows?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Lightning Fast</h4>
              <p className="text-slate-600 dark:text-slate-400">
                Automated workflows that process hundreds of job applications in minutes, not hours.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Highly Configurable</h4>
              <p className="text-slate-600 dark:text-slate-400">
                Customize every aspect of the workflow to match your specific job search requirements.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <GitBranch className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Enterprise Ready</h4>
              <p className="text-slate-600 dark:text-slate-400">
                Built with security, scalability, and reliability in mind for professional use.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <GitBranch className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-slate-900 dark:text-white">JJMApplyX</span>
          </div>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Streamline your job search with powerful automation workflows.
          </p>
          <div className="flex justify-center space-x-6">
            <a href="https://jjmapplyx.com" className="text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors">
              Website
            </a>
            <a href="#" className="text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors">
              Documentation
            </a>
            <a href="#" className="text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors">
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App

