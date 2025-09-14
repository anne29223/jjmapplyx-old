import requests
from bs4 import BeautifulSoup
import json

def scrape_realpython():
    url = "https://realpython.github.io/fake-jobs/"
    response = requests.get(url)
    soup = BeautifulSoup(response.content, "html.parser")

    results = soup.find(id="ResultsContainer")
    job_elements = results.find_all("div", class_="card-content")

    jobs = []
    for job_elem in job_elements:
        title = job_elem.find("h2", class_="title").text.strip()
        company = job_elem.find("h3", class_="company").text.strip()
        location = job_elem.find("p", class_="location").text.strip()
        link = job_elem.find_all("a")[1]["href"]

        jobs.append({
            "title": title,
            "company": company,
            "location": location,
            "apply_link": link
        })
    return jobs
