import type { TreeNode } from '../types';
import NodeCard from './NodeCard';

interface TreeViewProps {
  tree: TreeNode[];
  summary: { totalNodes: number; chains: number };
  onReply: (parentId: string, payload: { operation?: string; inputNumber?: number }) => Promise<void>;
}

const TreeView = ({ tree, summary, onReply }: TreeViewProps) => {
  return (
    <section className="panel panel--tree">
      <header className="panel__header panel__header--center">
        <div>
          <p className="panel__eyebrow">Community chains</p>
          <h2>See how numbers evolve</h2>
          <p className="panel__subtitle">
            {summary.chains} active chains · {summary.totalNodes} operations
          </p>
        </div>
      </header>

      {tree.length === 0 ? (
        <p className="tree__empty">No discussions yet. Be the first to start one!</p>
      ) : (
        <ul className="tree">
          {tree.map((node) => (
            <NodeCard key={node.id} node={node} onReply={onReply} />
          ))}
        </ul>
      )}
    </section>
  );
};

export default TreeView;
