import sys
import os
from pathlib import Path
from typing import Any, Optional
import logging

logger = logging.getLogger(__name__)

# Add hermes-agent to sys.path
# File is at orca/src/ai_automation_orchestrator/integrations/hermes_integration.py
# HERMES_DIR should be at orca/libs/hermes-agent
CURRENT_FILE = Path(__file__).resolve()
ORCA_SRC_DIR = CURRENT_FILE.parent.parent.parent
HERMES_DIR = ORCA_SRC_DIR.parent / "libs" / "hermes-agent"

sys.path.append(str(HERMES_DIR))

try:
    from run_agent import AIAgent
    HERMES_AVAILABLE = True
except ImportError as e:
    logger.warning(f"Could not import AIAgent from Hermes: {e}")
    HERMES_AVAILABLE = False
    AIAgent = None

class HermesIntegration:
    def __init__(self, model: Optional[str] = None):
        self.model = model or os.getenv("HERMES_MODEL", "claude-3-5-sonnet-20240620")
        self.agent = None
        if HERMES_AVAILABLE:
            try:
                self.agent = AIAgent(model=self.model)
            except Exception as e:
                logger.error(f"Failed to initialize AIAgent: {e}")

    def run_task(self, prompt: str) -> str:
        if not self.agent:
            return "Hermes Agent is not available or failed to initialize."
        
        try:
            # run_conversation is synchronous in Hermes
            response = self.agent.run_conversation(prompt)
            return response
        except Exception as e:
            logger.error(f"Error running Hermes task: {e}")
            return f"Error: {str(e)}"

async def run_hermes_autonomous_workflow(prompt: str) -> str:
    """
    Wrapper for Orca to run an autonomous task via Hermes.
    """
    integration = HermesIntegration()
    # Since run_task is sync, we run it in a thread to not block the event loop
    import asyncio
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, integration.run_task, prompt)
