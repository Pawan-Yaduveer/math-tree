import express, { Request, Response } from 'express';
import { Types } from 'mongoose';
import { NodeModel, INode } from '../models/Node';
import { requireAuth, requireRegistered } from '../middleware/auth';

const router = express.Router();

type ApiNode = {
  id: string;
  value: number;
  operation: INode['operation'];
  inputNumber?: number;
  parentId: string | null;
  createdAt: Date;
  user?: {
    id: string;
    username: string;
    role: string;
  } | null;
  children: ApiNode[];
};

router.get('/', async (req: Request, res: Response) => {
  try {
    const nodes = await NodeModel.find()
      .sort({ createdAt: 1 })
      .populate('userId', 'username role');

    const map = new Map<string, ApiNode>();
    const roots: ApiNode[] = [];

    nodes.forEach((nodeDoc) => {
      const parentId = nodeDoc.parentId ? (nodeDoc.parentId as Types.ObjectId).toString() : null;
      const populatedUser = nodeDoc.populated('userId') ? nodeDoc.userId as any : null;

      const apiNode: ApiNode = {
        id: nodeDoc._id.toString(),
        value: nodeDoc.value,
        operation: nodeDoc.operation,
        inputNumber: nodeDoc.inputNumber ?? undefined,
        parentId,
        createdAt: nodeDoc.createdAt,
        user: populatedUser
          ? {
            id: populatedUser._id.toString(),
            username: populatedUser.username,
            role: populatedUser.role,
          }
          : null,
        children: [],
      };

      map.set(apiNode.id, apiNode);
    });

    map.forEach((node) => {
      if (node.parentId && map.has(node.parentId)) {
        map.get(node.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    res.json({
      summary: {
        totalNodes: nodes.length,
        chains: roots.length,
      },
      tree: roots,
      nodes: Array.from(map.values()),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tree' });
  }
});

router.post('/start', requireAuth, requireRegistered, async (req: Request, res: Response) => {
  try {
    const { value } = req.body;

    if (typeof value !== 'number') {
      return res.status(400).json({ error: 'Starting value must be a number' });
    }
    
    const newNode = new NodeModel({
      userId: req.user!.id,
      value,
      operation: 'start',
      parentId: null,
    });

    await newNode.save();
    res.json(newNode);
  } catch (err) {
    res.status(500).json({ error: 'Failed to start chain' });
  }
});

router.post('/reply', requireAuth, requireRegistered, async (req: Request, res: Response) => {
  try {
    const { parentId, operation, inputNumber } = req.body;

    if (!parentId) {
      return res.status(400).json({ error: 'parentId is required' });
    }

    const parentNode = await NodeModel.findById(parentId);
    if (!parentNode) {
      return res.status(404).json({ error: 'Parent node not found' });
    }

    let newValue = parentNode.value;
    const input = Number(inputNumber);

    if (Number.isNaN(input)) {
      return res.status(400).json({ error: 'inputNumber must be a valid number' });
    }

    switch (operation) {
      case 'add':
        newValue += input;
        break;
      case 'subtract':
        newValue -= input;
        break;
      case 'multiply':
        newValue *= input;
        break;
      case 'divide':
        if (input === 0) {
          return res.status(400).json({ error: 'Cannot divide by zero' });
        }
        newValue /= input;
        break;
      default:
        return res.status(400).json({ error: 'Invalid operation' });
    }

    const newNode = new NodeModel({
      userId: req.user!.id,
      parentId,
      operation,
      inputNumber: input,
      value: newValue,
    });

    await newNode.save();
    res.json(newNode);

  } catch (err) {
    res.status(500).json({ error: 'Failed to process calculation' });
  }
});

export default router;