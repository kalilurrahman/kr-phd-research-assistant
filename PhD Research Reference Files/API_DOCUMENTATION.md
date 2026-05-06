# PhD Research Assistant - JSON API Documentation

## Overview

The comprehensive JSON files provide complete resource data for website integration. Choose the structure that best fits your needs:

### Available JSON Files

1. **comprehensive_resources.json** (Recommended)
   - Single file with all resources organized by category
   - Best for: Complete site loading, reduced HTTP requests
   - Size: ~500 KB
   - Format: Nested structure with metadata

2. **index.json** 
   - Master index with navigation and resource links
   - Best for: Navigation structure, quick lookups
   - Links to individual resource JSON files

3. **research_tools.json**
   - 36 research tools with detailed specifications
   - Best for: Tool directory, filtering by category

4. **research_methodologies.json**
   - 15 research methodologies with characteristics
   - Best for: Methodology selection guide

5. **phd_best_practices.json**
   - 20+ best practices with timelines
   - Best for: Implementation checklist, timeline planner

6. **publication_venues.json**
   - 20+ publication options with metrics
   - Best for: Publication strategy planner

7. **research_ethics.json**
   - 15+ compliance requirements
   - Best for: Ethics compliance checklist

---

## API Endpoints

If implementing as an API server:

```javascript
// Base URLs (adjust based on your server)
GET /api/resources/comprehensive     // Complete data
GET /api/resources/tools             // Tools only
GET /api/resources/methodologies     // Methodologies only
GET /api/resources/practices         // Best practices
GET /api/resources/venues            // Publication venues
GET /api/resources/ethics            // Ethics requirements
GET /api/resources/index             // Navigation index

// Filtering
GET /api/resources/tools?category=Qualitative%20Analysis
GET /api/resources/practices?phase=Planning
GET /api/resources/ethics?category=Human%20Subjects
```

---

## Data Structure Examples

### Tools Object

```json
{
  "id": "tool_001",
  "name": "Zotero",
  "category": "Literature Management",
  "purpose": "Citation management, bibliography generation",
  "type": "Open Source",
  "cost": "Free",
  "features": ["Plugins", "collaboration", "browser integration"],
  "bestFor": ["Academic writing", "Citation management"],
  "website": "zotero.org",
  "rating": 4.8,
  "reviews": 450
}
```

### Methodology Object

```json
{
  "id": "M001",
  "type": "Quantitative Research",
  "description": "Numerical data analysis using statistics",
  "designApproach": "Deductive; hypothesis-testing",
  "dataType": "Numerical; structured data",
  "analysisApproach": "Statistical analysis; patterns",
  "strengths": ["Objective", "measurable", "generalizable"],
  "challenges": ["Standardization", "response rates"],
  "bestFor": ["Hypothesis testing", "large-scale studies"],
  "recommendedTools": ["SPSS", "R", "Python", "Stata"],
  "timeline": "6-12 months",
  "difficulty": "Intermediate"
}
```

### Practice Object

```json
{
  "id": "BP001",
  "name": "Define Research Questions",
  "area": "Research Design",
  "phase": "Planning",
  "description": "Establish clear, focused research questions",
  "steps": ["Review literature", "Identify gap", "Write questions"],
  "tools": ["Research journal", "advisor"],
  "successIndicators": ["Questions are specific", "answerable"],
  "timeline": "Month 1-2"
}
```

### Publication Venue Object

```json
{
  "id": "PV001",
  "name": "High-Impact Journals",
  "type": "Peer-Reviewed Journal",
  "category": "High-Impact Multidisciplinary",
  "examples": ["Nature", "Science", "PNAS"],
  "peerReview": "Rigorous (2-4 months)",
  "timeline": "12-18 months",
  "audience": "Broad scientific community",
  "reach": "Very High",
  "citability": "Yes; high citation potential",
  "advantages": ["Highest credibility", "maximum reach"],
  "considerations": ["Extremely competitive", "slow publication"],
  "impactFactor": "High"
}
```

### Compliance Requirement Object

```json
{
  "id": "EC001",
  "category": "Human Subjects",
  "name": "IRB Approval",
  "description": "Institutional Review Board review for human subjects",
  "whenNeeded": "Any research involving human participants",
  "actions": ["Complete CITI training", "Develop protocol", "Submit to IRB"],
  "documentation": "IRB approval letter",
  "timeline": "2-6 months",
  "penalties": "Research suspension; disqualification; legal liability",
  "resources": ["CITI Training", "IRB office", "OHRP"]
}
```

