# Wrap the viewer fragment in a full HTML document for publish_files.
import sys, re
src, dst = sys.argv[1], sys.argv[2]
s = open(src).read()
m = re.search(r"<title>.*?</title>", s)
title = m.group(0) if m else "<title>UI System Lab</title>"
body = s.replace(title, "", 1)
head_extra = re.findall(r'<meta name="claude:viewport-fit-sides"[^>]*>|<link [^>]*>', body)
for h in head_extra: body = body.replace(h, "", 1)
out = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
{title}
{chr(10).join(head_extra)}
<style>html,body{{margin:0;height:100%}}:root{{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px);box-sizing:border-box}}*,*::before,*::after{{box-sizing:border-box}}[hidden]{{display:none!important}}</style>
</head>
<body>
{body.strip()}
</body>
</html>
"""
open(dst, "w").write(out)
print("wrapped", dst, len(out))
