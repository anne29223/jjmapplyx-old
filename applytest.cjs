
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // WeWorkRemotely job board
  const jobBoardUrl = 'https://weworkremotely.com/remote-jobs';
  await page.goto(jobBoardUrl, { waitUntil: 'networkidle2' });
  console.log('Navigated to job board');

  // Click the first job link (customize selector as needed)
  await page.waitForSelector('.jobs li a');
  await page.click('.jobs li a');
  await page.waitForNavigation({ waitUntil: 'networkidle2' });
  console.log('Opened first job listing');

  // Example: Look for an Apply button (customize selector)
  // If the job board has a direct application form, fill it out here
  // await page.click('button.apply');

  // Example: Fill out application form fields (customize selectors)
  // await page.type('#email', 'info35185@gmail.com');
  // await page.type('#name', 'Joe Tester');
  // await page.type('#phone', '555-123-4567');

  // Example: Upload resume (if file input is present)
  // const inputUploadHandle = await page.$('input[type="file"]');
  // await inputUploadHandle.uploadFile('C:/projects2/jjmapplyx-old-main/jjmapplyx-old-main/resume.doc');

  // Example: Answer questions (customize selectors)
  // await page.type('#question1', 'No response');

  // Example: Submit the application (customize selector)
  // await page.click('#submit');

  // Record job link and status
  const jobLink = page.url();
  const logEntry = `Applied to job: ${jobLink} at ${new Date().toISOString()}\n`;
  console.log(logEntry);
  const fs = require('fs');
  fs.appendFileSync('job-application-log.txt', logEntry);

  // Take a screenshot for record
  await page.screenshot({ path: 'job-application-result.png' });

  // You can add email sending logic here if needed

  await browser.close();
})();
