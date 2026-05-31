"""
Phone Number OSINT Tool – Gathers maximum public information.
Requires several free API keys (see comments).
"""

import re
import phonenumbers
from phonenumbers import carrier, geocoder, timezone
import requests
from bs4 import BeautifulSoup
import pywhatkit as kit
from telethon import TelegramClient


def parse_number(number: str):
    """Extract country, carrier, location, timezone from phone number."""
    try:
        parsed = phonenumbers.parse(number, None)
        is_valid = phonenumbers.is_valid_number(parsed)
        if not is_valid:
            return {"error": "Invalid phone number"}

        info = {
            "original": number,
            "e164": phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164),
            "country_code": parsed.country_code,
            "national_number": parsed.national_number,
            "country": geocoder.description_for_number(parsed, "en"),
            "carrier_original": carrier.name_for_number(parsed, "en"),
            "timezone": str(timezone.time_zones_for_number(parsed)),
            "number_type": phonenumbers.number_type(parsed)
        }
        type_map = {
            0: "FIXED_LINE",
            1: "MOBILE",
            2: "FIXED_LINE_OR_MOBILE",
            3: "TOLL_FREE",
            4: "PREMIUM_RATE",
            5: "SHARED_COST",
            6: "VOIP",
            7: "PERSONAL_NUMBER",
            8: "PAGER",
            9: "UAN",
            10: "VOICEMAIL"
        }
        info["type"] = type_map.get(info["number_type"], "UNKNOWN")
        return info
    except Exception as e:
        return {"error": str(e)}
    
def numverify_lookup(number: str, api_key: str):
    """Numverify – carrier, location, line type. 100 req/month free."""
    url = f"http://apilayer.net/api/validate?access_key={api_key}&number={number}"
    try:
        resp = requests.get(url, timeout=10)
        data = resp.json()
        if data.get("valid"):
            return {
                "numverify_country": data.get("country_name"),
                "numverify_location": data.get("location"),
                "numverify_carrier": data.get("carrier"),
                "numverify_line_type": data.get("line_type")
            }
        else:
            return {"numverify_error": "Invalid or no API key"}
    except:
        return {"numverify_error": "Request failed"}

def abstractapi_lookup(number: str, api_key: str):
    """AbstractAPI – phone validation + location."""
    url = f"https://phonevalidation.abstractapi.com/v1/?api_key={api_key}&phone={number}"
    try:
        resp = requests.get(url, timeout=10)
        data = resp.json()
        if data.get("valid"):
            return {
                "abstract_country": data.get("country", {}).get("name"),
                "abstract_region": data.get("location"),
                "abstract_carrier": data.get("carrier"),
                "abstract_line_type": data.get("line_type")
            }
        return {"abstract_error": "No data"}
    except:
        return {"abstract_error": "Request failed"}

# ----------------------------------------------------------------------
# 3. SPAM / REPUTATION (free crowdsourced)
# ----------------------------------------------------------------------
def spam_detection(number: str):
    """Check free spam databases via callername.net (scraping)."""
    url = f"https://www.callername.com/{number}"
    try:
        headers = {"User-Agent": "Mozilla/5.0"}
        resp = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(resp.text, "html.parser")
        # Look for spam risk indicator
        risk_tag = soup.find("div", class_="spam-risk")
        if risk_tag:
            return {"spam_risk": risk_tag.text.strip()}
        # Fallback: search for 'spam' in page text
        if "spam" in resp.text.lower():
            return {"spam_risk": "Likely spam (crowdsourced flags)"}
        return {"spam_risk": "Not flagged"}
    except:
        return {"spam_risk": "Check failed"}

# ----------------------------------------------------------------------
# 4. SOCIAL MEDIA & MESSENGER PRESENCE
# ----------------------------------------------------------------------
def whatsapp_check(number: str):
    """Check if number has WhatsApp (opens browser – you must manually verify)."""
    try:
        # pywhatkit checks presence via WhatsApp web
        exists = kit.check_whatsapp_number(number)
        return {"whatsapp_present": exists}
    except:
        return {"whatsapp_present": "Unknown (install pywhatkit correctly)"}

