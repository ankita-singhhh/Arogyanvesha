import fs from "fs";
import path from "path";

const localDbPath = process.env.LOCAL_DB_PATH ?? path.join(process.cwd(), "localDb.json");
const localDbLockPath = `${localDbPath}.lock`;
const LOCK_RETRY_MS = 25;
const LOCK_RETRIES = 80;
const STALE_LOCK_MS = 30_000;

export class LocalPersistenceError extends Error {
  constructor(message = "Local credential storage is temporarily unavailable.") {
    super(message);
    this.name = "LocalPersistenceError";
  }
}

export interface LocalUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  plan: string;
  prakritiCompleted: boolean;
  currentStreak: number;
  createdAt: string;
  isVerified: boolean;
  otpCode?: string | null;
  otpExpiresAt?: string | null;
  avatarUrl?: string | null;
  /** Face descriptor stored as comma-separated floats (128 values) */
  faceDescriptor?: string | null;
}

export function getLocalUsers(): LocalUser[] {
  try {
    if (!fs.existsSync(localDbPath)) {
      return [];
    }
    const data = fs.readFileSync(localDbPath, "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveLocalUsers(users: LocalUser[]) {
  fs.writeFileSync(localDbPath, JSON.stringify(users, null, 2), "utf8");
}

function sleep(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function acquireLock() {
  for (let attempt = 0; attempt < LOCK_RETRIES; attempt += 1) {
    try {
      await fs.promises.mkdir(localDbLockPath);
      return;
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code !== "EEXIST") throw new LocalPersistenceError();
      try {
        const stat = await fs.promises.stat(localDbLockPath);
        if (Date.now() - stat.mtimeMs > STALE_LOCK_MS) {
          await fs.promises.rmdir(localDbLockPath);
          continue;
        }
      } catch {
        // Another request released the lock between mkdir and stat; retry.
      }
      await sleep(LOCK_RETRY_MS);
    }
  }
  throw new LocalPersistenceError("Local credential storage is busy. Please retry.");
}

async function releaseLock() {
  try {
    await fs.promises.rmdir(localDbLockPath);
  } catch {
    // The next attempt will treat a stale lock as recoverable.
  }
}

async function readLocalUsersStrict(): Promise<LocalUser[]> {
  try {
    const data = await fs.promises.readFile(localDbPath, "utf8");
    const users: unknown = JSON.parse(data);
    if (!Array.isArray(users)) throw new LocalPersistenceError("Local credential data is invalid.");
    return users as LocalUser[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    if (error instanceof LocalPersistenceError) throw error;
    throw new LocalPersistenceError("Local credential data could not be read safely.");
  }
}

async function writeLocalUsersAtomic(users: LocalUser[]) {
  const temporaryPath = `${localDbPath}.${crypto.randomUUID()}.tmp`;
  try {
    await fs.promises.writeFile(temporaryPath, JSON.stringify(users, null, 2), { encoding: "utf8", mode: 0o600 });
    await fs.promises.rename(temporaryPath, localDbPath);
  } catch {
    try { await fs.promises.unlink(temporaryPath); } catch { /* best-effort cleanup */ }
    throw new LocalPersistenceError("Local credential data could not be saved safely.");
  }
}

export type LocalUserPersistenceResult = { status: "created" | "existing"; user: LocalUser } | { status: "conflict" };

/**
 * Serializes read-modify-write access to the JSON credential file. The caller
 * supplies a pre-hashed password and must never log the returned user object.
 */
export async function createOrRecoverLocalUser(user: LocalUser, passwordMatches: (passwordHash: string) => boolean): Promise<LocalUserPersistenceResult> {
  await acquireLock();
  try {
    const users = await readLocalUsersStrict();
    const existing = users.find((candidate) => candidate.email === user.email);
    if (existing) return passwordMatches(existing.passwordHash) ? { status: "existing", user: existing } : { status: "conflict" };
    await writeLocalUsersAtomic([...users, user]);
    return { status: "created", user };
  } finally {
    await releaseLock();
  }
}
