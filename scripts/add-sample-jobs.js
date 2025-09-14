import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tzvzranspvtifnlgrkwi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6dnpyYW5zcHZ0aWZubGdya3dpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyOTkxODcsImV4cCI6MjA2ODg3NTE4N30.oMG8VGPew29xAoaKPal0rsSs8aVmvyjXsyErC45jcfg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addSampleJobs() {
  console.log('🚀 Adding sample scraped jobs...');

  const sampleJobs = [
    {
      title: 'Senior Software Engineer - Remote',
      company: 'TechStart Inc',
      location: 'Remote',
      url: 'https://remoteok.com/remote-jobs/1112345-senior-software-engineer-techstart',
      description: 'We are looking for a senior software engineer with 5+ years of experience in React, Node.js, and cloud technologies.',
      salary: '$120k - $150k',
      source: 'RemoteOK',
      status: 'pending',
      user_id: null
    },
    {
      title: 'Frontend Developer',
      company: 'Digital Agency Co',
      location: 'San Francisco, CA',
      url: 'https://indeed.com/viewjob?jk=abc123def456',
      description: 'Join our growing team as a frontend developer working with React, TypeScript, and modern web technologies.',
      salary: '$90k - $110k',
      source: 'Indeed',
      status: 'pending',
      user_id: null
    },
    {
      title: 'Full Stack Developer',
      company: 'RemoteFirst',
      location: 'Remote',
      url: 'https://weworkremotely.com/remote-jobs/12345-full-stack-developer-remotefirst',
      description: 'Full stack developer position with React, Node.js, and PostgreSQL. Work from anywhere in the world.',
      salary: '$100k - $130k',
      source: 'We Work Remotely',
      status: 'applied',
      user_id: null
    },
    {
      title: 'React Developer',
      company: 'StartupXYZ',
      location: 'New York, NY',
      url: 'https://glassdoor.com/job-listing/react-developer-startupxyz/1234567890',
      description: 'Looking for a passionate React developer to join our fast-growing startup team.',
      salary: '$85k - $105k',
      source: 'Glassdoor',
      status: 'pending',
      user_id: null
    },
    {
      title: 'Software Engineer - Backend',
      company: 'CloudTech Solutions',
      location: 'Austin, TX',
      url: 'https://linkedin.com/jobs/view/1234567890',
      description: 'Backend software engineer position working with Python, Django, and AWS infrastructure.',
      salary: '$110k - $140k',
      source: 'LinkedIn',
      status: 'interview',
      user_id: null
    }
  ];

  try {
    const { data, error } = await supabase
      .from('scraped_jobs')
      .insert(sampleJobs);

    if (error) {
      console.error('❌ Error adding jobs:', error);
      return;
    }

    console.log('✅ Successfully added sample jobs to database!');
    console.log(`📊 Added ${sampleJobs.length} jobs`);

    // Verify the jobs were added
    const { data: jobs, error: fetchError } = await supabase
      .from('scraped_jobs')
      .select('*')
      .order('scraped_at', { ascending: false })
      .limit(10);

    if (fetchError) {
      console.error('❌ Error fetching jobs:', fetchError);
      return;
    }

    console.log(`📋 Total jobs in database: ${jobs.length}`);
    console.log('Recent jobs:');
    jobs.forEach((job, index) => {
      console.log(`${index + 1}. ${job.title} at ${job.company} (${job.source}) - ${job.status}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

addSampleJobs();
