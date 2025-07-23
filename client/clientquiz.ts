import express from "express";
import { db } from "../db";
import { quizzesTable, quizSubmissionsTable } from "../db/schema";
import { eq, and, desc } from "drizzle-orm";
import passport from "../security/passportconfig";

const clientQuiz = express.Router();

clientQuiz.get(
  "/client/quiz-today",
  passport.authenticate("jwt", { session: false }),
  async (req: any, res: any) => {
    const userId = req.user.id;

    const quiz = await db
      .select()
      .from(quizzesTable)
      .orderBy(desc(quizzesTable.createdAt))
      .limit(1);
    const currentQuiz = quiz[0];

    const existing = await db
      .select()
      .from(quizSubmissionsTable)
      .where(
        and(
          eq(quizSubmissionsTable.userId, userId),
          eq(quizSubmissionsTable.quizId, currentQuiz.id)
        )
      );

    if (existing.length > 0) {
      return res.json({
        quiz: currentQuiz,
        alreadySubmitted: true,
        selectedAnswer: existing[0].selectedAnswer,
      });
    }

    return res.json({
      quiz: currentQuiz,
      alreadySubmitted: false,
      selectedAnswer: null,
    });
  }
);

clientQuiz.post(
  "/client/submit-quiz",
  passport.authenticate("jwt", { session: false }),
  async (req: any, res: any) => {
    const { quizId, selectedAnswer } = req.body;
    const userId = req.user.id;

    const exists = await db
      .select()
      .from(quizSubmissionsTable)
      .where(
        and(
          eq(quizSubmissionsTable.userId, userId),
          eq(quizSubmissionsTable.quizId, quizId)
        )
      );

    if (exists.length)
      return res.status(400).json({ error: "Already submitted!" });

    await db
      .insert(quizSubmissionsTable)
      .values({ userId, quizId, selectedAnswer });
    res.json({ message: "Submitted" });
  }
);

export default clientQuiz;
