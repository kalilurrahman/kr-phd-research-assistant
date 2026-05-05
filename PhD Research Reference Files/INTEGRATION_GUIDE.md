# 🚀 PhD Research Assistant - Integration Guide

## Quick Start

### 1. Download & Extract
Download `PhD_Research_Assistant_Complete_Package.zip` and extract to your project.

### 2. Load JSON in Your Web App

#### Option A: React/Next.js
```javascript
import toolkitData from './json/web_toolkit.json';

function MyComponent() {
  const categories = toolkitData.categories;

  return (
    <div>
      {categories.map(cat => (
        <div key={cat.id}>
          <h2>{cat.icon} {cat.title}</h2>
          <p>{cat.description}</p>
        </div>
      ))}
    </div>
  );
}
```

#### Option B: Vue.js
```vue
<script setup>
import toolkitData from './json/web_toolkit.json';
const categories = toolkitData.categories;
</script>

<template>
  <div v-for="cat in categories" :key="cat.id">
    <h2>{{ cat.icon }} {{ cat.title }}</h2>
    <p>{{ cat.description }}</p>
  </div>
</template>
```

#### Option C: Vanilla JavaScript
```javascript
fetch('./json/web_toolkit.json')
  .then(response => response.json())
  .then(data => {
    const categories = data.categories;
    renderCategories(categories);
  });
```

#### Option D: Lovable (React-based)
```typescript
import toolkitData from './web_toolkit.json';

export default function ResearchTools() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">
        {toolkitData.app_info.name}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {toolkitData.categories.map(category => (
          <div 
            key={category.id}
            className="border rounded-lg p-4 hover:shadow-lg transition"
            style={{ borderColor: category.color }}
          >
            <div className="text-4xl mb-2">{category.icon}</div>
            <h3 className="text-xl font-semibold">{category.title}</h3>
            <p className="text-gray-600">{category.description}</p>
            <span className="text-sm text-gray-500">
              {category.tools.length} tools
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## JSON Structure Reference

### Main Objects

```javascript
{
  "app_info": {
    "name": "PhD Research Assistant Toolkit",
    "version": "1.0.0",
    "total_resources": 154
  },
  "categories": [ /* 10 categories with tools */ ],
  "research_workflow": [ /* 6 workflow stages */ ],
  "quick_recommendations": { /* Budget/discipline/stage recommendations */ },
  "tool_comparisons": [ /* Head-to-head comparisons */ ]
}
```

### Category Object Structure

```javascript
{
  "id": "writing-productivity",
  "title": "Research Writing & Productivity",
  "icon": "✍️",
  "description": "Tools for academic writing...",
  "color": "#4A90E2",
  "tools": [
    {
      "name": "Writefull",
      "type": "Freemium",
      "description": "AI-powered proofreading...",
      "url": "https://writefull.com",
      "tags": ["AI", "Grammar", "Academic Writing"],
      "best_for": "Language corrections, academic style"
    }
  ]
}
```

### Workflow Stage Structure

```javascript
{
  "stage": 1,
  "name": "Research Planning",
  "icon": "📋",
  "activities": ["Literature review", "Research questions"],
  "tools": ["Notion", "Asana"],
  "deliverables": ["Research proposal", "Timeline"],
  "duration": "2-4 weeks"
}
```

---

## Common Use Cases

### 1. Display Category Cards

```jsx
const CategoryGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {toolkitData.categories.map(category => (
        <CategoryCard 
          key={category.id}
          {...category}
        />
      ))}
    </div>
  );
};
```

### 2. Search & Filter Tools

```javascript
function searchTools(searchTerm, categoryId = null) {
  let tools = [];

  if (categoryId) {
    const category = toolkitData.categories.find(c => c.id === categoryId);
    tools = category ? category.tools : [];
  } else {
    // Search across all categories
    tools = toolkitData.categories.flatMap(c => c.tools);
  }

  return tools.filter(tool => 
    tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.tags.some(tag => tag.toLowerCase().includes(searchTerm))
  );
}
```

### 3. Filter by Type (Free/Paid)

```javascript
function getToolsByType(type) {
  const allTools = toolkitData.categories.flatMap(c => c.tools);
  return allTools.filter(tool => tool.type === type);
}

// Usage
const freeTools = getToolsByType('Free');
const paidTools = getToolsByType('Paid');
const freemiumTools = getToolsByType('Freemium');
```

### 4. Get Tools by Research Stage

```javascript
function getToolsForStage(stageName) {
  const stage = toolkitData.research_workflow.find(
    s => s.name === stageName
  );

  return stage ? stage.tools : [];
}

