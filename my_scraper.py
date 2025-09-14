import requests
from bs4 import BeautifulSoup
import json

def scrape_jobs():
    # Example: scrape jobs from a website URL
    url = "https://example.com/jobs"
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')

    jobs = []
    for job_elem in soup.select('.job-listing'):
        title = job_elem.select_one('.title').text.strip()
        company = job_elem.select_one('.company').text.strip()
        jobs.append({'title': title, 'company': company})

    with open('jobs.json', 'w') as f:
        json.dump(jobs, f)

if __name__ == "__main__":
    scrape_jobs()
