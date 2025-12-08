# -*- coding: utf-8 -*-
"""
Script to rebuild index.html with proper HTML entities for emoji
"""

# HTML header template
html_header = '''<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>&#x1F525; Optimasi Pakan Sapi - ULTRA MODE &#x1F680;</title>
    <link rel="stylesheet" href="{{{{ url_for('static', filename='css/style.css') }}}}">
    <link rel="stylesheet" href="{{{{ url_for('static', filename='css/subtle-animations.css') }}}}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Orbitron:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
</head>
<body>
    <!-- Visual Effects Layer -->
    <canvas id="particleCanvas" class="effect-layer"></canvas>
'''

#Read broken HTML (which is missing header)
with open('templates/index.html.broken', 'r', encoding='utf-8', errors='ignore') as f:
    body_content = f.read()
    
# Replace all emoji with HTML entities
replacements = {
    '🐄': '&#x1F404;',  # cow
    '🔥': '&#x1F525;',  # fire
    '🚀': '&#x1F680;',  # rocket
    '⚙️': '&#x2699;&#xFE0F;',  # gear
    '⚡': '&#x26A1;',  # zap
    '🏆': '&#x1F3C6;',  # trophy
    '📊': '&#x1F4CA;',  # chart
    '🔬': '&#x1F52C;',  # microscope
    '🎯': '&#x1F3AF;',  # target
    '📈': '&#x1F4C8;',  # chart increasing
    '💪': '&#x1F4AA;',  # muscle
    '🌾': '&#x1F33E;',  # rice
    '💰': '&#x1F4B0;',  # money bag
    '⭐': '&#x2B50;',  # star
    '↺': '&#x21BA;',  # rotate
    '▼': '&#x25BC;',  # down arrow
}

for emoji, entity in replacements.items():
    body_content = body_content.replace(emoji, entity)

# Combine header + body
full_html = html_header + body_content

# Write to new file
with open('templates/index.html', 'w', encoding='utf-8') as f:
    f.write(full_html)

print("[SUCCESS] HTML file rebuilt successfully!")
print("[SUCCESS] All emoji converted to HTML entities")
