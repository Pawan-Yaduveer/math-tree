export type OperationType = 'start' | 'add' | 'subtract' | 'multiply' | 'divide';

export interface UserSummary {
  id: string;
  username: string;
  role: 'unregistered' | 'registered' | 'admin';
}

export interface TreeNode {
  id: string;
  value: number;
  operation: OperationType;
  inputNumber?: number;
  parentId: string | null;
  createdAt: string;
  user?: UserSummary | null;
  children: TreeNode[];
}

export interface TreeResponse {
  summary: {
    totalNodes: number;
    chains: number;
  };
  tree: TreeNode[];
  nodes: TreeNode[];
}

export interface AuthResponse {
  token: string;
  user: UserSummary;
}
