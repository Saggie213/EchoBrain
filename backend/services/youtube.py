from youtube_transcript_api import YouTubeTranscriptApi
import urllib.request
import re
import json
import logging

logger = logging.getLogger(__name__)

def extract_video_id(url: str) -> str:
    # Match standard youtube.com/watch?v=... and youtu.be/...
    match = re.search(r"(?:v=|\/|youtu\.be\/)([0-9A-Za-z_-]{11}).*", url)
    if match:
        return match.group(1)
    raise ValueError("Invalid YouTube URL")

def get_video_metadata(video_id: str) -> dict:
    """Scrape basic video metadata without an API key."""
    url = f"https://www.youtube.com/watch?v={video_id}"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        html = urllib.request.urlopen(req, timeout=10).read().decode('utf-8')
        
        title_match = re.search(r'<title>(.*?)</title>', html)
        title = title_match.group(1).replace(" - YouTube", "") if title_match else "Unknown Title"
        
        # Try to extract channel name
        channel_match = re.search(r'"ownerChannelName":"(.*?)"', html)
        channel = channel_match.group(1) if channel_match else "Unknown Channel"
        
        # Try to extract duration from meta
        duration_match = re.search(r'"lengthSeconds":"(\d+)"', html)
        duration_secs = int(duration_match.group(1)) if duration_match else 0
        duration_str = f"{duration_secs // 60}:{(duration_secs % 60):02d}" if duration_secs else "Unknown"
        
        return {
            "title": title,
            "channel": channel, 
            "duration": duration_str,
            "url": url,
            "video_id": video_id,
            "thumbnail": f"https://img.youtube.com/vi/{video_id}/maxresdefault.jpg"
        }
    except Exception as e:
        logger.warning(f"Failed to scrape metadata for {video_id}: {e}")
        return {
            "title": "Unknown Title",
            "channel": "Unknown Channel",
            "duration": "Unknown",
            "url": url,
            "video_id": video_id,
            "thumbnail": f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg"
        }

def get_transcript(video_id: str) -> list[dict]:
    """Fetch transcript using youtube-transcript-api v1 API.
    
    Tries multiple English variants first, then falls back to any available language.
    """
    ytt_api = YouTubeTranscriptApi()
    
    # Try English variants first (en, en-GB, en-US, en-IN, en-AU, etc.)
    english_codes = ["en", "en-GB", "en-US", "en-IN", "en-AU", "en-CA"]
    
    for lang in english_codes:
        try:
            fetched = ytt_api.fetch(video_id, languages=[lang])
            return _convert_transcript(fetched)
        except Exception:
            continue
    
    # Fallback: fetch any available transcript (auto-generated or manual)
    try:
        transcript_list = ytt_api.list(video_id)
        # Pick the first available transcript
        for transcript_info in transcript_list:
            try:
                fetched = ytt_api.fetch(video_id, languages=[transcript_info.language_code])
                logger.info(f"Using transcript in language: {transcript_info.language} ({transcript_info.language_code})")
                return _convert_transcript(fetched)
            except Exception:
                continue
    except Exception:
        pass
    
    raise Exception(
        f"Failed to fetch transcript for video {video_id}: "
        "No transcripts available in any language."
    )


def _convert_transcript(fetched) -> list[dict]:
    """Convert FetchedTranscript snippets to plain dicts."""
    transcript = []
    for snippet in fetched:
        transcript.append({
            "text": snippet.text,
            "start": snippet.start,
            "duration": snippet.duration
        })
    return transcript

def get_full_transcript_text(transcript: list[dict]) -> str:
    """Combine all transcript segments into a single string."""
    return " ".join([item['text'] for item in transcript])
