from __future__ import annotations

import os
import shutil
from pathlib import Path

from selenium import webdriver

RUNTIME_ROOT = Path(__file__).resolve().parent / ".runtime"
PERSISTENT_USER_DATA_DIR = RUNTIME_ROOT / "chrome-user-data"
HOST_USER_DATA_DIR = Path(os.path.expandvars(r"%LOCALAPPDATA%\Google\Chrome\User Data"))

IGNORED_NAMES = {
    "BrowserMetrics",
    "Crashpad",
    "Default",
    "DawnCache",
    "GPUCache",
    "GrShaderCache",
    "GraphiteDawnCache",
    "OptimizationHints",
    "Safe Browsing",
    "ShaderCache",
    "SingletonCookie",
    "SingletonLock",
    "SingletonSocket",
}
IGNORED_PATTERNS = [
    "*.tmp",
    "*.log",
    "*.lock",
    "Current Session",
    "Current Tabs",
    "Last Session",
    "Last Tabs",
    "LOCK",
    "LOCKFILE",
    "lockfile",
    "DevToolsActivePort",
    "Singleton*",
]


def _is_profile_lock_error(error: BaseException) -> bool:
    lowered = str(error).lower()
    return any(
        fragment in lowered
        for fragment in ("used by another process", "already in use", "permission denied", "winerror 32")
    )


def _remove_lock_artifacts(root: Path) -> None:
    for pattern in ("Singleton*", "DevToolsActivePort", "LOCK", "LOCKFILE", "lockfile"):
        for path in root.glob(pattern):
            if path.is_file() or path.is_symlink():
                path.unlink(missing_ok=True)


def ensure_testing_profile(profile_name: str = "Default") -> tuple[Path, str]:
    PERSISTENT_USER_DATA_DIR.mkdir(parents=True, exist_ok=True)
    target_profile = PERSISTENT_USER_DATA_DIR / profile_name

    if HOST_USER_DATA_DIR.exists() and not target_profile.exists():
        source_profile = HOST_USER_DATA_DIR / profile_name
        if source_profile.exists():
            try:
                local_state = HOST_USER_DATA_DIR / "Local State"
                if local_state.exists():
                    shutil.copy2(local_state, PERSISTENT_USER_DATA_DIR / "Local State")
                shutil.copytree(
                    source_profile,
                    target_profile,
                    dirs_exist_ok=True,
                    ignore=shutil.ignore_patterns(*IGNORED_PATTERNS, *IGNORED_NAMES),
                )
            except (OSError, shutil.Error) as exc:
                if _is_profile_lock_error(exc):
                    if not target_profile.exists():
                        print("ERROR: Chrome esta abierto. Cierra Chrome manualmente y ejecuta de nuevo.")
                else:
                    raise

    _remove_lock_artifacts(PERSISTENT_USER_DATA_DIR)
    return PERSISTENT_USER_DATA_DIR, profile_name


def get_driver(profile_name: str = "Default", headless: bool = False):
    if headless:
        user_data_dir = RUNTIME_ROOT / "headless-user-data"
        user_data_dir.mkdir(parents=True, exist_ok=True)
        _remove_lock_artifacts(user_data_dir)
        resolved_profile = "Default"
    else:
        user_data_dir, resolved_profile = ensure_testing_profile(profile_name)

    options = webdriver.ChromeOptions()
    options.add_argument(f"user-data-dir={user_data_dir}")
    options.add_argument(f"profile-directory={resolved_profile}")
    options.add_argument("--start-maximized")
    options.add_argument("--window-size=1440,1100")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("--disable-extensions")
    options.add_argument("--disable-component-extensions-with-background-pages")
    options.add_argument("--no-default-browser-check")
    options.add_argument("--disable-search-engine-choice-screen")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option("useAutomationExtension", False)
    options.set_capability("goog:loggingPrefs", {"browser": "ALL"})

    if headless:
        options.add_argument("--headless=new")

    try:
        return webdriver.Chrome(options=options), user_data_dir
    except Exception as exc:
        if _is_profile_lock_error(exc):
            print("ERROR: Chrome esta abierto. Cierra Chrome manualmente y ejecuta de nuevo.")
            return None, user_data_dir
        raise
