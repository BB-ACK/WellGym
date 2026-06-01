import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt, { type SignOptions } from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { env } from "../config/env";
import { HttpError } from "../utils/httpError";

const TOKEN_EXPIRES_IN_DAYS = 7;
const useMemoryAuthStore = env.MEMORY_AUTH_STORE;

type TokenPayload = {
  sub: string;
  sid: string;
};

type MemoryUser = {
  id: string;
  email: string;
  passwordHash: string;
  name: string | null;
  createdAt: Date;
};

type MemorySession = {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
};

const memoryUsers = new Map<string, MemoryUser>();
const memorySessions = new Map<string, MemorySession>();

export const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

const publicUserSelect = {
  id: true,
  email: true,
  name: true,
  createdAt: true
};

export async function signup(input: { email: string; password: string; name?: string }) {
  if (useMemoryAuthStore) {
    return signupInMemory(input);
  }

  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new HttpError(409, "이미 가입된 이메일입니다.");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      name: input.name
    },
    select: publicUserSelect
  });

  const token = await createSessionToken(user.id);
  return { user, token };
}

export async function login(input: { email: string; password: string }) {
  if (useMemoryAuthStore) {
    return loginInMemory(input);
  }

  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new HttpError(401, "이메일 또는 비밀번호가 올바르지 않습니다.");
  }

  const isValid = await bcrypt.compare(input.password, user.passwordHash);
  if (!isValid) {
    throw new HttpError(401, "이메일 또는 비밀번호가 올바르지 않습니다.");
  }

  const token = await createSessionToken(user.id);
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt
    },
    token
  };
}

export async function createSessionToken(userId: string) {
  if (useMemoryAuthStore) {
    return createMemorySessionToken(userId);
  }

  const expiresAt = new Date(Date.now() + TOKEN_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000);
  const session = await prisma.authSession.create({
    data: {
      userId,
      tokenHash: crypto.randomBytes(32).toString("hex"),
      expiresAt
    }
  });

  const payload: TokenPayload = { sub: userId, sid: session.id };
  const token = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN
  } as SignOptions);

  await prisma.authSession.update({
    where: { id: session.id },
    data: { tokenHash: hashToken(token) }
  });

  return token;
}

export async function verifySession(token: string) {
  if (useMemoryAuthStore) {
    return verifyMemorySession(token);
  }

  const payload = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
  const session = await prisma.authSession.findFirst({
    where: {
      id: payload.sid,
      userId: payload.sub,
      tokenHash: hashToken(token),
      revokedAt: null,
      expiresAt: { gt: new Date() }
    },
    include: { user: true }
  });

  if (!session) {
    throw new HttpError(401, "인증 세션이 만료되었거나 유효하지 않습니다.");
  }

  return session;
}

async function signupInMemory(input: { email: string; password: string; name?: string }) {
  const existing = [...memoryUsers.values()].find((user) => user.email === input.email);
  if (existing) {
    throw new HttpError(409, "이미 가입된 이메일입니다.");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user: MemoryUser = {
    id: crypto.randomUUID(),
    email: input.email,
    passwordHash,
    name: input.name ?? null,
    createdAt: new Date()
  };
  memoryUsers.set(user.id, user);

  const token = await createMemorySessionToken(user.id);
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt
    },
    token
  };
}

async function loginInMemory(input: { email: string; password: string }) {
  const user = [...memoryUsers.values()].find((candidate) => candidate.email === input.email);
  if (!user) {
    throw new HttpError(401, "이메일 또는 비밀번호가 올바르지 않습니다.");
  }

  const isValid = await bcrypt.compare(input.password, user.passwordHash);
  if (!isValid) {
    throw new HttpError(401, "이메일 또는 비밀번호가 올바르지 않습니다.");
  }

  const token = await createMemorySessionToken(user.id);
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt
    },
    token
  };
}

async function createMemorySessionToken(userId: string) {
  const session: MemorySession = {
    id: crypto.randomUUID(),
    userId,
    tokenHash: "",
    expiresAt: new Date(Date.now() + TOKEN_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000),
    revokedAt: null,
    createdAt: new Date()
  };

  const payload: TokenPayload = { sub: userId, sid: session.id };
  const token = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN
  } as SignOptions);

  session.tokenHash = hashToken(token);
  memorySessions.set(session.id, session);
  return token;
}

async function verifyMemorySession(token: string) {
  const payload = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
  const session = memorySessions.get(payload.sid);
  if (
    !session ||
    session.userId !== payload.sub ||
    session.tokenHash !== hashToken(token) ||
    session.revokedAt ||
    session.expiresAt <= new Date()
  ) {
    throw new HttpError(401, "인증 세션이 만료되었거나 유효하지 않습니다.");
  }

  const user = memoryUsers.get(session.userId);
  if (!user) {
    throw new HttpError(401, "인증 사용자를 찾을 수 없습니다.");
  }

  return {
    ...session,
    user
  };
}
