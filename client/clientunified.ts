import express from "express";
import { db } from "../db";
import {
  addMoneyRequestsTable,
  rechargeTable,
  jobProofsTable,
  quizSubmissionsTable,
  userAiSubscriptionsTable,
  bonusWithdrawRequestsTable,
} from "../db/schema";
import { eq, desc } from "drizzle-orm";
import passport from "../security/passportconfig";
import { sql } from "drizzle-orm";

const statusTimeline = express.Router();

statusTimeline.get(
  "/client/status-timeline",
  passport.authenticate("jwt", { session: false }),
  async (req: any, res: any) => {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    try {
      const [addMoney, recharges, proofs, quizzes, subs, withdraws] =
        await Promise.all([
          db
            .select({
              id: addMoneyRequestsTable.id,
              status: addMoneyRequestsTable.status,
              createdAt: addMoneyRequestsTable.createdAt,
              detail: addMoneyRequestsTable.paymentMethod,
            })
            .from(addMoneyRequestsTable)
            .where(eq(addMoneyRequestsTable.userId, userId)),

          db
            .select({
              id: rechargeTable.id,
              status: rechargeTable.status,
              createdAt: rechargeTable.createdAt,
              detail: rechargeTable.operator,
            })
            .from(rechargeTable)
            .where(eq(rechargeTable.userId, userId)),

          db
            .select({
              id: jobProofsTable.id,
              status: jobProofsTable.status,
              createdAt: jobProofsTable.submittedAt,
              detail: sql<string>`'Job Proof Submission'`.as("detail"),
            })
            .from(jobProofsTable)
            .where(eq(jobProofsTable.userId, userId)),

          db
            .select({
              id: quizSubmissionsTable.id,
              status: quizSubmissionsTable.status,
              createdAt: quizSubmissionsTable.createdAt,
              detail: quizSubmissionsTable.selectedAnswer,
            })
            .from(quizSubmissionsTable)
            .where(eq(quizSubmissionsTable.userId, userId)),

          db
            .select({
              id: userAiSubscriptionsTable.id,
              status: userAiSubscriptionsTable.status,
              createdAt: userAiSubscriptionsTable.subscribedAt,
              detail: userAiSubscriptionsTable.planId,
            })
            .from(userAiSubscriptionsTable)
            .where(eq(userAiSubscriptionsTable.userId, userId)),

          db
            .select({
              id: bonusWithdrawRequestsTable.id,
              status: bonusWithdrawRequestsTable.status,
              createdAt: bonusWithdrawRequestsTable.createdAt,
              detail: bonusWithdrawRequestsTable.method,
            })
            .from(bonusWithdrawRequestsTable)
            .where(eq(bonusWithdrawRequestsTable.userId, userId)),
        ]);

      const allEntries = [
        ...addMoney.map((i) => ({ ...i, type: "Add Money" })),
        ...recharges.map((i) => ({ ...i, type: "Recharge" })),
        ...proofs.map((i) => ({ ...i, type: "Job Proof" })),
        ...quizzes.map((i) => ({ ...i, type: "Quiz Submission" })),
        ...subs.map((i) => ({ ...i, type: "AI Subscription" })),
        ...withdraws.map((i) => ({ ...i, type: "Bonus Withdraw" })),
      ];

      type Entry = {
        id: string;
        type: string;
        status: string | null;
        createdAt: Date | null;
        detail: unknown;
      };

      function hasValidDate(
        entry: Entry
      ): entry is Entry & { createdAt: Date } {
        return entry.createdAt !== null;
      }
      const sanitized = allEntries
        .filter(
          (entry): entry is typeof entry & { createdAt: Date } =>
            entry.createdAt !== null
        )
        .map((entry) => ({
          id: entry.id,
          type: entry.type,
          status: entry.status ?? "pending",
          createdAt: entry.createdAt,
          detail: String(entry.detail ?? "-"),
        }))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      const paginated = sanitized.slice(offset, offset + limit);

      return res.json({
        data: paginated,
        total: sanitized.length,
        currentPage: page,
        totalPages: Math.ceil(sanitized.length / limit),
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to fetch status timeline" });
    }
  }
);

export default statusTimeline;
