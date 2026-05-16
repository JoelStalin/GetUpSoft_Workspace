import json
import os
import logging
from bot.models import FinalReport

logger = logging.getLogger("insta_bot")

class Reporter:
    def __init__(self, config):
        self.config = config

    def save_report(self, report: FinalReport):
        logger.info("[STEP] Exporting results and screenshots")
        
        # Guardar JSON - Sanitizar plataforma
        safe_platform = report.platform.replace("/", "_").replace("\\", "_")
        report_path = os.path.join(self.config.output_dir, f"report_{safe_platform}_{report.extraction.timestamp.replace(':', '-')}.json")
        
        # Convertir dataclass a dict recursivamente
        report_dict = {
            "platform": report.platform,
            "url": report.url,
            "extraction": vars(report.extraction),
            "steps": [vars(s) for s in report.steps],
            "summary": report.summary
        }
        
        with open(report_path, "w", encoding="utf-8") as f:
            json.dump(report_dict, f, indent=2, ensure_ascii=False)
            
        logger.info(f"[PASS] Report saved at: {report_path}")
        self.print_summary(report)

    def print_summary(self, report: FinalReport):
        print("\n" + "="*40)
        print("      INSTAGRAM DM BOT REPORT")
        print("="*40)
        print(f"Platform: {report.platform}")
        print(f"Name detected: {report.extraction.visible_name}")
        print(f"Confidence: {report.extraction.confidence}")
        print("-" * 40)
        for step in report.steps:
            print(f"[{step.status}] {step.name}: {step.message}")
        print("="*40 + "\n")
