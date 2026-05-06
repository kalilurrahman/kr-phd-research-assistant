# Integration Guide - PhD Research Assistant Resources

## Quick Start (5 minutes)

### For HTML/Vanilla JavaScript Sites

1. **Copy JSON files** to your web server's `/data` directory
2. **Copy website_loader_example.html** and modify:
   ```javascript
   const API_BASE = './data/'; // Adjust path if needed
   ```
3. **Open in browser** and verify data loads

### For React/Vue Apps

1. **Copy JSON files** to `/public/data` directory
2. **Use react_component_example.jsx** as template
3. **Update fetch URLs**:
   ```javascript
   const [tools, setTools] = useState([]);
   
   useEffect(() => {
     fetch('/data/research_tools.json')
       .then(res => res.json())
       .then(data => setTools(data.tools));
   }, []);
   ```

### For Content Management Systems

1. **Import CSVs** into your database:
   - Wordpress: Use plugins like TablePress or WP CSV Importer
   - Drupal: Use CSV2JSON module
   - Any CMS: Use CSV import tool
2. **Create pages** for each resource type
3. **Link JSON data** to page templates

---

## Step-by-Step Integration

### Step 1: Organize Files

```bash
# Create directory structure
mkdir -p public/data
mkdir -p public/docs

# Copy files
cp *.json public/data/
cp *.csv public/data/
cp *.md public/docs/
```

### Step 2: Set Up Server (if needed)

**Node.js/Express:**
```javascript
const express = require('express');
const app = express();

app.use(express.static('public'));
app.use(express.json());

// Serve JSON files
app.get('/api/resources/comprehensive', (req, res) => {
  res.sendFile(__dirname + '/public/data/comprehensive_resources.json');
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

**Python/Flask:**
```python
from flask import Flask, jsonify
import json

app = Flask(__name__)

@app.route('/api/resources/comprehensive')
def get_resources():
    with open('data/comprehensive_resources.json') as f:
        return jsonify(json.load(f))

if __name__ == '__main__':
    app.run(debug=True)
```

### Step 3: Implement Frontend

**Option A: Vanilla JavaScript (Simplest)**
```javascript
// Load data
async function loadResources() {
  const response = await fetch('/data/comprehensive_resources.json');
  const data = await response.json();
  return data;
}

// Display tools
function renderTools(tools) {
  const html = tools.map(tool => `
    <div class="tool-card">
      <h3>${tool.name}</h3>
      <p>${tool.purpose}</p>
      <a href="${tool.website}">Visit →</a>
    </div>
  `).join('');
  
  document.getElementById('toolsContainer').innerHTML = html;
}

// Initialize
loadResources().then(data => {
  renderTools(data.tools.data);
});
```

**Option B: React (Recommended)**
```jsx
import { useState, useEffect } from 'react';

