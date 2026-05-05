// Sample React Component for PhD Research Toolkit
// This demonstrates how easy it is to load and render the web_toolkit.json

import React, { useState, useEffect } from 'react';
import toolkitData from './web_toolkit.json';

function ResearchToolkit() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Categories are ready to use from JSON
  const categories = toolkitData.categories;

  // Filter tools based on search
  const filterTools = (tools) => {
    if (!searchTerm) return tools;
    return tools.filter(tool => 
      tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  return (
    <div className="research-toolkit">
      <header>
        <h1>{toolkitData.app_info.name}</h1>
        <p>{toolkitData.app_info.description}</p>
        <p>Total Resources: {toolkitData.app_info.total_resources}</p>
      </header>

      <input 
        type="search" 
        placeholder="Search tools..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Category Grid */}
      <div className="category-grid">
        {categories.map(category => (
          <div 
            key={category.id}
            className="category-card"
            style={{ borderColor: category.color }}
            onClick={() => setSelectedCategory(category)}
          >
            <span className="icon">{category.icon}</span>
            <h3>{category.title}</h3>
            <p>{category.description}</p>
            <span className="tool-count">{category.tools.length} tools</span>
          </div>
        ))}
      </div>

      {/* Selected Category Tools */}
      {selectedCategory && (
        <div className="tools-section">
          <h2>{selectedCategory.icon} {selectedCategory.title}</h2>
          <div className="tools-grid">
            {filterTools(selectedCategory.tools).map(tool => (
              <div key={tool.name} className="tool-card">
                <h3>{tool.name}</h3>
                <span className="type-badge">{tool.type}</span>
                {tool.price && <span className="price">{tool.price}</span>}
                <p>{tool.description}</p>
                <div className="tags">
                  {tool.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
                <p className="best-for"><strong>Best for:</strong> {tool.best_for}</p>
                <a href={tool.url} target="_blank" rel="noopener noreferrer">
                  Visit Website →
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Research Workflow */}
      <div className="workflow-section">
        <h2>Research Workflow</h2>
        <div className="workflow-stages">
          {toolkitData.research_workflow.map(stage => (
            <div key={stage.stage} className="workflow-stage">
              <div className="stage-number">{stage.stage}</div>
              <span className="stage-icon">{stage.icon}</span>
              <h3>{stage.name}</h3>
              <p className="duration">Duration: {stage.duration}</p>
              <ul>
                {stage.activities.map(activity => (
                  <li key={activity}>{activity}</li>
                ))}
              </ul>
              <div className="recommended-tools">
                <strong>Tools:</strong> {stage.tools.join(', ')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Recommendations */}
      <div className="recommendations-section">
        <h2>Quick Recommendations</h2>

        <div className="rec-category">
          <h3>By Budget</h3>
          <div className="rec-tags">
            <div>
              <strong>Free:</strong> 
              {toolkitData.quick_recommendations.by_budget.free.join(', ')}
            </div>
            <div>
              <strong>Budget-Friendly:</strong> 
              {toolkitData.quick_recommendations.by_budget.budget_friendly.join(', ')}
            </div>
          </div>
        </div>

        <div className="rec-category">
          <h3>By Discipline</h3>
          {Object.entries(toolkitData.quick_recommendations.by_discipline).map(([discipline, tools]) => (
            <div key={discipline}>
              <strong>{discipline.replace('_', ' ')}:</strong> {tools.join(', ')}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ResearchToolkit;
