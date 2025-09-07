// Node.js v18+ has global fetch; no import needed

// Fetch jobs from various gig/shift job boards
export async function fetchJobs(site, filter) {
  if (site === 'snagajob') {
    // Placeholder: Replace with real API or scraping logic
    // Example endpoint: 'https://www.snagajob.com/jobs/search?keywords=immediate+hire'
    // Simulate jobs
    return [
      { id: 'snag1', title: 'Cashier - Immediate Hire', type: 'hourly', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'jobrapido') {
    // Placeholder: Replace with real API or scraping logic
    return [
      { id: 'jr1', title: 'Warehouse Worker', type: 'shift', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'workersonboard') {
    // Placeholder: Replace with real API or scraping logic
    return [
      { id: 'wo1', title: 'Remote Data Entry', type: 'gig', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'ziprecruiter') {
    // Placeholder: Replace with real API or scraping logic for https://www.ziprecruiter.com/Jobs/Immediate-Hire-No-Interview
    return [
      { id: 'zip1', title: 'Immediate Hire - No Interview', type: 'hourly', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'remotasks') {
    // Placeholder: Replace with real API or scraping logic
    return [
      { id: 'rt1', title: 'Task Annotator', type: 'gig', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'cambly') {
    // Placeholder: Replace with real API or scraping logic
    return [
      { id: 'cambly1', title: 'Online English Tutor', type: 'gig', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'jobstack') {
    return [
      { id: 'jobstack1', title: 'General Laborer', type: 'shift', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'swipejobs') {
    return [
      { id: 'swipejobs1', title: 'Warehouse Associate', type: 'gig', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'fiverr') {
    return [
      { id: 'fiverr1', title: 'Freelance Graphic Designer', type: 'gig', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'upwork') {
    return [
      { id: 'upwork1', title: 'Remote Web Developer', type: 'gig', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'sparkdriver') {
    return [
      { id: 'sparkdriver1', title: 'Delivery Driver', type: 'gig', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'veryable') {
    return [
      { id: 'veryable1', title: 'Assembler', type: 'shift', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'adecco') {
    return [
      { id: 'adecco1', title: 'Production Worker', type: 'shift', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'roberthalf') {
    return [
      { id: 'roberthalf1', title: 'Admin Assistant', type: 'hourly', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'doordash') {
    return [
      { id: 'doordash1', title: 'Dasher', type: 'gig', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'grubhub') {
    return [
      { id: 'grubhub1', title: 'Delivery Partner', type: 'gig', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'fieldagent') {
    return [
      { id: 'fieldagent1', title: 'Field Agent', type: 'gig', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'seek') {
    return [
      { id: 'seek1', title: 'Retail Assistant', type: 'hourly', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'favor') {
    return [
      { id: 'favor1', title: 'Favor Runner', type: 'gig', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'instawork') {
    // Placeholder: Replace with real API or scraping logic
    return [
      { id: 'instawork1', title: 'Event Staff', type: 'shift', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'gigsmart') {
    return [
      { id: 'gigsmart1', title: 'Warehouse Associate', type: 'gig', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'jobtoday') {
    return [
      { id: 'jobtoday1', title: 'Barista - Immediate Start', type: 'hourly', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'shiftsmart') {
    return [
      { id: 'shiftsmart1', title: 'Survey Caller', type: 'gig', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'flexjobs') {
    return [
      { id: 'flexjobs1', title: 'Remote Customer Service', type: 'gig', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'bluecrew') {
    return [
      { id: 'bluecrew1', title: 'Picker/Packer', type: 'shift', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'care.com') {
    return [
      { id: 'carecom1', title: 'Babysitter', type: 'gig', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'randstad') {
    return [
      { id: 'randstad1', title: 'General Labor', type: 'shift', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'indeedflex') {
    return [
      { id: 'indeedflex1', title: 'Retail Associate', type: 'hourly', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'craigslist') {
    return [
      { id: 'craigslist1', title: 'Mover - Day Labor', type: 'gig', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'instacart') {
    return [
      { id: 'instacart1', title: 'Shopper', type: 'gig', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'workwhile') {
    return [
      { id: 'workwhile1', title: 'Food Service Worker', type: 'shift', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'wonolo') {
    return [
      { id: 'wonolo1', title: 'Delivery Helper', type: 'gig', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'jobget') {
    return [
      { id: 'jobget1', title: 'Line Cook', type: 'hourly', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'seasoned') {
    return [
      { id: 'seasoned1', title: 'Server', type: 'hourly', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'handshake') {
    return [
      { id: 'handshake1', title: 'Campus Brand Ambassador', type: 'gig', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'upshift') {
    return [
      { id: 'upshift1', title: 'Event Setup Crew', type: 'shift', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'traba') {
    return [
      { id: 'traba1', title: 'Warehouse Loader', type: 'shift', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'freelancer') {
    return [
      { id: 'freelancer1', title: 'Freelance Writer', type: 'gig', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }

// Node.js v18+ has global fetch; no import needed


// ...existing code...

// Node.js v18+ has global fetch; no import needed

// Job board configurations for GitHub Actions
// ...existing code...

// Fetch jobs from various gig/shift job boards
async function fetchJobs(site, filter) {
  if (site === 'snagajob') {
    return [
      { id: 'snag1', title: 'Cashier - Immediate Hire', type: 'hourly', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'jobrapido') {
    return [
      { id: 'jr1', title: 'Warehouse Worker', type: 'shift', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'workersonboard') {
    return [
      { id: 'wo1', title: 'Remote Data Entry', type: 'gig', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'ziprecruiter') {
    return [
      { id: 'zip1', title: 'Immediate Hire - No Interview', type: 'hourly', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'remotasks') {
    return [
      { id: 'rt1', title: 'Task Annotator', type: 'gig', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'cambly') {
    return [
      { id: 'cambly1', title: 'Online English Tutor', type: 'gig', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'jobstack') {
    return [
      { id: 'jobstack1', title: 'General Laborer', type: 'shift', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'swipejobs') {
    return [
      { id: 'swipejobs1', title: 'Warehouse Associate', type: 'gig', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'fiverr') {
    return [
      { id: 'fiverr1', title: 'Freelance Graphic Designer', type: 'gig', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'upwork') {
    return [
      { id: 'upwork1', title: 'Remote Web Developer', type: 'gig', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'sparkdriver') {
    return [
      { id: 'sparkdriver1', title: 'Delivery Driver', type: 'gig', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'veryable') {
    return [
      { id: 'veryable1', title: 'Assembler', type: 'shift', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'adecco') {
    return [
      { id: 'adecco1', title: 'Production Worker', type: 'shift', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'roberthalf') {
    return [
      { id: 'roberthalf1', title: 'Admin Assistant', type: 'hourly', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'doordash') {
    return [
      { id: 'doordash1', title: 'Dasher', type: 'gig', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'grubhub') {
    return [
      { id: 'grubhub1', title: 'Delivery Partner', type: 'gig', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'fieldagent') {
    return [
      { id: 'fieldagent1', title: 'Field Agent', type: 'gig', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'seek') {
    return [
      { id: 'seek1', title: 'Retail Assistant', type: 'hourly', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'favor') {
    return [
      { id: 'favor1', title: 'Favor Runner', type: 'gig', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'instawork') {
    return [
      { id: 'instawork1', title: 'Event Staff', type: 'shift', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'gigsmart') {
    return [
      { id: 'gigsmart1', title: 'Warehouse Associate', type: 'gig', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'jobtoday') {
    return [
      { id: 'jobtoday1', title: 'Barista - Immediate Start', type: 'hourly', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'shiftsmart') {
    return [
      { id: 'shiftsmart1', title: 'Survey Caller', type: 'gig', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'flexjobs') {
    return [
      { id: 'flexjobs1', title: 'Remote Customer Service', type: 'gig', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'bluecrew') {
    return [
      { id: 'bluecrew1', title: 'Picker/Packer', type: 'shift', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'care.com') {
    return [
      { id: 'carecom1', title: 'Babysitter', type: 'gig', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'randstad') {
    return [
      { id: 'randstad1', title: 'General Labor', type: 'shift', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'indeedflex') {
    return [
      { id: 'indeedflex1', title: 'Retail Associate', type: 'hourly', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'craigslist') {
    return [
      { id: 'craigslist1', title: 'Mover - Day Labor', type: 'gig', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'instacart') {
    return [
      { id: 'instacart1', title: 'Shopper', type: 'gig', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'workwhile') {
    return [
      { id: 'workwhile1', title: 'Food Service Worker', type: 'shift', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'wonolo') {
    return [
      { id: 'wonolo1', title: 'Delivery Helper', type: 'gig', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'jobget') {
    return [
      { id: 'jobget1', title: 'Line Cook', type: 'hourly', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'seasoned') {
    return [
      { id: 'seasoned1', title: 'Server', type: 'hourly', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'handshake') {
    return [
      { id: 'handshake1', title: 'Campus Brand Ambassador', type: 'gig', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'upshift') {
    return [
      { id: 'upshift1', title: 'Event Setup Crew', type: 'shift', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'traba') {
    return [
      { id: 'traba1', title: 'Warehouse Loader', type: 'shift', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'freelancer') {
    return [
      { id: 'freelancer1', title: 'Freelance Writer', type: 'gig', requiresInterview: false, requiresResume: false },
    ].filter(j => j.title.toLowerCase().includes(filter.toLowerCase()));
  }
  if (site === 'gigboard') {
    // Example for a generic gig board API
    try {
      const res = await fetch('https://api.gigboard.com/jobs');
      const jobs = await res.json();
      return jobs.filter(j =>
        (j.type === 'hourly' || j.type === 'shift' || j.type === 'gig') &&
        !j.requiresInterview && !j.requiresResume && j.title.toLowerCase().includes(filter.toLowerCase())
      );
    } catch (error) {
      console.error('Error fetching from gigboard:', error);
      return [];
    }
  }
  return [];
}

// Apply to job using only basic info from user profile
async function applyToJob(site, job, profile) {
  // Simulate application for boards without public API
  if ([
    'snagajob',
    'jobrapido',
    'workersonboard',
    'ziprecruiter',
    'remotasks',
    'cambly',
    'instawork',
    'gigsmart',
    'jobtoday',
    'shiftsmart',
    'flexjobs',
    'bluecrew',
    'care.com',
    'randstad',
    'indeedflex',
    'craigslist',
    'instacart',
    'workwhile',
    'wonolo',
    'jobget',
    'seasoned',
    'handshake',
    'upshift',
    'traba',
    'freelancer',
    'jobstack',
    'swipejobs',
    'fiverr',
    'upwork',
    'sparkdriver',
    'veryable',
    'adecco',
    'roberthalf',
    'doordash',
    'grubhub',
    'fieldagent',
    'seek',
    'favor'
  ].includes(site)) {
    // In real use, replace with POST request or form submission logic
    console.log(`Applied to ${job.title} on ${site} for ${profile.name}`);
    return true;
  }
  if (site === 'gigboard') {
    try {
      const basicInfo = {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
      };
      const res = await fetch(`https://api.gigboard.com/jobs/${job.id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(basicInfo),
      });
      return res.ok;
    } catch (error) {
      console.error('Error applying to gigboard job:', error);
      return false;
    }
  }
  return false;
}

// To add more boards, copy the pattern above and adjust endpoints/fields as needed.

// ...existing code...
export { fetchJobs, applyToJob };
}