import requests
from bs4 import BeautifulSoup
import json

def scrape_simplyhired_jobs():
    url = "https://www.simplyhired.com/search?q=python+developer&l=USA"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36"
    }
    response = requests.get(url, headers=headers)
    print(f"Response status: {response.status_code}")
    print(response.text[:1000])

    soup = BeautifulSoup(response.content, "html.parser")
    jobs = []
    for job_card in soup.find_all("div", class_="SerpJob-jobCard"):  # Verify class after inspecting page!
        title = job_card.find("a", class_="SerpJob-link")
        company = job_card.find("span", class_="JobPosting-labelWithIcon")
        location = job_card.find("span", class_="JobPosting-labelWithIcon jobposting-address")
        if not (title and company and location):
            continue
        jobs.append({
            "title": title.text.strip(),
            "company": company.text.strip(),
            "location": location.text.strip(),
            "apply_link": f"https://www.simplyhired.com{title['href']}"
        })
    return jobs

if __name__ == "__main__":
    jobs = scrape_simplyhired_jobs()
    print(f"Found {len(jobs)} jobs.")
    with open("jobs.json", "w", encoding="utf-8") as f:
        json.dump(jobs, f, indent=2, ensure_ascii=False)

