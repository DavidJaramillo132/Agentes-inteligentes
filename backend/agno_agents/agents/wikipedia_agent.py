from agno.agent import Agent
from agno.models.groq import Groq
from agno.tools.wikipedia import WikipediaTools
from agno.storage.mongodb import MongoDbStorage

from core.config import settings

wikipedia_agent = Agent(
    agent_id="wikipedia_agent",
    name="Wikipedia Agent",
    model=Groq(
        id=settings.agents.model_id, 
        api_key=settings.agents.groq_api_key,
        temperature=0.7,
    ),
    tools=[WikipediaTools()],
    tool_choice="auto",
    instructions=[
        "You are a helpful assistant that uses Wikipedia to answer questions.",
        "When the user asks about a topic, use the wikipedia search tool to find information.",
        "Always cite the Wikipedia article as your source.",
        "Summarize the information in a clear and concise manner.",
        "You can answer in spanish if the user asks in spanish.",
    ],
    show_tool_calls=True,
    description="Wikipedia Agent is a knowledgeable agent that can answer questions about Wikipedia.",
    storage=MongoDbStorage(
        collection_name=settings.agents.wikipedia_agent_collection_name,
        db_url=settings.database.mongodb_uri,
    ),
    add_datetime_to_instructions=True,
    add_history_to_messages=True,
    num_history_responses=5,
    markdown=True,
)