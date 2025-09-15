def run_multiple_scrapers():
    all_jobs = []

    try:
        from scrape_realpython import scrape_realpython
        jobs = scrape_realpython()
        print(f"RealPython scraper found {len(jobs)} jobs")
        all_jobs.extend(jobs)
    except Exception as e:
        print(f"RealPython scraper failed with: {e}")

    try:
        from scrape_simplyhired import scrape_simplyhired_jobs
        jobs = scrape_simplyhired_jobs()
        print(f"SimplyHired scraper found {len(jobs)} jobs")
        all_jobs.extend(jobs)
    except Exception as e:
        print(f"SimplyHired scraper failed with: {e}")

    try:
        from scrape_remoteok import scrape_remoteok_jobs
        jobs = scrape_remoteok_jobs()
        print(f"RemoteOK scraper found {len(jobs)} jobs")
        all_jobs.extend(jobs)
    except Exception as e:
        print(f"RemoteOK scraper failed with: {e}")

    # Save combined results
    import json
    with open("all_jobs.json", "w") as f:
        json.dump(all_jobs, f, indent=2)

if __name__ == "__main__":
    run_multiple_scrapers()
