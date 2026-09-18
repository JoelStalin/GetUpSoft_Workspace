"""
Unit tests for utils/validators.py
"""

import pytest
from bot.utils.validators import (
    extract_domain,
    is_domain_allowed,
    is_valid_url,
    sanitize_name,
)


class TestExtractDomain:
    def test_strips_www(self):
        assert extract_domain("https://www.galantesjewelry.com/page") == "galantesjewelry.com"

    def test_no_www(self):
        assert extract_domain("https://galantesjewelry.com") == "galantesjewelry.com"

    def test_subdomain(self):
        assert extract_domain("https://shop.galantesjewelry.com") == "shop.galantesjewelry.com"


class TestIsDomainAllowed:
    ALLOWED = ["galantesjewelry.com"]

    def test_exact_match(self):
        assert is_domain_allowed("https://galantesjewelry.com/", self.ALLOWED)

    def test_www_match(self):
        assert is_domain_allowed("https://www.galantesjewelry.com/", self.ALLOWED)

    def test_subdomain_match(self):
        assert is_domain_allowed("https://shop.galantesjewelry.com/", self.ALLOWED)

    def test_different_domain_blocked(self):
        assert not is_domain_allowed("https://instagram.com/", self.ALLOWED)

    def test_instagram_blocked(self):
        assert not is_domain_allowed("https://www.instagram.com/daniellogalante", self.ALLOWED)

    def test_facebook_blocked(self):
        assert not is_domain_allowed("https://www.facebook.com/profile.php?id=123", self.ALLOWED)

    def test_empty_allowed_list(self):
        assert not is_domain_allowed("https://galantesjewelry.com/", [])


class TestIsValidUrl:
    def test_valid_https(self):
        assert is_valid_url("https://galantesjewelry.com")

    def test_valid_http(self):
        assert is_valid_url("http://example.com")

    def test_missing_scheme(self):
        assert not is_valid_url("galantesjewelry.com")

    def test_ftp_invalid(self):
        assert not is_valid_url("ftp://example.com")

    def test_empty_string(self):
        assert not is_valid_url("")


class TestSanitizeName:
    def test_strips_whitespace(self):
        assert sanitize_name("  Joel  ") == "Joel"

    def test_collapses_internal_spaces(self):
        assert sanitize_name("Joel   Galante") == "Joel Galante"

    def test_removes_control_chars(self):
        assert sanitize_name("Joel\x00Galante") == "JoelGalante"

    def test_newline_removed(self):
        assert "\n" not in sanitize_name("Joel\nGalante")

    def test_normal_name_unchanged(self):
        assert sanitize_name("María") == "María"
