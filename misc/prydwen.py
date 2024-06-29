import json
import re

# https://docs.google.com/spreadsheets/d/1SQK2xihURxiA2PTp0lAiRYXlphnm-EFa3CoKaUO7UOc/edit
# https://www.reddit.com/r/HonkaiStarRail/comments/1alenqa/20_update_relic_salvaging_helper_spreadsheet_for/

data = open('../prydwen.csv', 'r').read()
data = data.strip()
data = data.split('\n')
obj = {}
displayNameMapping = {
  "Dan Heng - Imbibitor Lunae": ["Imbibitor Lunae"],
  "Trailblazer (Physical)": ["Caelus (Destruction)", "Stelle (Destruction)"],
  "Trailblazer (Fire)": ["Caelus (Preservation)", "Stelle (Preservation)"],
  "Trailblazer (Imaginary)": ["Caelus (Harmony)", "Stelle (Harmony)"],
}
for line in data:
    line = line.split('\t')
    char = line[1]
    chars = displayNameMapping.get(char) or [char]
    relicsets = re.findall(r'([^, ]+,? [^,]*)(?:, |$)', line[2])
    assert ', '.join(relicsets) == line[2], (relicsets, line[2])
    ornamentsets = re.findall(r'([^, ]+,? [^,]*)(?:, |$)', line[5])
    assert ', '.join(ornamentsets) == line[5], (ornamentsets, line[5])
    for char in chars:
        obj[char] = relicsets + ornamentsets

f = open('src/data/prydwen.json', 'w')
json.dump(obj, f)