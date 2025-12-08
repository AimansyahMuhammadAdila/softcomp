# Remove duplicate /api/result endpoint
with open('app.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find duplicate endpoint (second occurrence)
first_found = False
new_lines = []
skip_count = 0

for line in lines:
    if skip_count > 0:
        skip_count -= 1
        continue
    
    if '@app.route(\'/api/result\')' in line:
        if first_found:
            # Skip this duplicate and next 11 lines
            skip_count = 11
            continue
        else:
            first_found = True
    
    new_lines.append(line)

with open('app.py', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("[SUCCESS] Removed duplicate /api/result endpoint")
