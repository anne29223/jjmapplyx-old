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
    print(f"Content snippet:\n{response.content[:1000].decode('utf-8', errors='ignore')}")

    soup = BeautifulSoup(response.content, "html.parser")
    jobs = []
    for job_card in soup.find_all("div", class_="SerpJob-jobCard"):
        title_elem = job_card.find("a", class_="SerpJob-link")
        company_elem = job_card.find("span", class_="JobPosting-labelWithIcon")
        location_elem = job_card.find("span", class_="JobPosting-labelWithIcon jobposting-address")
        if not (title_elem and company_elem and location_elem):
            continue
        title = title_elem.text.strip()
        company = company_elem.text.strip()
        location = location_elem.text.strip()
        link = title_elem['href']
        jobs.append({
            "title": title,
            "company": company,
            "location": location,
            "apply_link": f"https://www.simplyhired.com{link}"
        })
    return jobs

if __name__ == "__main__":
    jobs = scrape_simplyhired_jobs()
    print(f"Found {len(jobs)} jobs")
    with open("jobs.json", "w", encoding="utf-8") as f:
        json.dump(jobs, f, ensure_ascii=False, indent=2)

