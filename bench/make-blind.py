import json, os, random, re, shutil
ids = ["fluid","skills","feel-better","libraries","ui-craft","taste","uiwiki","ibelick","emil","kemiljk","magicui"]
random.seed(20261031)
codes = random.sample(list("ABCDEFGHJKMN"), len(ids))
key = dict(zip(codes, ids))
out = "site-blind"
shutil.rmtree(out, ignore_errors=True); os.makedirs(out)
shutil.copytree("site/variants/baseline", f"{out}/baseline")
for c, v in key.items():
    d = f"{out}/{c}"
    shutil.copytree(f"site/variants/{v}", d)
    for root, _, fs in os.walk(d):
        for f in fs:
            p = os.path.join(root, f)
            if f.endswith(".js") and f != "lab-bridge.js":
                s = open(p, encoding="utf-8").read()
                s = re.sub(r"Variant: [^`\"<]*", "Variant " + c, s)
                open(p, "w", encoding="utf-8").write(s)
            if f == "index.html":
                s = open(p).read(); s = re.sub(r"<title>[^<]*</title>", f"<title>Fieldwork {c}</title>", s); open(p, "w").write(s)
json.dump(key, open("/home/claude/scratch/blind-key.json", "w"), indent=1)
print(sorted(key))