async def telegram_check(number: str, api_id: str, api_hash: str):
    """Check Telegram presence – needs API credentials from my.telegram.org."""
    client = TelegramClient('session_name', api_id, api_hash)
    await client.start()
    try:
        # Search for contact by phone number
        contact = await client.get_entity(number)
        return {"telegram_present": True, "telegram_username": contact.username}
    except:
        return {"telegram_present": False}
    finally:
        await client.disconnect()

# ----------------------------------------------------------------------
# 5. WEB & DATA BROKER PREVIEWS (Google search)
# ----------------------------------------------------------------------
def google_search(number: str, api_key: str = None, cx: str = None):
    """
    Use Google Programmable Search (free tier) or fallback to manual scraping.
    API key & custom search engine ID required for reliable results.
    """
    if api_key and cx:
        url = "https://www.googleapis.com/customsearch/v1"
        params = {
            "key": api_key,
            "cx": cx,
            "q": number,
            "num": 5
        }
        try:
            resp = requests.get(url, params=params)
            data = resp.json()
            if "items" in data:
                results = []
                for item in data["items"]:
                    results.append({
                        "title": item.get("title"),
                        "link": item.get("link"),
                        "snippet": item.get("snippet")
                    })
                return {"google_results": results}
        except:
            pass

    # Fallback: simulate (no actual scraping to avoid blocks)
    return {"google_results": "No API key provided – cannot fetch automatically"}

# ----------------------------------------------------------------------
# 6. MAIN ORCHESTRATOR
# ----------------------------------------------------------------------
def gather_all_info(phone_number: str):
    print(f"\n🔍 Gathering public info for: {phone_number}\n")

    # 1. Local parsing
    local = parse_number(phone_number)
    if "error" in local:
        print("❌", local["error"])
        return
    print("✅ Local parsing:")
    for k, v in local.items():
        print(f"   {k}: {v}")

    # 2. API lookups – replace with your own free keys
    #    Get Numverify key: https://numverify.com (free)
    #    Get AbstractAPI key: https://abstractapi.com (free)
    numverify_key = "YOUR_NUMVERIFY_API_KEY"
    if numverify_key != "YOUR_NUMVERIFY_API_KEY":
        nv = numverify_lookup(phone_number, numverify_key)
        print("\n📡 Numverify API:")
        for k, v in nv.items():
            print(f"   {k}: {v}")
    else:
        print("\n⚠️ Numverify: set API key in script to use")

    abstract_key = "YOUR_ABSTRACTAPI_KEY"
    if abstract_key != "YOUR_ABSTRACTAPI_KEY":
        ab = abstractapi_lookup(phone_number, abstract_key)
        print("\n📡 AbstractAPI:")
        for k, v in ab.items():
            print(f"   {k}: {v}")
    else:
        print("\n⚠️ AbstractAPI: set API key in script to use")

    # 3. Spam detection
    spam = spam_detection(phone_number)
    print("\n🚨 Spam / Reputation:")
    for k, v in spam.items():
        print(f"   {k}: {v}")

    # 4. WhatsApp check
    wa = whatsapp_check(phone_number)
    print("\n💬 WhatsApp presence:", wa["whatsapp_present"])

    # 5. Telegram (async – run with asyncio)
    print("\n📱 Telegram check skipped – requires api_id/api_hash and asyncio")
    print("   Uncomment code block and provide credentials to enable")

    # 6. Google search (requires API key)
    print("\n🌐 Google search results (requires Custom Search API):")
    gkey = "YOUR_GOOGLE_API_KEY"
    gcx = "YOUR_SEARCH_ENGINE_ID"
    if gkey != "YOUR_GOOGLE_API_KEY":
        gsearch = google_search(phone_number, gkey, gcx)
        if "google_results" in gsearch and isinstance(gsearch["google_results"], list):
            for res in gsearch["google_results"]:
                print(f"   → {res['title']} - {res['link']}")
        else:
            print("   ", gsearch["google_results"])
    else:
        print("   No Google API key – add to see search results")

    print("\n" + "="*50)
    print("⚠️  Note: No private data (calls, texts, live location) was accessed.")
    print("   For real-time location or CDRs, a warrant is required.")

if __name__ == "__main__":
    import sys
    if len(sys.argv) != 2:
        print("Usage: python phone_osint.py +1234567890")
        sys.exit(1)
    gather_all_info(sys.argv[1])