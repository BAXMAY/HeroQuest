import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import {
  chooseSpinPrize,
  schema,
  scoreMemory,
  triviaReward,
  type TriviaOptions,
} from "@heroquest/db";
import { db } from "@/server/db";
import { getSessionContext } from "@/server/middleware";
import { getRequest } from "@tanstack/react-start/server";
import { localDateString } from "@/lib/dates";
import { getEnv } from "@/lib/env";
import { generateDailyTrivia } from "@heroquest/ai";

// ---------- Daily state ----------

export const getDailyState = createServerFn({ method: "GET" }).handler(async () => {
  const ctx = await getSessionContext(getRequest());
  if (!ctx.user || !ctx.profile) throw new Error("UNAUTHORIZED");
  const today = localDateString(new Date(), ctx.profile.locale);
  const attempts = await db()
    .select({ game: schema.miniGameAttempt.game })
    .from(schema.miniGameAttempt)
    .where(
      and(
        eq(schema.miniGameAttempt.userId, ctx.user.id),
        eq(schema.miniGameAttempt.date, today),
      ),
    );
  const played = new Set(attempts.map((a) => a.game));
  return {
    today,
    spinAvailable: !played.has("spin"),
    memoryAvailable: !played.has("memory"),
    triviaAvailable: !played.has("trivia"),
    streak: {
      current: ctx.profile.streakCurrent,
      longest: ctx.profile.streakLongest,
    },
  };
});

// ---------- Spin-the-wheel ----------

export const playSpin = createServerFn({ method: "POST" }).handler(async () => {
  const ctx = await getSessionContext(getRequest());
  if (!ctx.user || !ctx.profile) throw new Error("UNAUTHORIZED");

  const today = localDateString(new Date(), ctx.profile.locale);
  const outcome = chooseSpinPrize(Math.random());
  const id = nanoid();
  const now = new Date();
  const database = db();

  // Insert attempt — unique (user, game, date) blocks a second spin today.
  try {
    await database.insert(schema.miniGameAttempt).values({
      id,
      userId: ctx.user.id,
      game: "spin",
      date: today,
      payload: { prize: outcome.prize, segmentIndex: outcome.segmentIndex },
      xpAwarded: outcome.xp,
      coinsAwarded: outcome.coins,
      createdAt: now,
    });
  } catch (err) {
    throw new Error("ALREADY_PLAYED_TODAY");
  }

  if (outcome.xp || outcome.coins) {
    await database
      .update(schema.userProfile)
      .set({
        totalXp: ctx.profile.totalXp + outcome.xp,
        braveCoins: ctx.profile.braveCoins + outcome.coins,
        updatedAt: now,
      })
      .where(eq(schema.userProfile.userId, ctx.user.id));
  }
  return outcome;
});

// ---------- Memory match ----------

const memoryInput = z.object({
  moves: z.number().int().min(12).max(200),
  timeMs: z.number().int().min(1).max(15 * 60 * 1000),
});

export const submitMemoryResult = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => memoryInput.parse(data))
  .handler(async ({ data }) => {
    const ctx = await getSessionContext(getRequest());
    if (!ctx.user || !ctx.profile) throw new Error("UNAUTHORIZED");
    const today = localDateString(new Date(), ctx.profile.locale);
    const score = scoreMemory(data);
    const id = nanoid();
    const now = new Date();
    const database = db();
    try {
      await database.insert(schema.miniGameAttempt).values({
        id,
        userId: ctx.user.id,
        game: "memory",
        date: today,
        payload: { moves: data.moves, timeMs: data.timeMs, score: score.score },
        xpAwarded: score.xp,
        coinsAwarded: score.coins,
        createdAt: now,
      });
    } catch {
      throw new Error("ALREADY_PLAYED_TODAY");
    }
    if (score.xp || score.coins) {
      await database
        .update(schema.userProfile)
        .set({
          totalXp: ctx.profile.totalXp + score.xp,
          braveCoins: ctx.profile.braveCoins + score.coins,
          updatedAt: now,
        })
        .where(eq(schema.userProfile.userId, ctx.user.id));
    }
    return score;
  });

// ---------- Trivia ----------

export const getDailyTriviaQuestion = createServerFn({ method: "GET" }).handler(async () => {
  const ctx = await getSessionContext(getRequest());
  if (!ctx.user || !ctx.profile) throw new Error("UNAUTHORIZED");
  const env = getEnv();
  const today = localDateString(new Date(), ctx.profile.locale);
  const kvKey = `trivia:today:${ctx.profile.locale}`;

  // KV hot-path: question ID for today.
  let questionId: string | null = null;
  try {
    questionId = await env.TRIVIA_KV.get(kvKey);
  } catch {
    /* KV not available in early dev — fall through */
  }

  const database = db();
  if (!questionId) {
    // Fallback: query D1 for today's pool, picking one we haven't shown.
    const todaysPool = await database
      .select()
      .from(schema.triviaQuestion)
      .where(
        and(
          eq(schema.triviaQuestion.locale, ctx.profile.locale),
          eq(schema.triviaQuestion.datePool, today),
        ),
      )
      .limit(1);
    if (todaysPool[0]) {
      questionId = todaysPool[0].id;
      try {
        await env.TRIVIA_KV.put(kvKey, questionId, { expirationTtl: 60 * 60 * 36 });
      } catch {
        /* ignore */
      }
    }
  }

  if (!questionId) return null;

  const q = await database
    .select()
    .from(schema.triviaQuestion)
    .where(eq(schema.triviaQuestion.id, questionId))
    .limit(1)
    .then((r) => r[0]);
  if (!q) return null;

  // Don't leak the correct answer to the client.
  return {
    id: q.id,
    question: q.question,
    options: q.options as TriviaOptions,
    difficulty: q.difficulty,
    topic: q.topic,
  };
});

const submitTriviaInput = z.object({
  questionId: z.string().min(1),
  chosenIndex: z.number().int().min(0).max(3),
});

export const submitTriviaAnswer = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => submitTriviaInput.parse(data))
  .handler(async ({ data }) => {
    const ctx = await getSessionContext(getRequest());
    if (!ctx.user || !ctx.profile) throw new Error("UNAUTHORIZED");
    const today = localDateString(new Date(), ctx.profile.locale);
    const database = db();

    const q = await database
      .select()
      .from(schema.triviaQuestion)
      .where(eq(schema.triviaQuestion.id, data.questionId))
      .limit(1)
      .then((r) => r[0]);
    if (!q) throw new Error("QUESTION_NOT_FOUND");

    const correct = data.chosenIndex === q.correctIndex;
    const reward = triviaReward(correct);
    const id = nanoid();
    const now = new Date();
    try {
      await database.insert(schema.miniGameAttempt).values({
        id,
        userId: ctx.user.id,
        game: "trivia",
        date: today,
        payload: { questionId: data.questionId, chosenIndex: data.chosenIndex, correct },
        xpAwarded: reward.xp,
        coinsAwarded: reward.coins,
        createdAt: now,
      });
    } catch {
      throw new Error("ALREADY_PLAYED_TODAY");
    }
    if (reward.xp || reward.coins) {
      await database
        .update(schema.userProfile)
        .set({
          totalXp: ctx.profile.totalXp + reward.xp,
          braveCoins: ctx.profile.braveCoins + reward.coins,
          updatedAt: now,
        })
        .where(eq(schema.userProfile.userId, ctx.user.id));
    }
    return {
      correct,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
      reward,
    };
  });

// Re-export the trivia generator so cron handlers can pull it in.
export { generateDailyTrivia };