// Usage
const planningTools = getToolsForStage('Research Planning');
const analysisTools = getToolsForStage('Data Analysis');
```

### 5. Get Recommendations

```javascript
// By budget
const freeTools = toolkitData.quick_recommendations.by_budget.free;

// By discipline
const stemTools = toolkitData.quick_recommendations.by_discipline.stem;

// By research stage
const writingTools = toolkitData.quick_recommendations.by_research_stage.writing;
```

---

## Styling Suggestions

### Category Colors
Each category has a predefined color that you can use:

```css
.category-writing { border-color: #4A90E2; }
.category-reference { border-color: #E67E22; }
.category-systematic { border-color: #9B59B6; }
.category-statistical { border-color: #27AE60; }
.category-qualitative { border-color: #E74C3C; }
```

### Tool Type Badges

```css
.badge-free { background: #27AE60; color: white; }
.badge-freemium { background: #3498DB; color: white; }
.badge-paid { background: #E67E22; color: white; }
.badge-subscription { background: #9B59B6; color: white; }
```

---

## Advanced Features

### 1. Add User Ratings (Extend JSON)

```javascript
// In your app, extend tool data with user ratings
const toolWithRating = {
  ...tool,
  userRating: 4.5,
  reviewCount: 123
};
```

### 2. Track User Favorites

```javascript
const [favorites, setFavorites] = useState([]);

const toggleFavorite = (toolName) => {
  setFavorites(prev => 
    prev.includes(toolName)
      ? prev.filter(t => t !== toolName)
      : [...prev, toolName]
  );
};
```

### 3. Filter by Multiple Criteria

```javascript
function filterTools(criteria) {
  let tools = toolkitData.categories.flatMap(c => c.tools);

  if (criteria.type) {
    tools = tools.filter(t => t.type === criteria.type);
  }

  if (criteria.tags && criteria.tags.length > 0) {
    tools = tools.filter(t => 
      criteria.tags.some(tag => t.tags.includes(tag))
    );
  }

  if (criteria.searchTerm) {
    const search = criteria.searchTerm.toLowerCase();
    tools = tools.filter(t => 
      t.name.toLowerCase().includes(search) ||
      t.description.toLowerCase().includes(search)
    );
  }

  return tools;
}

// Usage
const results = filterTools({
  type: 'Free',
  tags: ['AI', 'Academic Writing'],
  searchTerm: 'grammar'
});
```

---

## SEO & Metadata

Add rich metadata for better search visibility:

```html
<meta name="description" content="Comprehensive toolkit of 154+ research tools for PhD students">
<meta name="keywords" content="PhD tools, research software, academic writing, data analysis">
<meta property="og:title" content="PhD Research Assistant Toolkit">
<meta property="og:description" content="154+ curated tools for PhD research">
```

---

## Performance Tips

### 1. Lazy Load Categories
```javascript
const [visibleCategories, setVisibleCategories] = useState(3);

const loadMore = () => {
  setVisibleCategories(prev => prev + 3);
};
```

### 2. Memoize Search Results
```javascript
import { useMemo } from 'react';

const filteredTools = useMemo(() => {
  return searchTools(searchTerm, selectedCategory);
}, [searchTerm, selectedCategory]);
```

### 3. Virtual Scrolling for Long Lists
Consider using `react-window` or `react-virtual` for rendering large tool lists.

---

## Deployment Checklist

- [ ] Upload `web_toolkit.json` to your project
- [ ] Import JSON in your components
- [ ] Add search functionality
- [ ] Implement filtering by category/type
- [ ] Add responsive design for mobile
- [ ] Test on multiple browsers
- [ ] Add analytics tracking
- [ ] Optimize images (icons can be emoji or SVG)
- [ ] Add error boundaries
- [ ] Test loading states

---

## Support & Updates

- **GitHub**: github.com/kalilurrahman/kr-phd-research-assistant
- **App**: kr-phd-research-assistant.lovable.app
- **JSON Version**: 1.0.0 (May 2026)

---

## Sample Queries

### Get all free tools
```javascript
const allTools = toolkitData.categories.flatMap(c => c.tools);
const freeTools = allTools.filter(t => t.type === 'Free');
```

### Get tools by tag
```javascript
const aiTools = allTools.filter(t => t.tags.includes('AI'));
```

### Get category by ID
```javascript
const category = toolkitData.categories.find(c => c.id === 'writing-productivity');
```

### Count tools by type
```javascript
const typeCounts = allTools.reduce((acc, tool) => {
  acc[tool.type] = (acc[tool.type] || 0) + 1;
  return acc;
}, {});
// Result: { Free: 20, Freemium: 30, Paid: 15, Subscription: 25 }
```

---

## License & Attribution

© 2026 PhD Research Assistant  
Free to use for educational and research purposes.  
Please attribute when sharing.
