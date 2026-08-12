import asyncio, os
from playwright.async_api import async_playwright

SITES = [
    ("daroodi", "https://daroodi.com/"),
    ("kishaa", "https://kishaainternational.com/"),
]
OUT = "/home/user/assets/projects"
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36")

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(
            channel="chromium",
            headless=True,
            args=["--no-sandbox", "--disable-blink-features=AutomationControlled",
                  "--disable-features=IsolateOrigins,site-per-process"])
        for slug, url in SITES:
            ctx = await b.new_context(
                viewport={"width": 1440, "height": 900}, user_agent=UA,
                device_scale_factor=1.5, locale="en-US",
                timezone_id="Asia/Karachi", ignore_https_errors=True,
                extra_http_headers={
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
                    "Accept-Language": "en-US,en;q=0.9",
                    "Upgrade-Insecure-Requests": "1",
                    "Sec-Fetch-Dest": "document", "Sec-Fetch-Mode": "navigate",
                    "Sec-Fetch-Site": "none", "Sec-Fetch-User": "?1",
                })
            await ctx.add_init_script(
                "Object.defineProperty(navigator,'webdriver',{get:()=>undefined});"
                "window.chrome={runtime:{}};"
                "Object.defineProperty(navigator,'languages',{get:()=>['en-US','en']});"
                "Object.defineProperty(navigator,'plugins',{get:()=>[1,2,3,4,5]});")
            page = await ctx.new_page()
            try:
                r = await page.goto(url, wait_until="domcontentloaded", timeout=70000)
                print(slug, "status", r.status if r else "?")
                try:
                    await page.wait_for_load_state("networkidle", timeout=25000)
                except Exception: pass
                await page.wait_for_timeout(4000)
                await page.evaluate("""async () => {
                    document.querySelectorAll('img').forEach(i=>{i.loading='eager';
                      if(i.dataset.src&&!i.src)i.src=i.dataset.src;});
                    for (let y=0;y<3500;y+=350){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,200));}
                    window.scrollTo(0,0);await new Promise(r=>setTimeout(r,1500));
                }""")
                await page.wait_for_timeout(2500)
                await page.screenshot(path=f"{OUT}/{slug}.png")
                print("saved", slug)
            except Exception as e:
                print("FAIL", slug, repr(e)[:200])
            finally:
                await ctx.close()
        await b.close()

asyncio.run(main())
