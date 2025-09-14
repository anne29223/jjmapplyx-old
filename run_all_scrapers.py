import json
from scrape_realpython import scrape_realpython
from scrape_simplyhired import scrape_simplyhired_jobs
from scrape_remoteok import scrape_remoteok_jobs

def run_all_scrapers():
    all_jobs = []

    all_jobs.extend(scrape_realpython())
    all_jobs.extend(scrape_simplyhired_jobs())
    all_jobs.extend(scrape_remoteok_jobs())

    with open("all_jobs.json", "w") as f:
        json.dump(all_jobs, f, indent=2)

if __name__ == "__main__":
    run_all_scrapers()
