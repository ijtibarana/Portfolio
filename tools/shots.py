import asyncio, os
from playwright.async_api import async_playwright

SITES = [
    ("growintek", "https://growintek.com/"),
    ("daroodi", "https://daroodi.com/"),
    ("kishaa", "https://kishaainternational.com/"),
    ("studyinaus", "https://studyin-aus.com/"),
    ("mdkat", "https://mdkat.com/"),
    ("pakexporters", "https://pak-exporters.com/"),
    ("zamanalytics", "https://www.zamanalytics.com/"),
]
OUT = "/home/user/assets/projects"
os.makedirs(OUT, exist_ok=True)

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")

async def shot(browser, slug, url):
    ctx = await browser.new_context(viewport={"width": 1440, "height": 900},
                                    user_agent=UA, device_scale_factor=1.5,
                                    ignore_https_errors=True)
    page = await ctx.new_page()
    try:
        await page.goto(url, wait_until="domcontentloaded", timeout=60000)
        try:
            await page.wait_for_load_state("networkidle", timeout=20000)
        except Exception:
            pass
        await page.wait_for_timeout(3500)
        # dismiss common cookie/popups
        for sel in ["text=Accept", "text=Accept All", "text=I Agree", "[aria-label='Close']", ".pum-close", "#cookie-accept"]:
            try:
                el = page.locator(sel).first
                if await el.is_visible(timeout=800):
                    await el.click(timeout=1200)
                    await page.wait_for_timeout(500)
            except Exception:
                pass
        # trigger lazy images
        await page.evaluate("""async () => {
            document.querySelectorAll('img[loading=lazy]').forEach(i=>i.loading='eager');
            for (let y=0; y<3000; y+=400){ window.scrollTo(0,y); await new Promise(r=>setTimeout(r,180)); }
            window.scrollTo(0,0); await new Promise(r=>setTimeout(r,1200));
        }""")
        await page.wait_for_timeout(1500)
        await page.screenshot(path=f"{OUT}/{slug}.png")
        print("OK", slug)
    except Exception as e:
        print("FAIL", slug, repr(e)[:160])
    finally:
        await ctx.close()

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=["--no-sandbox", "--disable-blink-features=AutomationControlled"])
        for slug, url in SITES:
            await shot(b, slug, url)
        await b.close()

asyncio.run(main())
