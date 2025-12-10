-- CreateIndex
CREATE INDEX "activity_logs_orchardId_perform_date_idx" ON "activity_logs"("orchardId", "perform_date" DESC);

-- CreateIndex
CREATE INDEX "activity_logs_status_follow_up_date_idx" ON "activity_logs"("status", "follow_up_date");

-- CreateIndex
CREATE INDEX "trees_orchardId_status_zone_idx" ON "trees"("orchardId", "status", "zone");
