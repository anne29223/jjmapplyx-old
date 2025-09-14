import requests
from bs4 import BeautifulSoup
import json

def scrape_simplyhired_jobs():
    url = "https://www.simplyhired.com/search?q=python+developer&l=USA"
    response = requests.get(url)
    soup = BeautifulSoup(response.content, "html.parser")

    jobs = []
    for job_card in soup.find_all("div", class_="SerpJob-jobCard"):
        title = job_card.find("a", class_="SerpJob-link").text.strip() if job_card.find("a", class_="SerpJob-link") else None
        company = job_card.find("span", class_="JobPosting-labelWithIcon").text.strip() if job_card.find("span", class_="JobPosting-labelWithIcon") else None
        location = job_card.find("span", class_="JobPosting-labelWithIcon jobposting-address").text.strip() if job_card.find("span", class_="JobPosting-labelWithIcon jobposting-address") else None
        link = job_card.find("a", class_="SerpJob-link")["href"] if job_card.find("a", class_="SerpJob-link") else None
        
        if title and company and location and link:
            jobs.append({
                "title": title,
                "company": company,
                "location": location,
                "apply_link": f"https://www.simplyhired.com{link}"
            })
    return jobs
