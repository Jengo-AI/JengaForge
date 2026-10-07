import React, { useState, useEffect } from 'react';
import { PageWrapper } from '../components/PageWrapper';
import { 
  Terminal, Key, Check, Play, Copy, RefreshCw, 
  ShieldCheck, Code2 
} from 'lucide-react';
import { toolService } from '../services/toolService';
import { PlatformStats } from '../types';

type EndpointId = 'tools' | 'tool' | 'stacks' | 'stats' | 'chat' | 'health';

export const ApiDocs: React.FC = () => {
  const [activeEndpoint, setActiveEndpoint] = useState<EndpointId>('tools');
  const [activeLang, setActiveLang] = useState<'curl' | 'ts' | 'python'>('curl');
  const [copied, setCopied] = useState(false);

  // Live query state for tools endpoint
  const [queryQ, setQueryQ] = useState('');
  const [queryCategory, setQueryCategory] = useState('');
  const [querySort, setQuerySort] = useState('relevance');
  const [queryPage, setQueryPage] = useState('1');

  // Live query state for single tool endpoint
  const [singleToolId, setSingleToolId] = useState('cursor-agent');

  // Execution states
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<{
    status: number;
    latencyMs: number;
    data: any;
  } | null>(null);

  // Platform telemetry
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [sysInfo, setSysInfo] = useState<{ version: string; status: string; uptime: number; totalTools: number } | null>(null);
  const [healthStatus, setHealthStatus] = useState<{ ok: boolean; latencyMs: number } | null>(null);

  useEffect(() => {
    // Load live telemetry
    toolService.checkServerHealth().then(h => setHealthStatus(h));
    toolService.fetchPlatformStats().then(s => setStats(s));

    fetch('/api/sysinfo')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'operational') setSysInfo(data);
      })
      .catch(() => {});
  }, []);

  const handleExecute = async () => {
    setIsExecuting(true);
    const start = performance.now();

    try {
      let url = '/api/v2/tools';
      let options: RequestInit = { method: 'GET' };

      if (activeEndpoint === 'tools') {
        const params = new URLSearchParams();
        if (queryQ) params.set('q', queryQ);
        if (queryCategory && queryCategory !== 'All') params.set('category', queryCategory);
        if (querySort) params.set('sort', querySort);
        if (queryPage) params.set('page', queryPage);
        url = `/api/v2/tools?${params.toString()}`;
      } else if (activeEndpoint === 'tool') {
        url = `/api/v2/tools/${encodeURIComponent(singleToolId.trim() || 'cursor-agent')}`;
      } else if (activeEndpoint === 'stacks') {
        url = '/api/v2/stacks/featured';
      } else if (activeEndpoint === 'stats') {
        url = '/api/v2/stats';
      } else if (activeEndpoint === 'health') {
        url = '/api/health';
      } else if (activeEndpoint === 'chat') {
        url = '/api/chat';
        options = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: 'What are the top 2026 AI coding agents?',
            history: []
          })
        };
      }

      const res = await fetch(url, options);
      const latencyMs = Math.round(performance.now() - start);
      const data = await res.json().catch(() => ({ raw: 'Non-JSON response' }));

      setExecutionResult({
        status: res.status,
        latencyMs,
        data
      });
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - start);
      setExecutionResult({
        status: 500,
        latencyMs,
        data: { error: err.message || 'Execution error' }
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const getCodeSnippet = () => {
    const origin = window.location.origin;
    if (activeEndpoint === 'tools') {
      const query = `/api/v2/tools?category=${queryCategory || 'Frontier LLM'}&limit=5`;
      if (activeLang === 'curl') {
        return `curl -X GET "${origin}${query}" \\\n  -H "Accept: application/json"`;
      } else if (activeLang === 'ts') {
        return `const res = await fetch("${origin}${query}");\nconst data = await res.json();\nconsole.log(data.data);`;
      } else {
        return `import requests\n\nres = requests.get("${origin}${query}")\nprint(res.json())`;
      }
    }

    if (activeEndpoint === 'tool') {
      const toolId = singleToolId.trim() || 'cursor-agent';
      if (activeLang === 'curl') {
        return `curl -X GET "${origin}/api/v2/tools/${toolId}" \\\n  -H "Accept: application/json"`;
      } else if (activeLang === 'ts') {
        return `const res = await fetch("${origin}/api/v2/tools/${toolId}");\nconst data = await res.json();\nconsole.log(data);`;
      } else {
        return `import requests\n\nres = requests.get("${origin}/api/v2/tools/${toolId}")\nprint(res.json())`;
      }
    }

    if (activeEndpoint === 'stacks') {
      if (activeLang === 'curl') {
        return `curl -X GET "${origin}/api/v2/stacks/featured" \\\n  -H "Accept: application/json"`;
      } else if (activeLang === 'ts') {
        return `const res = await fetch("${origin}/api/v2/stacks/featured");\nconst data = await res.json();\nconsole.log(data.data);`;
      } else {
        return `import requests\n\nres = requests.get("${origin}/api/v2/stacks/featured")\nprint(res.json())`;
      }
    }

    if (activeEndpoint === 'stats') {
      if (activeLang === 'curl') {
        return `curl -X GET "${origin}/api/v2/stats"`;
      } else if (activeLang === 'ts') {
        return `const stats = await (await fetch("${origin}/api/v2/stats")).json();\nconsole.log(stats.data);`;
      } else {
        return `import requests\n\nstats = requests.get("${origin}/api/v2/stats").json()\nprint(stats)`;
      }
    }

    if (activeEndpoint === 'chat') {
      if (activeLang === 'curl') {
        return `curl -X POST "${origin}/api/chat" \\\n  -H "Content-Type: application/json" \\\n  -d '{"message": "Summarize DeepSeek V4", "history": []}'`;
      } else if (activeLang === 'ts') {
        return `const res = await fetch("${origin}/api/chat", {\n  method: "POST",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify({ message: "Summarize DeepSeek V4" })\n});`;
      } else {
        return `import requests\n\nres = requests.post("${origin}/api/chat", json={"message": "Summarize DeepSeek V4"})\nprint(res.json())`;
      }
    }

    return `curl -X GET "${origin}/api/health"`;
  };

  const copyToClipboard = () => {
    navigator.clipboard?.writeText(getCodeSnippet());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-12 max-w-6xl space-y-12">
        {/* Header */}
        <div className="border-b-4 border-dark-700 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Terminal className="w-10 h-10 text-jenga-500" />
              <h1 className="text-4xl md:text-6xl font-black text-surface-text uppercase tracking-widest">
                Developer API
              </h1>
            </div>
            <p className="text-surface-muted font-mono uppercase tracking-widest text-sm">
              Full-Stack REST Architecture • Live Node.js/Express Backend Proxy
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 bg-dark-800 border-2 border-green-500 text-green-400 font-mono text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
              {healthStatus?.ok ? `ONLINE (${healthStatus.latencyMs}ms)` : 'ACTIVE'}
            </span>
            <span className="px-3 py-1.5 bg-dark-800 border-2 border-dark-600 text-jenga-500 font-mono text-xs font-black uppercase tracking-widest">
              v2.4.0-PROD
            </span>
          </div>
        </div>

        {/* Live Ecosystem Telemetry Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
          <div className="p-4 bg-dark-900 border-2 border-dark-700">
            <span className="text-[10px] text-surface-muted uppercase tracking-widest block mb-1">
              Active Tools in DB
            </span>
            <span className="text-2xl md:text-3xl font-black text-jenga-500">
              {stats?.totalTools || sysInfo?.totalTools || '12'}
            </span>
          </div>

          <div className="p-4 bg-dark-900 border-2 border-dark-700">
            <span className="text-[10px] text-surface-muted uppercase tracking-widest block mb-1">
              Average Rating
            </span>
            <span className="text-2xl md:text-3xl font-black text-surface-text">
              {stats?.avgRating ? stats.avgRating.toFixed(2) : '4.88'} ★
            </span>
          </div>

          <div className="p-4 bg-dark-900 border-2 border-dark-700">
            <span className="text-[10px] text-surface-muted uppercase tracking-widest block mb-1">
              Community Reviews
            </span>
            <span className="text-2xl md:text-3xl font-black text-surface-text">
              14,200+
            </span>
          </div>

          <div className="p-4 bg-dark-900 border-2 border-dark-700">
            <span className="text-[10px] text-surface-muted uppercase tracking-widest block mb-1">
              Security Standard
            </span>
            <span className="text-sm md:text-base font-black text-green-400 uppercase tracking-widest flex items-center gap-1 mt-1">
              <ShieldCheck className="w-4 h-4" /> Rate Limited
            </span>
          </div>
        </div>

        {/* Live Interactive API Console */}
        <div className="bg-dark-900 border-4 border-dark-700 overflow-hidden shadow-[8px_8px_0px_0px_rgba(255,140,0,1)]">
          {/* Console Header */}
          <div className="bg-dark-950 border-b-2 border-dark-700 p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Code2 className="w-5 h-5 text-jenga-500" />
              <span className="font-mono text-sm font-black uppercase tracking-widest text-surface-text">
                Live Interactive API Console
              </span>
            </div>

            <div className="flex flex-wrap gap-1 font-mono text-xs">
              {(['tools', 'tool', 'stacks', 'stats', 'chat', 'health'] as EndpointId[]).map(ep => (
                <button
                  key={ep}
                  onClick={() => {
                    setActiveEndpoint(ep);
                    setExecutionResult(null);
                  }}
                  className={`px-3 py-1 font-black uppercase tracking-widest border transition-all ${
                    activeEndpoint === ep
                      ? 'bg-jenga-500 text-dark-950 border-jenga-500'
                      : 'bg-dark-800 text-surface-muted border-dark-600 hover:text-surface-text'
                  }`}
                >
                  {ep}
                </button>
              ))}
            </div>
          </div>

          {/* Endpoint Details and Param Controls */}
          <div className="p-6 border-b border-dark-700 bg-dark-850 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 font-mono">
                <span className={`px-2.5 py-1 text-xs font-black uppercase tracking-widest ${
                  ['chat'].includes(activeEndpoint) 
                    ? 'bg-amber-500 text-dark-950' 
                    : 'bg-jenga-500 text-dark-950'
                }`}>
                  {['chat'].includes(activeEndpoint) ? 'POST' : 'GET'}
                </span>
                <span className="text-surface-text font-bold text-sm">
                  {activeEndpoint === 'tools' && '/api/v2/tools'}
                  {activeEndpoint === 'tool' && `/api/v2/tools/:id`}
                  {activeEndpoint === 'stacks' && '/api/v2/stacks/featured'}
                  {activeEndpoint === 'stats' && '/api/v2/stats'}
                  {activeEndpoint === 'health' && '/api/health'}
                  {activeEndpoint === 'chat' && '/api/chat'}
                </span>
              </div>

              <button
                onClick={handleExecute}
                disabled={isExecuting}
                className="px-6 py-2 bg-jenga-500 hover:bg-jenga-400 text-dark-950 font-mono text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {isExecuting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Executing...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-dark-950" />
                    <span>Send Request</span>
                  </>
                )}
              </button>
            </div>

            {/* Configurable Query Params for Tools */}
            {activeEndpoint === 'tools' && (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 font-mono text-xs">
                <div>
                  <label className="text-[10px] text-surface-muted uppercase tracking-widest block mb-1">
                    Search (q)
                  </label>
                  <input
                    type="text"
                    value={queryQ}
                    onChange={e => setQueryQ(e.target.value)}
                    placeholder="e.g. Gemini, DeepSeek"
                    className="w-full bg-dark-800 border border-dark-600 px-2 py-1.5 text-surface-text uppercase text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-surface-muted uppercase tracking-widest block mb-1">
                    Category
                  </label>
                  <select
                    value={queryCategory}
                    onChange={e => setQueryCategory(e.target.value)}
                    className="w-full bg-dark-800 border border-dark-600 px-2 py-1.5 text-surface-text uppercase text-xs"
                  >
                    <option value="">All Categories</option>
                    <option value="Frontier LLM">Frontier LLM</option>
                    <option value="Agent">Agent</option>
                    <option value="Code Assistant">Code Assistant</option>
                    <option value="Video Generation">Video Generation</option>
                    <option value="Sovereign AI">Sovereign AI</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-surface-muted uppercase tracking-widest block mb-1">
                    Sort
                  </label>
                  <select
                    value={querySort}
                    onChange={e => setQuerySort(e.target.value)}
                    className="w-full bg-dark-800 border border-dark-600 px-2 py-1.5 text-surface-text uppercase text-xs"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="rating">Top Rated</option>
                    <option value="reviews">Most Reviews</option>
                    <option value="name">A-Z</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-surface-muted uppercase tracking-widest block mb-1">
                    Page
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={queryPage}
                    onChange={e => setQueryPage(e.target.value)}
                    className="w-full bg-dark-800 border border-dark-600 px-2 py-1.5 text-surface-text text-xs"
                  />
                </div>
              </div>
            )}

            {/* Param for Single Tool */}
            {activeEndpoint === 'tool' && (
              <div className="pt-2 font-mono text-xs">
                <label className="text-[10px] text-surface-muted uppercase tracking-widest block mb-1">
                  Canonical Tool ID
                </label>
                <input
                  type="text"
                  value={singleToolId}
                  onChange={e => setSingleToolId(e.target.value)}
                  placeholder="e.g. cursor-agent, claude-5-5-sonnet"
                  className="w-full max-w-sm bg-dark-800 border border-dark-600 px-2 py-1.5 text-surface-text text-xs"
                />
              </div>
            )}
          </div>

          {/* Code Snippet and Live Response Split */}
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-dark-700">
            {/* Code Generator */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-widest text-surface-muted">
                  Client Integration Code
                </span>
                <div className="flex items-center gap-2">
                  {(['curl', 'ts', 'python'] as const).map(lang => (
                    <button
                      key={lang}
                      onClick={() => setActiveLang(lang)}
                      className={`px-2 py-0.5 text-[10px] font-mono uppercase font-bold border ${
                        activeLang === lang
                          ? 'bg-dark-700 text-jenga-500 border-jenga-500'
                          : 'bg-dark-800 text-surface-muted border-dark-600'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                  <button
                    onClick={copyToClipboard}
                    className="p-1 bg-dark-800 border border-dark-600 hover:border-jenga-500 text-surface-muted hover:text-jenga-500"
                    title="Copy snippet"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="bg-dark-950 p-4 font-mono text-xs text-jenga-400 border-l-2 border-jenga-500 overflow-x-auto min-h-[160px]">
                <pre><code>{getCodeSnippet()}</code></pre>
              </div>
            </div>

            {/* Live Response Panel */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="uppercase tracking-widest text-surface-muted">
                  Live Response
                </span>
                {executionResult && (
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 font-bold ${
                      executionResult.status >= 200 && executionResult.status < 300
                        ? 'bg-green-950 text-green-400 border border-green-700'
                        : 'bg-red-950 text-red-400 border border-red-700'
                    }`}>
                      HTTP {executionResult.status}
                    </span>
                    <span className="text-surface-muted">
                      {executionResult.latencyMs} ms
                    </span>
                  </div>
                )}
              </div>

              <div className="bg-dark-950 p-4 font-mono text-xs text-surface-text border-l-2 border-dark-600 overflow-x-auto min-h-[160px] max-h-[340px] overflow-y-auto">
                {executionResult ? (
                  <pre><code>{JSON.stringify(executionResult.data, null, 2)}</code></pre>
                ) : (
                  <p className="text-surface-muted italic">
                    Click "Send Request" above to execute this endpoint against the live Express backend.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Security & BYOK Architecture */}
        <section className="border-t-2 border-dark-700 pt-8">
          <h2 className="text-2xl font-black text-surface-text uppercase tracking-widest mb-4 flex items-center gap-3">
            <Key className="w-6 h-6 text-jenga-500" />
            Security & BYOK (Bring Your Own Key) Standard
          </h2>
          <div className="bg-dark-900 border-2 border-dark-700 p-6 space-y-3 font-mono text-xs text-surface-muted">
            <p>
              In accordance with JengaForge enterprise engineering directives:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-surface-text">
              <li>
                <strong>Server-Side Proxy:</strong> Public assistant requests route through <code className="text-jenga-500">/api/chat</code> powered by the server's own securely provisioned credentials.
              </li>
              <li>
                <strong>Zero-Trust BYOK Isolation:</strong> When Bring-Your-Own-Key is enabled, client keys execute directly in the browser via the Google Gen AI SDK. User keys are strictly kept in local storage and never transmitted to backend endpoints or stored in HTTP headers.
              </li>
              <li>
                <strong>Rate Limiting & Origin Controls:</strong> Server endpoints enforce rate limits and strict CORS origin validation to prevent automated scraping and abuse.
              </li>
            </ul>
          </div>
        </section>
      </div>
    </PageWrapper>
  );
};
