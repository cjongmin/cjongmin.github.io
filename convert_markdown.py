#!/usr/bin/env python3
"""
Markdown to HTML Converter for Blog Posts
Converts .md files from posts/markdown/ to .html files in posts/
"""

import os
import re
import json
from datetime import datetime
from pathlib import Path

def parse_frontmatter(content):
    """Parse YAML frontmatter from markdown content"""
    if not content.startswith('---'):
        return {}, content
    
    parts = content.split('---', 2)
    if len(parts) < 3:
        return {}, content
    
    frontmatter_text = parts[1].strip()
    content = parts[2].strip()
    
    frontmatter = {}
    for line in frontmatter_text.split('\n'):
        if ':' in line:
            key, value = line.split(':', 1)
            key = key.strip()
            value = value.strip().strip('"\'')
            
            # Handle list values (tags)
            if key == 'tags' and value.startswith('[') and value.endswith(']'):
                # Parse list format: ["tag1", "tag2", "tag3"]
                import ast
                try:
                    frontmatter[key] = ast.literal_eval(value)
                except:
                    # Fallback: simple split
                    tags_str = value.strip('[]')
                    frontmatter[key] = [tag.strip().strip('"\'') for tag in tags_str.split(',')]
            else:
                frontmatter[key] = value
    
    return frontmatter, content

def markdown_to_html(markdown_content):
    """Convert markdown content to HTML"""
    html = markdown_content
    
    # Headers
    html = re.sub(r'^### (.*)$', r'<h3>\1</h3>', html, flags=re.MULTILINE)
    html = re.sub(r'^## (.*)$', r'<h2>\1</h2>', html, flags=re.MULTILINE)
    html = re.sub(r'^# (.*)$', r'<h1>\1</h1>', html, flags=re.MULTILINE)
    
    # Bold and italic
    html = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', html)
    html = re.sub(r'\*(.*?)\*', r'<em>\1</em>', html)
    
    # Links
    html = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2" target="_blank" rel="noopener">\1</a>', html)
    
    # Code blocks
    html = re.sub(r'```(\w+)?\n(.*?)\n```', r'<pre><code class="language-\1">\2</code></pre>', html, flags=re.DOTALL)
    html = re.sub(r'`([^`]+)`', r'<code>\1</code>', html)
    
    # Lists
    html = re.sub(r'^\- (.*)$', r'<li>\1</li>', html, flags=re.MULTILINE)
    html = re.sub(r'^(\d+)\. (.*)$', r'<li>\2</li>', html, flags=re.MULTILINE)
    
    # Wrap consecutive list items in ul/ol
    html = re.sub(r'(<li>.*</li>\n?)+', lambda m: '<ul>\n' + m.group(0) + '</ul>', html, flags=re.DOTALL)
    
    # Paragraphs
    paragraphs = html.split('\n\n')
    html_paragraphs = []
    for p in paragraphs:
        p = p.strip()
        if p and not p.startswith('<'):
            p = f'<p>{p}</p>'
        html_paragraphs.append(p)
    html = '\n\n'.join(html_paragraphs)
    
    # Line breaks
    html = html.replace('\n', '<br>\n')
    
    return html

