import os
import json
from urllib.parse import urlparse, parse_qs
from googleapiclient.discovery import build

from dotenv import load_dotenv
load_dotenv()
api_key = os.getenv("YOUTUBE_API_KEY")

# Input and output files
URL_FILE = "youtube_urls.txt"
OUTPUT_FILE = "video_metadata.json"

# Initialize YouTube API client
youtube = build("youtube", "v3", developerKey=api_key)

def extract_video_id(url):
    parsed = urlparse(url)
    if parsed.hostname in ["youtu.be"]:
        return parsed.path.lstrip("/")
    elif parsed.hostname in ["www.youtube.com", "youtube.com"]:
        return parse_qs(parsed.query).get("v", [None])[0]
    return None

def fetch_title(video_id):
    request = youtube.videos().list(
        part="snippet",
        id=video_id
    )
    response = request.execute()
    items = response.get("items", [])
    if not items:
        return None
    return items[0]["snippet"]["title"]

def main():
    with open(URL_FILE, "r") as f:
        urls = [line.strip() for line in f if line.strip()]

    results = []

    for url in urls:
        video_id = extract_video_id(url)
        if not video_id:
            print(f"⚠️ Could not extract video ID from {url}")
            continue

        try:
            title = fetch_title(video_id)
            if title:
                print(f"✅ {video_id}: {title}")
                results.append({
                    "video_id": video_id,
                    "title": title,
                    "url": url
                })
            else:
                print(f"❌ No title found for {video_id}")
        except Exception as e:
            print(f"❌ Error fetching {video_id}: {e}")

    with open(OUTPUT_FILE, "w") as f:
        json.dump(results, f, indent=2)

    print(f"\n🎉 Saved metadata for {len(results)} videos to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
