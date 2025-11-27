import { useState, type CSSProperties } from 'react';
import type { TreeNode } from '../types';
import OperationForm from './OperationForm';
import { useAuth } from '../context/AuthContext';

type NodeCardProps = {
  node: TreeNode;
  onReply: (parentId: string, payload: { operation?: string; inputNumber?: number }) => Promise<void>;
  depth?: number;
};

const formatDate = (iso: string) => new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
}).format(new Date(iso));

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || '?';

const NodeCard = ({ node, onReply, depth = 0 }: NodeCardProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const canInteract = user && user.role !== 'unregistered';
  const authorName = node.user?.username ?? 'Anonymous';
  const initials = getInitials(authorName);
  const metaDescription = node.operation !== 'start' && node.inputNumber !== undefined
    ? `${node.operation} ${node.inputNumber}`
    : 'starting number';
  const pillLabel = node.operation === 'start' ? 'Origin' : node.operation;
  const depthStyle = { '--level': depth } as CSSProperties;

  const handleReply = async (payload: { operation?: string; inputNumber?: number }) => {
    if (!payload.operation || payload.inputNumber === undefined) return;
    await onReply(node.id, payload);
    setOpen(false);
  };

  return (
    <li className="node-card" style={depthStyle}>
      <article className="node-card__body">
        <header className="node-card__header">
          <div className="node-card__avatar" aria-hidden="true">{initials}</div>
          <div className="node-card__author">
            <p className="node-card__name">{authorName}</p>
            <span className="node-card__timestamp">{formatDate(node.createdAt)}</span>
          </div>
          <span className={`node-card__pill node-card__pill--${node.operation}`}>
            {pillLabel}
          </span>
        </header>
        <div className="node-card__content">
          <p className="node-card__value">{node.value}</p>
          <p className="node-card__meta">{metaDescription}</p>
        </div>
      </article>
      {canInteract && (
        <div className="node-card__actions">
          <button className="ghost" onClick={() => setOpen((v) => !v)}>
            {open ? 'Cancel' : 'Reply'}
          </button>
        </div>
      )}
      {open && (
        <OperationForm
          mode="reply"
          title="Respond"
          onSubmit={(payload) => handleReply(payload)}
        />
      )}
      {node.children.length > 0 && (
        <ul className="node-card__children">
          {node.children.map((child) => (
            <NodeCard key={child.id} node={child} onReply={onReply} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
};

export default NodeCard;
