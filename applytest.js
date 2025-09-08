const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false }); // Shows browser window
  const page = await browser.newPage();

  // Replace with a real job application URL
  await page.goto('https://weworkremotely.com/remote-jobs', { waitUntil: 'networkidle2' });

  // Example: Click the first job link (customize selector as needed)
  await page.click('.jobs li a');
  await page.waitForNavigation({ waitUntil: 'networkidle2' });

  // Example: Fill out a form (customize selectors for actual form fields)
  // await page.type('#email', 'yourtestemail@gmail.com');
  // await page.type('#name', 'Joe Tester');
  // await page.click('#submit');

  console.log('Test complete!');
  await browser.close();
})();
