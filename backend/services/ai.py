import json
import re
import logging
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from core.config import settings

logger = logging.getLogger(__name__)

# Fallback mock mind map for local testing without API key
def process_transcript_mock(transcript_text: str):
    logger.warning("No GROQ_API_KEY found. Using mock AI response.")
    return {
        "nodes": [
            {"id": "root", "label": "Video Topic", "type": "root", "description": "Main topic extracted from the video."},
            {"id": "sub1", "label": "Sub Topic 1", "type": "main", "parent": "root", "timestamp": "1:00", "description": "First major point discussed in the video."},
            {"id": "sub2", "label": "Sub Topic 2", "type": "main", "parent": "root", "timestamp": "2:30", "description": "Second major point discussed in the video."},
            {"id": "detail1", "label": "Detail A", "type": "sub", "parent": "sub1", "timestamp": "1:20", "description": "A supporting detail for sub topic 1."},
            {"id": "detail2", "label": "Detail B", "type": "sub", "parent": "sub2", "timestamp": "3:00", "description": "A supporting detail for sub topic 2."},
        ]
    }

def _extract_json(content: str) -> dict:
    """Robustly extract JSON from LLM response, handling markdown code fences."""
    # Strip markdown code fences in all variations
    content = content.strip()
    
    # Remove ```json ... ``` or ``` ... ```
    fence_match = re.search(r'```(?:json)?\s*\n?(.*?)\n?\s*```', content, re.DOTALL)
    if fence_match:
        content = fence_match.group(1).strip()
    
    return json.loads(content)


MINDMAP_PROMPT = PromptTemplate(
    input_variables=["text"],
    template="""You are an expert at extracting structured knowledge from video transcripts.
Analyze the following transcript and generate a mind map structure as a JSON object.

Rules:
1. Output MUST be a valid JSON object with a single key "nodes" containing an array.
2. The first node must have type "root" — it represents the overall video topic.
3. Create 3-6 "main" nodes for the major topics/sections discussed.
4. Under each main node, add 1-3 "sub" nodes for important details or examples.
5. Every non-root node MUST have a "parent" field referencing its parent node's id.
6. Include a "timestamp" field (e.g. "3:45") indicating roughly when this topic appears.
7. Include a "description" field (1-2 sentences) explaining the concept.
8. Keep labels short (2-5 words).

Each node schema:
- id: string (unique, lowercase, e.g. "intro", "main1", "sub1a")
- label: string (short title)
- type: "root" | "main" | "sub"
- parent: string (parent node id, omit for root)
- timestamp: string (e.g. "2:15", omit for root)
- description: string (1-2 sentence explanation)

Return ONLY the raw JSON object. No markdown, no code fences, no extra text.

Transcript:
{text}"""
)


async def process_transcript_for_mindmap(transcript_text: str):
    """Use Groq LLM to generate a structured mind map from transcript text."""
    if not settings.GROQ_API_KEY:
        return process_transcript_mock(transcript_text)
    
    try:
        llm = ChatGroq(
            model_name="llama-3.3-70b-versatile",
            temperature=0.2,
            groq_api_key=settings.GROQ_API_KEY
        )
        
        chain = MINDMAP_PROMPT | llm
        
        # Limit transcript to avoid exceeding context window
        response = await chain.ainvoke({"text": transcript_text[:60000]})
        
        return _extract_json(response.content)
    except Exception as e:
        logger.error(f"Error calling Groq for mind map: {e}")
        return process_transcript_mock(transcript_text)
