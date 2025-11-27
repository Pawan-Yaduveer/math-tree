import { useCallback, useEffect, useState } from 'react';
import './App.css';
import AuthPanel from './components/AuthPanel';
import TreeView from './components/TreeView';
import OperationForm from './components/OperationForm';
import { useAuth } from './context/AuthContext';
import { calcApi } from './api';
import type { TreeNode } from './types';

const defaultSummary = { chains: 0, totalNodes: 0 };

function App() {
  const { token, user } = useAuth();
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [summary, setSummary] = useState(defaultSummary);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTree = useCallback(async () => {
    setRefreshing(true);
    try {
      const response = await calcApi.fetchTree();
      setTree(response.tree);
      setSummary(response.summary);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load tree');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  const requireRegistered = () => {
    if (!token || !user) {
      throw new Error('Please login first');
    }
    if (user.role === 'unregistered') {
      throw new Error('Upgrade your role to publish operations');
    }
  };

  const handleStart = async ({ value }: { value?: number }) => {
    requireRegistered();
    if (value === undefined) return;
    await calcApi.startChain(value, token!);
    await fetchTree();
  };

  const handleReply = async (parentId: string, payload: { operation?: string; inputNumber?: number }) => {
    requireRegistered();
    if (!payload.operation || payload.inputNumber === undefined) return;
    await calcApi.reply(parentId, payload.operation, payload.inputNumber, token!);
    await fetchTree();
  };

  return (
    <div className="app">
      <header className="hero">
        <div>
          <p>Math Tree</p>
          <h1>Discuss using numbers</h1>
          <p>Create chains of numeric operations and explore how other users extend them.</p>
        </div>
        <button className="ghost" onClick={fetchTree} disabled={refreshing}>
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </header>

      <main className="layout">
        <div className="layout__sidebar">
          <AuthPanel />

          <section className="panel panel--start">
            <header className="panel__header">
              <div>
                <h2>Start a discussion</h2>
                <p>Publish a starting number to begin a new chain.</p>
              </div>
            </header>
            {user && user.role !== 'unregistered' ? (
              <OperationForm
                mode="start"
                title="Starting number"
                onSubmit={handleStart}
              />
            ) : (
              <p className="muted">Upgrade to registered to start a chain.</p>
            )}
          </section>
        </div>

        <div className="layout__content">
          {error && <p className="banner banner--error">{error}</p>}
          {loading ? (
            <section className="panel panel--tree panel--loading">
              <p>Loading conversation tree…</p>
            </section>
          ) : (
            <TreeView tree={tree} summary={summary} onReply={handleReply} />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
