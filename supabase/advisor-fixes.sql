-- ============================================================
-- Supabase Advisor Fixes
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ============================================================
-- 1. ENABLE ROW LEVEL SECURITY on all public tables
--    (Your app uses Prisma + next-auth so security is handled
--    at the API layer. These policies allow full access while
--    satisfying the advisor and protecting against direct DB access.)
-- ============================================================

ALTER TABLE "User"                ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order"               ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Message"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FileUpload"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PasswordResetToken"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PasswordResetRequest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "QuoteHistory"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderView"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderEvent"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderPhoto"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Address"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Product"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Review"              ENABLE ROW LEVEL SECURITY;
ALTER TABLE "GalleryPhoto"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Coupon"              ENABLE ROW LEVEL SECURITY;

-- Allow full access via the postgres role (used by Prisma)
-- This ensures your app continues to work normally.

CREATE POLICY "postgres full access" ON "User"                FOR ALL TO postgres USING (true) WITH CHECK (true);
CREATE POLICY "postgres full access" ON "Order"               FOR ALL TO postgres USING (true) WITH CHECK (true);
CREATE POLICY "postgres full access" ON "Message"             FOR ALL TO postgres USING (true) WITH CHECK (true);
CREATE POLICY "postgres full access" ON "FileUpload"          FOR ALL TO postgres USING (true) WITH CHECK (true);
CREATE POLICY "postgres full access" ON "PasswordResetToken"  FOR ALL TO postgres USING (true) WITH CHECK (true);
CREATE POLICY "postgres full access" ON "PasswordResetRequest" FOR ALL TO postgres USING (true) WITH CHECK (true);
CREATE POLICY "postgres full access" ON "QuoteHistory"        FOR ALL TO postgres USING (true) WITH CHECK (true);
CREATE POLICY "postgres full access" ON "OrderView"           FOR ALL TO postgres USING (true) WITH CHECK (true);
CREATE POLICY "postgres full access" ON "OrderEvent"          FOR ALL TO postgres USING (true) WITH CHECK (true);
CREATE POLICY "postgres full access" ON "OrderPhoto"          FOR ALL TO postgres USING (true) WITH CHECK (true);
CREATE POLICY "postgres full access" ON "Address"             FOR ALL TO postgres USING (true) WITH CHECK (true);
CREATE POLICY "postgres full access" ON "Product"             FOR ALL TO postgres USING (true) WITH CHECK (true);
CREATE POLICY "postgres full access" ON "Review"              FOR ALL TO postgres USING (true) WITH CHECK (true);
CREATE POLICY "postgres full access" ON "GalleryPhoto"        FOR ALL TO postgres USING (true) WITH CHECK (true);
CREATE POLICY "postgres full access" ON "Coupon"              FOR ALL TO postgres USING (true) WITH CHECK (true);


-- ============================================================
-- 2. ADD INDEXES ON FOREIGN KEY COLUMNS
--    (Fixes "unindexed foreign keys" performance warnings)
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_order_user_id         ON "Order"              ("userId");
CREATE INDEX IF NOT EXISTS idx_message_order_id      ON "Message"            ("orderId");
CREATE INDEX IF NOT EXISTS idx_message_sender_id     ON "Message"            ("senderId");
CREATE INDEX IF NOT EXISTS idx_fileupload_order_id   ON "FileUpload"         ("orderId");
CREATE INDEX IF NOT EXISTS idx_pwreset_user_id       ON "PasswordResetToken" ("userId");
CREATE INDEX IF NOT EXISTS idx_quotehistory_order_id ON "QuoteHistory"       ("orderId");
CREATE INDEX IF NOT EXISTS idx_orderevent_order_id   ON "OrderEvent"         ("orderId");
CREATE INDEX IF NOT EXISTS idx_orderphoto_order_id   ON "OrderPhoto"         ("orderId");
CREATE INDEX IF NOT EXISTS idx_address_user_id       ON "Address"            ("userId");
CREATE INDEX IF NOT EXISTS idx_review_product_id     ON "Review"             ("productId");
CREATE INDEX IF NOT EXISTS idx_review_user_id        ON "Review"             ("userId");
