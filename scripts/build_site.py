#!/usr/bin/env python3
"""Builds dist/, the folder that goes on the server.

Only the files the site needs are copied (no .git, no docs, no tool files), and the
security headers are written next to them: `_headers` for Netlify or Cloudflare Pages,
`.htaccess` for Apache hosts. Run from anywhere:  python3 scripts/build_site.py
"""
import base64
import hashlib
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / 'dist'

PAGES = ['index.html', 'impressum.html', 'datenschutz.html']
FILES = PAGES + [
    'styles.css', 'tokens.css', 'base.css', 'main.js',
    'favicon.svg', 'apple-touch-icon.png', 'og.jpg',
    'robots.txt', 'sitemap.xml',
    'fonts/funnel-display-latin.woff2', 'fonts/funnel-sans-latin.woff2',
]
OPTIONAL = ['scrollcraft.css', 'scrollcraft.js']   # only the scroll version has these


def inline_script_hashes():
    """The pages carry one small inline script each; the policy allows exactly those."""
    hashes = []
    for page in PAGES:
        html = (ROOT / page).read_text(encoding='utf-8')
        for attrs, body in re.findall(r'<script([^>]*)>(.*?)</script>', html, flags=re.S):
            if 'src=' in attrs or 'application/ld+json' in attrs or not body.strip():
                continue
            digest = base64.b64encode(hashlib.sha256(body.encode('utf-8')).digest()).decode()
            value = "'sha256-%s'" % digest
            if value not in hashes:
                hashes.append(value)
    return hashes


def headers():
    csp = '; '.join([
        "default-src 'none'",
        "script-src 'self' " + ' '.join(inline_script_hashes()),
        "style-src 'self' 'unsafe-inline'",      # the pages place elements with style attributes
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self'",
        "manifest-src 'self'",
        "base-uri 'none'",
        "form-action 'none'",
        "frame-ancestors 'none'",
        "upgrade-insecure-requests",
    ])
    return [
        ('Content-Security-Policy', csp),
        ('Strict-Transport-Security', 'max-age=31536000'),
        ('X-Content-Type-Options', 'nosniff'),
        ('X-Frame-Options', 'DENY'),
        ('Referrer-Policy', 'strict-origin-when-cross-origin'),
        # clipboard-write stays on for this site: "Adresse kopieren" needs it
        ('Permissions-Policy', 'clipboard-write=(self), camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()'),
        ('Cross-Origin-Opener-Policy', 'same-origin'),
    ]


def main():
    missing = [f for f in FILES if not (ROOT / f).is_file()]
    if missing:
        sys.exit('Missing: ' + ', '.join(missing))
    if DIST.exists():
        shutil.rmtree(DIST)
    for f in FILES + [f for f in OPTIONAL if (ROOT / f).is_file()]:
        target = DIST / f
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(ROOT / f, target)

    head = headers()
    (DIST / '_headers').write_text('/*\n' + ''.join('  %s: %s\n' % h for h in head), encoding='utf-8')
    (DIST / '.htaccess').write_text(
        '<IfModule mod_headers.c>\n'
        + ''.join('  Header always set %s "%s"\n' % h for h in head)
        + '</IfModule>\n\n'
        '# no folder listings, and nothing that starts with a dot is served\n'
        'Options -Indexes\n'
        '<FilesMatch "^\\.">\n  Require all denied\n</FilesMatch>\n', encoding='utf-8')

    size = sum(p.stat().st_size for p in DIST.rglob('*') if p.is_file())
    print('dist/ built: %d files, %d KB' % (sum(1 for p in DIST.rglob('*') if p.is_file()), round(size / 1024)))

    # texts that still wait for facts must not go live unnoticed
    open_items = []
    for page in PAGES:
        for text in re.findall(r'<span class="fill"[^>]*>(.*?)</span>', (ROOT / page).read_text(encoding='utf-8'), flags=re.S):
            open_items.append('%s: %s' % (page, text.strip()))
    if open_items:
        print('\nNOT READY TO GO LIVE, placeholders left:')
        for item in open_items:
            print('  - ' + item)
        sys.exit(2)


if __name__ == '__main__':
    main()
