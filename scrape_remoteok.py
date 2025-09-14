import requests
from bs4 import BeautifulSoup
import json

def scrape_remoteok_jobs():
    url = "https://remoteok.com/"
    response = requests.get(url)
    soup = BeautifulSoup(response.content, "html.parser")

    jobs = []
    json_ld_scripts = soup.find_all("script", type="application/ld+json")

    for script in json_ld_scripts:
        try:
            job_data = json.loads(script.string)
            if isinstance(job_data, dict) and job_data.get("@type") == "JobPosting":
                jobs.append({
                    "title": job_data.get("title"),
                    "company": job_data.get("hiringOrganization", {}).get("name"),
                    "location": job_data.get("jobLocation", [{}])[0].get("address", {}).get("addressLocality"),
                    "apply_link": job_data.get("url") or url
                })
        except Exception:
            continue
    return jobs

