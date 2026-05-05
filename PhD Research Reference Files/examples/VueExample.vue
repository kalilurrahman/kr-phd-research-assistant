<!-- Sample Vue.js Component for PhD Research Toolkit -->
<!-- This demonstrates how to load and render the web_toolkit.json in Vue -->

<template>
  <div class="research-toolkit">
    <header>
      <h1>{{ appInfo.name }}</h1>
      <p>{{ appInfo.description }}</p>
      <p>Total Resources: {{ appInfo.total_resources }}</p>
    </header>

    <input 
      v-model="searchTerm"
      type="search" 
      placeholder="Search tools..."
      class="search-input"
    />

    <!-- Category Grid -->
    <div class="category-grid">
      <div 
        v-for="category in categories"
        :key="category.id"
        class="category-card"
        :style="{ borderColor: category.color }"
        @click="selectedCategory = category"
      >
        <span class="icon">{{ category.icon }}</span>
        <h3>{{ category.title }}</h3>
        <p>{{ category.description }}</p>
        <span class="tool-count">{{ category.tools.length }} tools</span>
      </div>
    </div>

    <!-- Selected Category Tools -->
    <div v-if="selectedCategory" class="tools-section">
      <h2>{{ selectedCategory.icon }} {{ selectedCategory.title }}</h2>
      <div class="tools-grid">
        <div 
          v-for="tool in filteredTools"
          :key="tool.name"
          class="tool-card"
        >
          <h3>{{ tool.name }}</h3>
          <span class="type-badge">{{ tool.type }}</span>
          <span v-if="tool.price" class="price">{{ tool.price }}</span>
          <p>{{ tool.description }}</p>
          <div class="tags">
            <span v-for="tag in tool.tags" :key="tag" class="tag">
              {{ tag }}
            </span>
          </div>
          <p class="best-for">
            <strong>Best for:</strong> {{ tool.best_for }}
          </p>
          <a :href="tool.url" target="_blank" rel="noopener noreferrer">
            Visit Website →
          </a>
        </div>
      </div>
    </div>

    <!-- Research Workflow -->
    <div class="workflow-section">
      <h2>Research Workflow</h2>
      <div class="workflow-stages">
        <div 
          v-for="stage in researchWorkflow"
          :key="stage.stage"
          class="workflow-stage"
        >
          <div class="stage-number">{{ stage.stage }}</div>
          <span class="stage-icon">{{ stage.icon }}</span>
          <h3>{{ stage.name }}</h3>
          <p class="duration">Duration: {{ stage.duration }}</p>
          <ul>
            <li v-for="activity in stage.activities" :key="activity">
              {{ activity }}
            </li>
          </ul>
          <div class="recommended-tools">
            <strong>Tools:</strong> {{ stage.tools.join(', ') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import toolkitData from './web_toolkit.json';

export default {
  name: 'ResearchToolkit',
  data() {
    return {
      appInfo: toolkitData.app_info,
      categories: toolkitData.categories,
      researchWorkflow: toolkitData.research_workflow,
      quickRecs: toolkitData.quick_recommendations,
      selectedCategory: null,
      searchTerm: ''
    };
  },
  computed: {
    filteredTools() {
      if (!this.selectedCategory) return [];
      if (!this.searchTerm) return this.selectedCategory.tools;

      const search = this.searchTerm.toLowerCase();
      return this.selectedCategory.tools.filter(tool => 
        tool.name.toLowerCase().includes(search) ||
        tool.description.toLowerCase().includes(search) ||
        tool.tags.some(tag => tag.toLowerCase().includes(search))
      );
    }
  }
};
</script>

<style scoped>
.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.category-card {
  padding: 1.5rem;
  border: 2px solid;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s;
}

.category-card:hover {
  transform: translateY(-4px);
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.tool-card {
  padding: 1.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1rem 0;
}

.tag {
  padding: 0.25rem 0.75rem;
  background: #e9ecef;
  border-radius: 16px;
  font-size: 0.875rem;
}

.workflow-stages {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.workflow-stage {
  padding: 1.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  position: relative;
}

.stage-number {
  position: absolute;
  top: -12px;
  left: 12px;
  background: #4A90E2;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}
</style>
