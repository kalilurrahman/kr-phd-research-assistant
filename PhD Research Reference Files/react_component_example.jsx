/**
 * PhD Research Assistant - React Component Example
 * This component loads and displays all research resources
 * Install dependencies: npm install axios lucide-react
 */

import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';

const ResearchResourceCenter = () => {
  const [activeTab, setActiveTab] = useState('tools');
  const [data, setData] = useState({
    tools: [],
    methodologies: [],
    practices: [],
    venues: [],
    ethics: []
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState([]);

  // Load all JSON data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [toolsRes, methodRes, practicesRes, venuesRes, ethicsRes] = await Promise.all([
          fetch('/data/research_tools.json'),
          fetch('/data/research_methodologies.json'),
          fetch('/data/phd_best_practices.json'),
          fetch('/data/publication_venues.json'),
          fetch('/data/research_ethics.json')
        ]);

        setData({
          tools: (await toolsRes.json()).tools || [],
          methodologies: (await methodRes.json()).methodologies || [],
          practices: (await practicesRes.json()).practices || [],
          venues: (await venuesRes.json()).venues || [],
          ethics: (await ethicsRes.json()).requirements || []
        });
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter and search logic
  const filterData = (items, searchField = 'name') => {
    return items.filter(item => {
      const matchesSearch = item[searchField]?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = activeFilters.length === 0 || 
        activeFilters.some(filter => 
          item.category === filter || item.type === filter || item.phase === filter
        );
      return matchesSearch && matchesFilter;
    });
  };

  // Components
  const ToolCard = ({ tool }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-shadow">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{tool.name}</h3>
      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded mb-3">
        {tool.category}
      </span>
      <p className="text-gray-600 text-sm mb-3">{tool.purpose}</p>
      <div className="flex gap-2 mb-3 flex-wrap">
        <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">{tool.type}</span>
        <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">{tool.cost}</span>
      </div>
      <a href={tool.website} target="_blank" rel="noopener noreferrer" 
        className="text-blue-600 hover:text-blue-800 text-sm font-medium">
        Visit Website →
      </a>
    </div>
  );

  const MethodologyCard = ({ methodology }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-shadow">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{methodology.type}</h3>
      <span className="inline-block bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded mb-3">
        {methodology.id}
      </span>
      <p className="text-gray-600 text-sm mb-3">{methodology.description}</p>
      <div className="mb-3">
        <strong className="text-sm text-gray-700">Data Type:</strong>
        <p className="text-sm text-gray-600">{methodology.dataType}</p>
      </div>
      <div>
        <strong className="text-sm text-gray-700">Design:</strong>
        <p className="text-sm text-gray-600">{methodology.designApproach}</p>
      </div>
    </div>
  );

  const PracticeListItem = ({ practice }) => (
    <li className="border-b border-gray-200 py-4 last:border-b-0">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800 mb-1">{practice.name}</h4>
          <p className="text-sm text-gray-600 mb-2">{practice.description}</p>
          <p className="text-xs text-gray-500">{practice.phase} • {practice.area}</p>
        </div>
        <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded whitespace-nowrap ml-4">
          {practice.timeline}
        </span>
      </div>
    </li>
  );

  const VenueCard = ({ venue }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-shadow">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{venue.type}</h3>
      <span className="inline-block bg-green-100 text-green-800 text-xs px-3 py-1 rounded mb-3">
        {venue.category}
      </span>
      <p className="text-gray-600 text-sm mb-3">{venue.bestFor}</p>
      <div className="space-y-2 text-sm">
        <p><strong>Timeline:</strong> {venue.timeline}</p>
        <p><strong>Review:</strong> {venue.peerReview}</p>
        <p><strong>Reach:</strong> {venue.reach}</p>
      </div>
    </div>
  );

  const ComplianceListItem = ({ requirement }) => (
    <li className="border-b border-gray-200 py-4 last:border-b-0">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800 mb-1">{requirement.name}</h4>
          <p className="text-sm text-gray-600 mb-2">{requirement.description}</p>
          <p className="text-xs text-gray-500">When needed: {requirement.whenNeeded}</p>
        </div>
        <span className="bg-red-100 text-red-800 text-xs px-3 py-1 rounded whitespace-nowrap ml-4">
          {requirement.category}
        </span>
      </div>
    </li>
  );

  const getFiltersForTab = () => {
    switch(activeTab) {
      case 'tools':
        return [...new Set(data.tools.map(t => t.category))];
      case 'practices':
        return [...new Set(data.practices.map(p => p.phase))];
      case 'ethics':
        return [...new Set(data.ethics.map(e => e.category))];
      default:
        return [];
    }
  };

  const getFilteredData = () => {
    switch(activeTab) {
      case 'tools':
        return filterData(data.tools);
      case 'methodologies':
        return filterData(data.methodologies, 'type');
      case 'practices':
        return filterData(data.practices, 'name');
      case 'venues':
        return filterData(data.venues, 'type');
      case 'ethics':
        return filterData(data.ethics, 'name');
      default:
        return [];
    }
  };

  const filters = getFiltersForTab();
  const filteredData = getFilteredData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🎓 PhD Research Assistant</h1>
          <p className="text-gray-600 text-lg">Complete Resource Library & Implementation Guide</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-t-lg shadow-lg">
          <div className="flex border-b border-gray-200">
            {['tools', 'methodologies', 'practices', 'venues', 'ethics'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Search and Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            {filters.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {filters.map(filter => (
                  <button
                    key={filter}
                    onClick={() => {
                      setActiveFilters(prev =>
                        prev.includes(filter)
                          ? prev.filter(f => f !== filter)
                          : [...prev, filter]
                      );
                    }}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      activeFilters.includes(filter)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading resources...</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-4">
                  Found {filteredData.length} results
                </p>

                {activeTab === 'tools' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredData.map(tool => (
                      <ToolCard key={tool.id} tool={tool} />
                    ))}
                  </div>
                )}

                {activeTab === 'methodologies' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredData.map(m => (
                      <MethodologyCard key={m.id} methodology={m} />
                    ))}
                  </div>
                )}

                {activeTab === 'practices' && (
                  <ul className="divide-y divide-gray-200">
                    {filteredData.map(practice => (
                      <PracticeListItem key={practice.id} practice={practice} />
                    ))}
                  </ul>
                )}

                {activeTab === 'venues' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredData.map(venue => (
                      <VenueCard key={venue.id} venue={venue} />
                    ))}
                  </div>
                )}

                {activeTab === 'ethics' && (
                  <ul className="divide-y divide-gray-200">
                    {filteredData.map(requirement => (
                      <ComplianceListItem key={requirement.id} requirement={requirement} />
                    ))}
                  </ul>
                )}

                {filteredData.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No results found. Try adjusting your search or filters.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResearchResourceCenter;
