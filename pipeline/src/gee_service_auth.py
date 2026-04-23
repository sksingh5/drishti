"""Authenticate to GEE using a service account for CI/CD."""

import os
import ee


def authenticate_service_account():
    email = os.environ.get("GEE_SERVICE_ACCOUNT_EMAIL")
    key_raw = os.environ.get("GEE_PRIVATE_KEY", "")
    project = os.environ.get("GEE_PROJECT", "climaterisk-494201")

    if not email or not key_raw:
        print("[GEE Auth] No service account credentials found, using default auth...")
        ee.Initialize(project=project)
        return

    key = key_raw.replace("\\n", "\n")
    credentials = ee.ServiceAccountCredentials(email, key_data=key)
    ee.Initialize(credentials, project=project)
    print(f"[GEE Auth] Authenticated as {email}")
