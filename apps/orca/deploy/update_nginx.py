from __future__ import annotations

import os
from pathlib import Path


def main() -> None:
    app_dir = Path(os.environ["APP_DIR"])
    nginx_conf = Path(os.environ["NGINX_CONF"])
    marker_begin = os.environ["MARKER_BEGIN"]
    marker_end = os.environ["MARKER_END"]
    domain = os.environ["APP_DOMAIN"]
    domains = os.environ.get("APP_DOMAINS", domain)

    template_path = app_dir / "deploy" / "nginx-orca.conf.template"
    snippet = (
        template_path.read_text(encoding="utf-8")
        .replace("__APP_DOMAIN__", domain)
        .replace("__APP_DOMAINS__", domains)
        .strip()
    )
    block = f"{marker_begin}\n{snippet}\n{marker_end}"

    content = nginx_conf.read_text(encoding="utf-8")
    if marker_begin in content and marker_end in content:
        before, remainder = content.split(marker_begin, 1)
        _, after = remainder.split(marker_end, 1)
        new_content = before.rstrip() + "\n\n" + block + "\n" + after.lstrip()
    else:
        new_content = content.rstrip() + "\n\n" + block + "\n"

    nginx_conf.write_text(new_content, encoding="utf-8")


if __name__ == "__main__":
    main()
