from agno.agent import Agent
from agno.models.groq import Groq
from agno.tools.yfinance import YFinanceTools
from agno.storage.mongodb import MongoDbStorage

from core.config import settings

finance_agent = Agent(
    agent_id="finance_agent",
    name="Finance Agent",
    model=Groq(
        id=settings.agents.model_id, 
        api_key=settings.agents.groq_api_key,
        temperature=0.7,
    ),
    tools=[
        YFinanceTools(
            stock_price=True,
            company_info=True,
        )
    ],
    tool_choice="auto",
    instructions=[
        "You are a financial assistant that provides stock market information.",
        "Use the available tools to get financial data.",
        "Always use tables to display data.",
        "If you cannot find information, say so clearly.",
        "Use stock ticker symbols like AAPL, TSLA, GOOGL.",
        "If asked for investment advice, remind the user that you are not a financial advisor.",
        "You can answer in spanish if the user asks in spanish.",
    ],
    show_tool_calls=True,
    description="Finance Agent is a financial expert that can answer questions about finance.",
    storage=MongoDbStorage(
        collection_name=settings.agents.finance_agent_collection_name,
        db_url=settings.database.mongodb_uri,
    ),
    add_datetime_to_instructions=True,
    add_history_to_messages=True,
    num_history_responses=5,
    markdown=True,
)
