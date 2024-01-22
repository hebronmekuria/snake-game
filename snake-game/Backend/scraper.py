import csv
import requests
from bs4 import BeautifulSoup

# Open CSV file for writing
file = open('linkedin-jobs.csv', 'a', newline='', encoding='utf-8')
writer = csv.writer(file)
writer.writerow(['Title', 'Company', 'Location', 'Apply', 'Description'])

import re

def get_job_description(url):
    # Fetch the job page
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')

    # Extract the job description
    description = soup.find('div', class_='description__text')
    if description:
        # Clean up the description
        cleaned_description = description.text.strip()
        cleaned_description = re.sub(r'\s+', ' ', cleaned_description)  # Replace multiple spaces/newlines with a single space
        cleaned_description = cleaned_description.replace("Show more", "").replace("Show less", "")
        return cleaned_description
    else:
        return "No description available"


def linkedin_scraper(webpage, start, major):
    # Replace spaces in major with URL encoding for a space
    encoded_major = major.replace(" ", "%20")

    # Update the URL to include only the major and pagination parameters
    next_page = webpage.format(encoded_major, start)
    print(next_page)

    # Fetching the webpage content
    response = requests.get(next_page)
    soup = BeautifulSoup(response.content, 'html.parser')

    # Finding all job postings
    jobs = soup.find_all('div', class_='base-card relative w-full hover:no-underline focus:no-underline base-card--link base-search-card base-search-card--link job-search-card')

    if not jobs:
        # No more jobs found, stop the recursion
        file.close()
        print('Scraping completed. File closed.')
        return

    for job in jobs:
        # Extracting job details
        job_title = job.find('h3', class_='base-search-card__title').text.strip()
        job_company = job.find('h4', class_='base-search-card__subtitle').text.strip()
        job_location = job.find('span', class_='job-search-card__location').text.strip()
        job_link = job.find('a', class_='base-card__full-link')['href']

        # Get job description
        job_description = get_job_description(job_link)

        # Writing to CSV
        writer.writerow([job_title, job_company, job_location, job_link, job_description])

    print('Data updated for start=', start)

    # Recursively call the next page
    linkedin_scraper(webpage, start + 25, major)

# Example of initial call to the scraper function with a major as input
major = "Some Major"
linkedin_scraper('https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords={}&start={}', 0, major)