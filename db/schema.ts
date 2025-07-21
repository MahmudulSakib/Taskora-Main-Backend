import {
  pgTable,
  varchar,
  uuid,
  timestamp,
  boolean,
  numeric,
  text,
  decimal,
  integer,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

export const usersTable = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  mobileNumber: varchar("mobile_number", { length: 15 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),

  referCode: varchar("refer_code", { length: 50 }).notNull(),
  referredBy: varchar("referred_by", { length: 50 }),
  referralBonusGranted: boolean("referral_bonus_granted")
    .default(false)
    .notNull(),

  gender: varchar("gender", { length: 10 }),
  address: varchar("address", { length: 500 }),
  country: varchar("country", { length: 100 }),
  profilePicture: varchar("profile_picture", { length: 500 }),
  isVerified: boolean("is_verified").default(false),
  verificationToken: varchar("verification_token", { length: 255 }),
  hasClaimedWelcomeOffer: boolean("has_claimed_welcome_offer").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const adminsTable = pgTable("admins", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  token: varchar("token", { length: 255 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const addMoneyRequestsTable = pgTable("add_money_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  paymentMethod: varchar("payment_method", { length: 20 }).notNull(),
  merchantNumber: varchar("merchant_number", { length: 20 }).notNull(),
  senderNumber: varchar("sender_number", { length: 20 }).notNull(),
  amount: numeric("amount").notNull(),
  status: varchar("status", { length: 20 }).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const walletTable = pgTable("wallets", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  balance: numeric("balance").default("0"),
});

export const userBonusWalletTable = pgTable("user_bonus_wallet", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => usersTable.id)
    .notNull(),
  amount: decimal("amount", { precision: 10, scale: 5 }).default("0.00000"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const rechargeTable = pgTable("mobile_recharges", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  mobileNumber: varchar("mobile_number", { length: 15 }).notNull(),
  operator: varchar("operator", { length: 50 }).notNull(),
  simType: varchar("sim_type", { length: 50 }).notNull(),
  amount: numeric("amount").notNull(),
  status: varchar("status", { length: 20 }).default("Pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const driveOffersTable = pgTable("drive_offers", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  isSimType: boolean("is_sim_type").default(false),
  simType: varchar("sim_type", { length: 50 }),
  duration: varchar("duration", { length: 100 }).notNull(),
  validation: varchar("validation", { length: 100 }).notNull(),
  purchaseAmount: numeric("purchase_amount").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const jobPostRequestsTable = pgTable("job_post_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, {
      onDelete: "cascade",
    }),
  title: varchar("title", { length: 255 }).notNull(),
  link: text("link").notNull(),
  limit: numeric("limit").notNull(),
  costPerLimit: numeric("cost_per_limit").notNull(),
  leftLimit: integer("left_limit").notNull(),
  totalCost: numeric("total_cost").notNull(),
  imageUrl: text("image_url").notNull(),
  description: text("description").notNull(),
  status: varchar("status", {
    enum: ["pending", "accepted", "rejected"],
  })
    .default("pending")
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
});

export const jobProofsTable = pgTable("job_proofs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  jobId: uuid("job_id")
    .notNull()
    .references(() => jobPostRequestsTable.id, { onDelete: "cascade" }),
  imageUrls: text("image_urls").array().notNull(),
  status: varchar("status", { length: 20 }).default("pending"),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});

export const jobPostRequestsRelations = relations(
  jobPostRequestsTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [jobPostRequestsTable.userId],
      references: [usersTable.id],
    }),
  })
);

export const quizzesTable = pgTable("quizzes", {
  id: uuid("id").defaultRandom().primaryKey(),
  question: text("question").notNull(),
  optionA: text("option_a").notNull(),
  optionB: text("option_b").notNull(),
  optionC: text("option_c").notNull(),
  optionD: text("option_d").notNull(),
  correctAnswer: text("correct_answer").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const quizSubmissionsTable = pgTable("quiz_submissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => usersTable.id)
    .notNull(),
  quizId: uuid("quiz_id")
    .references(() => quizzesTable.id)
    .notNull(),
  selectedAnswer: text("selected_answer").notNull(),
  status: text("status").default("pending"),
  bonusAmount: decimal("bonus_amount"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const aiSubscriptionsTable = pgTable("ai_subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  duration: integer("duration").notNull(),
  price: decimal("price").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userAiSubscriptionsTable = pgTable("user_ai_subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id")
    .references(() => usersTable.id)
    .notNull(),

  planId: uuid("plan_id")
    .references(() => aiSubscriptionsTable.id)
    .notNull(),

  email: text("email").notNull(),

  mobileNumber: text("mobile_number").notNull(),

  subscribedAt: timestamp("subscribed_at").defaultNow().notNull(),

  status: text("status").default("pending").notNull(),
});

export const bonusWithdrawRequestsTable = pgTable("bonus_withdraw_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => usersTable.id)
    .notNull(),
  amount: decimal("amount").notNull(),
  method: text("method").notNull(),
  mobileBankType: text("mobile_bank_type"),
  mobileNumber: text("mobile_number"),
  accountNumber: text("account_number"),
  branchName: text("branch_name"),
  accountName: text("account_name"),
  bankName: text("bank_name"),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notificationsTable = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userRanksTable = pgTable("user_ranks", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => usersTable.id)
    .notNull()
    .unique(),
  rank: integer("rank").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const vendorShipTable = pgTable("vendor_ship_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => usersTable.id)
    .notNull(),
  shopName: text("shop_name").notNull(),
  shopAddress: text("shop_address").notNull(),
  contactNumber: text("contact_number").notNull(),
  email: text("email").notNull(),
  status: text("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const carouselImagesTable = pgTable("carousel_images", {
  id: uuid("id").defaultRandom().primaryKey(),
  url: varchar("url", { length: 500 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
