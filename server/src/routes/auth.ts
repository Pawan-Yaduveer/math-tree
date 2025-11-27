import express, { Request, Response } from 'express';
import { Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import UserModel, { IUser } from '../models/User';
import { generateToken, requireAuth } from '../middleware/auth';

const router = express.Router();

const toUserPayload = (user: IUser & { _id: Types.ObjectId }) => ({
  id: user._id.toString(),
  username: user.username,
  role: user.role,
});

const validateCredentials = (username?: string, password?: string) => {
  if (!username || username.length < 3) {
    return 'Username must be at least 3 characters';
  }
  if (!password || password.length < 6) {
    return 'Password must be at least 6 characters';
  }
  return null;
};

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const validationError = validateCredentials(username, password);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const existingUser = await UserModel.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await UserModel.create({ username, passwordHash });
    const payload = toUserPayload(user);

    const token = generateToken({
      userId: payload.id,
      username: payload.username,
      role: payload.role,
    });

    return res.status(201).json({
      token,
      user: payload,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to register user' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const validationError = validateCredentials(username, password);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const payload = toUserPayload(user);

    const token = generateToken({
      userId: payload.id,
      username: payload.username,
      role: payload.role,
    });

    return res.json({
      token,
      user: payload,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to login' });
  }
});

router.post('/upgrade', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role === 'registered') {
      return res.status(200).json({
        message: 'Already registered',
        user: toUserPayload(user),
      });
    }

    user.role = 'registered';
    await user.save();

    const payload = toUserPayload(user);

    const token = generateToken({
      userId: payload.id,
      username: payload.username,
      role: payload.role,
    });

    return res.json({
      message: 'Role upgraded to registered',
      token,
      user: payload,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to upgrade role' });
  }
});

router.get('/me', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = await UserModel.findById(req.user!.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

export default router;