---

## Loading Strategies

### Strategy 1: Load All at Once (Recommended for Small Sites)

```javascript
async function loadAllResources() {
  const response = await fetch('/data/comprehensive_resources.json');
  const data = await response.json();
  
  return {
    tools: data.tools.data,
    methodologies: data.methodologies.data,
    practices: data.bestPractices.practices,
    venues: data.publicationVenues.venues,
    ethics: data.ethicsCompliance.categories
  };
}
```

### Strategy 2: Lazy Load by Tab (Better for Large Sites)

```javascript
const resourceFiles = {
  tools: '/data/research_tools.json',
  methodologies: '/data/research_methodologies.json',
  practices: '/data/phd_best_practices.json',
  venues: '/data/publication_venues.json',
  ethics: '/data/research_ethics.json'
};

async function loadResourceTab(tabName) {
  const response = await fetch(resourceFiles[tabName]);
  return await response.json();
}
```

### Strategy 3: Use Index for Navigation

```javascript
async function loadIndex() {
  const response = await fetch('/data/index.json');
  const index = await response.json();
  
  // Use index.resources to know which files to load
  // Use index.navigation for phase-based guidance
}
```

---

## React Integration Example

```javascript
import React, { useState, useEffect } from 'react';

function ResourceCenter() {
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

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>{resources.meta.title}</h1>
      <ToolsSection tools={resources.tools.data} />
      <MethodologiesSection methodologies={resources.methodologies.data} />
      {/* ... more sections */}
    </div>
  );
}
```

---

## Vue Integration Example

```javascript
<template>
  <div class="resource-center">
    <h1>{{ meta.title }}</h1>
    <div v-if="loading" class="spinner">Loading...</div>
    <div v-else>
      <ToolsGrid :tools="tools" />
      <MethodologiesGrid :methodologies="methodologies" />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      resources: null,
      loading: true
    }
  },
  computed: {
    meta() { return this.resources?.meta || {}; },
    tools() { return this.resources?.tools?.data || []; },
    methodologies() { return this.resources?.methodologies?.data || []; }
  },
  async mounted() {
    const response = await fetch('/data/comprehensive_resources.json');
    this.resources = await response.json();
    this.loading = false;
  }
}
</script>
```

---

## Filtering & Search Examples

### Filter Tools by Category

```javascript
const tools = resources.tools.data;
const qualTools = tools.filter(t => t.category === 'Qualitative Analysis');
```

### Filter Practices by Phase

```javascript
const practices = flattenPractices(resources.bestPractices.phases);
const planningPractices = practices.filter(p => p.phase === 'Planning');
```

### Search All Text Fields

```javascript
function searchResources(query, resources) {
  const results = {};
  
  Object.keys(resources).forEach(category => {
    const categoryData = resources[category].data || [];
    results[category] = categoryData.filter(item =>
      JSON.stringify(item).toLowerCase().includes(query.toLowerCase())
    );
  });
  
  return results;
}
```

---

## Customization

### Adding Custom Resources

Edit comprehensive_resources.json and add to appropriate section:

```json
"tools": {
  "data": [
    {
      "id": "tool_custom_001",
      "name": "Your Tool Name",
      "category": "Your Category",
      "purpose": "What it does",
      "cost": "Free/Paid",
      // ... other fields
    }
  ]
}
```

### Creating Discipline-Specific Views

```javascript
const disciplineView = {
  quantitative: {
    methodologies: [resources.methodologies.data.find(m => m.id === 'M001')],
    tools: resources.tools.data.filter(t => t.category.includes('Quantitative')),
    frameworks: ['IMRAD Structure']
  }
};
```

---

## Performance Tips

1. **Gzip Compression**: Compress JSON files with gzip for 70-80% size reduction
2. **Caching**: Set appropriate cache headers on JSON files
3. **CDN**: Serve JSON files from CDN for faster delivery
4. **Lazy Loading**: Load tabs/sections on demand rather than all at once
5. **Indexing**: Use index.json for quick lookups instead of parsing full data

---

## Error Handling

```javascript
async function safeLoadResources() {
  try {
    const response = await fetch('/data/comprehensive_resources.json');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading resources:', error);
    return null;
  }
}
```

---

## CORS Configuration

If serving from different domain:

```javascript
// Server-side (Node.js/Express)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
```

---

## Questions?

Refer to example files:
- **website_loader_example.html** - Vanilla JavaScript implementation
- **react_component_example.jsx** - React implementation
- Sample integration guides in documentation

