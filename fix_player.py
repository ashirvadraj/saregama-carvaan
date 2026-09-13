with open("src/components/Player.tsx", "r", encoding="utf-8", errors="replace") as f:
    text = f.read()

# Replace all corrupted ?? sequences
text = text.replace("???????", "Record")
text = text.replace("???", "Lyrics")
text = text.replace("?????", "")
text = text.replace("????", "")
text = text.replace("??", "")

# Ensure view button text is clean
text = text.replace('<span className="hidden sm:inline">Record</span>', '<span className="hidden sm:inline">Record</span>')

with open("src/components/Player.tsx", "wb") as f:
    f.write(text.encode("utf-8"))

print("Fixed Player.tsx with clean UTF-8!")