def generate_html_template(title, description, content, date, tags, category):
    """Generate complete HTML template for blog post"""
    
    # Convert tags to string
    if isinstance(tags, list):
        tags_str = ', '.join(tags)
    else:
        tags_str = str(tags) if tags else ''
    
    # Format date
    if isinstance(date, str):
        try:
            parsed_date = datetime.strptime(date, '%Y-%m-%d')
            formatted_date = parsed_date.strftime('%B %d, %Y')
        except:
            formatted_date = date
    else:
        formatted_date = date.strftime('%B %d, %Y') if hasattr(date, 'strftime') else str(date)
    
    template = f'''<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title} • Jongmin Choi</title>
    <meta name="description" content="{description}" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../assets/css/styles.css" />
  </head>
  <body class="has-rail">
    <aside class="profile-rail-global">
      <div class="profile-card">
        <img class="profile-photo" id="profile-photo-global" alt="profile photo" />
        <div class="profile-name" id="profile-name-global">Jongmin Choi</div>
        <div class="profile-affil" id="profile-affil-global"></div>
        
        <div class="profile-divider"></div>
        
        <div class="profile-section">
          <div class="profile-section-title">At a Glance</div>
          <div class="profile-stats" id="profile-stats-global"></div>
        </div>
        
        <div class="profile-divider"></div>
        
        <div class="profile-section">
          <div class="profile-section-title">Links</div>
          <div class="profile-links" id="profile-links-global"></div>
        </div>
      </div>
    </aside>
    
    <header class="site-header">
      <div class="container">
        <a href="../index.html" class="brand">Jongmin Choi</a>
        <nav class="site-nav">
          <a href="../index.html">About Me</a>
          <a href="../publications.html">Publications</a>
          <a href="../awards.html">Awards</a>
          <a href="../blog.html">Blog</a>
          <a href="../contact.html">Contact</a>
        </nav>
        <div class="header-actions">
          <button id="theme-toggle" class="theme-toggle" aria-label="Toggle theme">
            <span class="icon moon">☾</span>
            <span class="icon sun">☀</span>
          </button>
        </div>
      </div>
    </header>
    
    <main class="container">
      <article class="blog-post-content reveal">
        <h1>{title}</h1>
        <div class="post-meta" style="margin-bottom: 32px;">{formatted_date} • {tags_str}</div>
        
        {content}
      </article>
    </main>
    
    <footer class="site-footer">
      <div class="container">
        <p>&copy; 2025 Jongmin Choi. All rights reserved.</p>
      </div>
    </footer>
    
    <script src="../assets/js/render.js"></script>
    <script src="../assets/js/main.js"></script>
  </body>
</html>'''
    
    return template

def update_index_json(posts_dir):
    """Update the index.json file with all HTML posts"""
    posts = []
    
    for html_file in posts_dir.glob('*.html'):
        if html_file.name == 'index.json':
            continue
            
        # Extract metadata from HTML file
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extract title
        title_match = re.search(r'<title>(.*?) • Jongmin Choi</title>', content)
        title = title_match.group(1) if title_match else html_file.stem
        
        # Extract description
        desc_match = re.search(r'<meta name="description" content="(.*?)"', content)
        description = desc_match.group(1) if desc_match else ''
        
        # Extract date and tags from post-meta
        meta_match = re.search(r'<div class="post-meta".*?>(.*?)</div>', content)
        meta_content = meta_match.group(1) if meta_match else ''
        
        # Parse date and tags
        parts = meta_content.split(' • ')
        date = parts[0] if parts else ''
        tags = parts[1].split(', ') if len(parts) > 1 else []
        
        # Determine category based on filename or content
        category = 'General'
        if 'conference' in html_file.name.lower() or 'conference' in tags:
            category = 'Conference'
        elif 'talk' in html_file.name.lower() or 'talk' in tags:
            category = 'Talk'
        
        posts.append({
            'title': title,
            'description': description,
            'date': date,
            'tags': tags,
            'category': category,
            'filename': html_file.name
        })
    
    # Sort by date (newest first)
    posts.sort(key=lambda x: x['date'], reverse=True)
    
    # Write index.json
    index_path = posts_dir / 'index.json'
    with open(index_path, 'w', encoding='utf-8') as f:
        json.dump(posts, f, indent=2, ensure_ascii=False)

def convert_markdown_files():
    """Convert all markdown files to HTML"""
    script_dir = Path(__file__).parent
    markdown_dir = script_dir / 'posts' / 'markdown'
    posts_dir = script_dir / 'posts'
    
    if not markdown_dir.exists():
        print(f"Markdown directory not found: {markdown_dir}")
        return
    
    converted_count = 0
    
    for md_file in markdown_dir.glob('*.md'):
        print(f"Converting {md_file.name}...")
        
        # Read markdown file
        with open(md_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Parse frontmatter
        frontmatter, markdown_content = parse_frontmatter(content)
        
        # Extract metadata
        title = frontmatter.get('title', md_file.stem.replace('-', ' ').title())
        description = frontmatter.get('description', '')
        date = frontmatter.get('date', datetime.now().strftime('%Y-%m-%d'))
        tags = frontmatter.get('tags', [])
        category = frontmatter.get('category', 'General')
        
        # Convert markdown to HTML
        html_content = markdown_to_html(markdown_content)
        
        # Generate HTML template
        html_template = generate_html_template(title, description, html_content, date, tags, category)
        
        # Write HTML file
        html_file = posts_dir / f"{md_file.stem}.html"
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(html_template)
        
        converted_count += 1
        print(f"  → {html_file.name}")
    
    # Update index.json
    print("Updating index.json...")
    update_index_json(posts_dir)
    
    print(f"\n✅ Converted {converted_count} markdown files to HTML")

if __name__ == '__main__':
    convert_markdown_files()
