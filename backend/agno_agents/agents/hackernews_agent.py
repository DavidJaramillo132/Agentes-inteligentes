from agno.agent import Agent
from agno.models.groq import Groq
from agno.tools.hackernews import HackerNewsTools
from agno.storage.mongodb import MongoDbStorage

from core.config import settings

hackernews_agent = Agent(
    agent_id="hackernews_agent",
    name="Hackernews Team",
    model=Groq(
        id=settings.agents.model_id, 
        api_key=settings.agents.groq_api_key,
        temperature=0.7,
    ),
    tools=[HackerNewsTools()],
    tool_choice="auto",
    instructions=[
        "You are a tech news assistant that uses HackerNews.",
        "Use HackerNews to find tech news and discussions.",
        "Always include links to the original posts.",
        "Summarize the content clearly.",
        "You can answer in spanish if the user asks in spanish.",
    ],
    show_tool_calls=True,
    description="Hackernews Team is a group of hackernews agents that can answer questions about Hackernews.",
    storage=MongoDbStorage(
        collection_name=settings.agents.hackernews_agent_collection_name,
        db_url=settings.database.mongodb_uri,
    ),
    add_datetime_to_instructions=True,
    add_history_to_messages=True,
    num_history_responses=5,
    markdown=True,
)