export default function ResourceCenter() {
  const [resources, setResources] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/comprehensive_resources.json')
      .then(res => res.json())
      .then(data => {
        setResources(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading resources...</div>;

  return (
    <div className="resource-center">
      <h1>{resources.meta.title}</h1>
      <section className="tools">
        {resources.tools.data.map(tool => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </section>
    </div>
  );
}

function ToolCard({ tool }) {
  return (
    <div className="card">
      <h3>{tool.name}</h3>
      <span className="badge">{tool.category}</span>
      <p>{tool.purpose}</p>
      <a href={tool.website} target="_blank">Learn More →</a>
    </div>
  );
}
```

**Option C: Vue.js**
```vue
<template>
  <div class="resource-center">
    <h1>{{ resources.meta.title }}</h1>
    <div class="tools-grid">
      <div v-for="tool in resources.tools.data" :key="tool.id" class="tool-card">
        <h3>{{ tool.name }}</h3>
        <span class="badge">{{ tool.category }}</span>
        <p>{{ tool.purpose }}</p>
        <a :href="tool.website" target="_blank">Visit →</a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return { resources: null };
  },
  async mounted() {
    const res = await fetch('/data/comprehensive_resources.json');
    this.resources = await res.json();
  }
}
</script>
```

### Step 4: Add Search & Filtering

```javascript
// Search
function searchResources(query) {
  const lowQuery = query.toLowerCase();
  return resources.tools.data.filter(tool =>
    tool.name.toLowerCase().includes(lowQuery) ||
    tool.purpose.toLowerCase().includes(lowQuery)
  );
}

// Filter by category
function filterByCategory(category) {
  return resources.tools.data.filter(tool => 
    tool.category === category
  );
}

// Get unique categories
function getCategories() {
  return [...new Set(resources.tools.data.map(t => t.category))];
}
```

### Step 5: Add Navigation

```javascript
// Phase-based navigation
function getResourcesForPhase(phase) {
  const phaseResources = resources.navigation.byResearchPhase[phase];
  return {
    recommended: phaseResources.resources,
    actions: phaseResources.actions,
    guides: phaseResources.guides
  };
}

// Research type guidance
function getGuidanceForType(type) {
  return resources.navigation.byResearchType[type];
}
```

---

## Database Integration

### Import CSV to Excel
1. Open Excel
2. Data → From Text
3. Select CSV file
4. Follow wizard

### Import CSV to Airtable
1. Create base
2. Click "+" → Import data
3. Select CSV file
4. Map columns
5. Create base

### Import CSV to Notion
1. Create page with database
2. Click "..." → Import
3. Select CSV
4. Map fields to columns
5. Create database

### Import JSON to Supabase
```javascript
// Load JSON and create table
const data = await fetch('/data/research_tools.json').then(r => r.json());

const { data: result, error } = await supabase
  .from('tools')
  .insert(data.tools.data);
```

---

## CORS Setup (Cross-Domain)

If your site and API are on different domains:

```javascript
// Add CORS headers (server-side)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
```

Or use CORS proxy:
```javascript
// Client-side (not ideal for production)
const corsProxy = 'https://cors-anywhere.herokuapp.com/';
const url = corsProxy + 'https://your-api.com/data/resources.json';
```

---

## Performance Optimization

### 1. Compress JSON
```bash
gzip comprehensive_resources.json
# Results in ~80% size reduction
```

### 2. Cache in Browser
```javascript
// Service Worker caching
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('v1').then(cache => {
      return cache.addAll([
        '/data/comprehensive_resources.json'
      ]);
    })
  );
});
```

### 3. Lazy Load by Tab
```javascript
const resources = {};

async function loadTab(tabName) {
  if (!resources[tabName]) {
    const file = {
      'tools': 'research_tools.json',
      'methodologies': 'research_methodologies.json',
      'practices': 'phd_best_practices.json'
    }[tabName];
    
    const res = await fetch(`/data/${file}`);
    resources[tabName] = await res.json();
  }
  return resources[tabName];
}
```

### 4. Use CDN
```html
<!-- Serve from CDN instead of your server -->
<script src="https://cdn.example.com/data/comprehensive_resources.json"></script>
```

---

## Troubleshooting

### "Failed to load JSON"
- **Check paths**: Ensure JSON files are in correct directory
- **Check CORS**: Enable CORS if different domain
- **Check permissions**: Ensure files are readable

### "Search not working"
- Verify data structure in browser console: `console.log(data)`
- Check filter logic for correct field names

### "Page loading slowly"
- Use lazy loading for tabs
- Implement caching
- Gzip compress JSON files
- Use CDN for distribution

### "Data not displaying"
- Check console for errors
- Verify JSON structure matches expected format
- Use browser DevTools to inspect data

---

## Example Implementation Timeline

**Day 1**: Set up directory structure, copy files
**Day 2**: Implement basic data loading in React/Vue
**Day 3**: Add search and filtering
**Day 4**: Add navigation and phase guidance
**Day 5**: Optimize performance, deploy

---

## Support Resources

- **API Documentation**: See API_DOCUMENTATION.md
- **Examples**: 
  - website_loader_example.html (Vanilla JS)
  - react_component_example.jsx (React)
- **Data Files**:
  - comprehensive_resources.json (Complete)
  - Individual JSON files (Modular)
- **GitHub Integration**: Use Markdown guides in docs/

---

## Questions?

1. Check API_DOCUMENTATION.md for detailed specs
2. Review example implementations
3. Test with sample JSON in browser console
4. Refer to original documentation files

