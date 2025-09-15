import requests
from bs4 import BeautifulSoup

def scrape_simplyhired_jobs():
    url = "https://www.simplyhired.com/search?q=python+developer"
    headers = {'User-Agent': 'Mozilla/5.0'}
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.content, "html.parser")

    jobs = []
    job_cards = soup.find_all("div", class_="SerpJob-jobCard")
    for job in job_cards:
        title = job.find("a", class_="SerpJob-link")
        company = job.find("span", class_="JobPosting-labelWithIcon")
        location = job.find("span", class_="JobPosting-labelWithIcon jobposting-location")

        jobs.append({
            "title": title.text.strip() if title else "N/A",
            "company": company.text.strip() if company else "N/A",
            "location": location.text.strip() if location else "N/A"
        })

    return jobs

if __name__ == "__main__":
    job_list = scrape_simplyhired_jobs()
    print(f"Found {len(job_list)} jobs")
    for job in job_list[:5]:  # print first 5 jobs for example
        print(f"{job['title']} at {job['company']} in {job['location']}")
