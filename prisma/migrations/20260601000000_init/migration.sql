CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuthSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuthSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Inbody" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "heightCm" DOUBLE PRECISION NOT NULL,
    "weightKg" DOUBLE PRECISION NOT NULL,
    "skeletalMuscleKg" DOUBLE PRECISION NOT NULL,
    "bodyFatKg" DOUBLE PRECISION NOT NULL,
    "bodyFatPercent" DOUBLE PRECISION NOT NULL,
    "bmi" DOUBLE PRECISION NOT NULL,
    "measuredAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Inbody_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WorkoutLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workoutDate" TIMESTAMP(3) NOT NULL,
    "sessionTitle" TEXT NOT NULL,
    "condition" TEXT,
    "memo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "WorkoutLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WorkoutExercise" (
    "id" TEXT NOT NULL,
    "workoutLogId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bodyPart" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "WorkoutExercise_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WorkoutSet" (
    "id" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "weightKg" DOUBLE PRECISION,
    "reps" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "WorkoutSet_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");
CREATE UNIQUE INDEX "AuthSession_tokenHash_key" ON "AuthSession"("tokenHash");
CREATE INDEX "AuthSession_userId_expiresAt_idx" ON "AuthSession"("userId", "expiresAt");
CREATE INDEX "Inbody_userId_measuredAt_idx" ON "Inbody"("userId", "measuredAt");
CREATE INDEX "WorkoutLog_userId_workoutDate_idx" ON "WorkoutLog"("userId", "workoutDate");
CREATE INDEX "WorkoutExercise_workoutLogId_sortOrder_idx" ON "WorkoutExercise"("workoutLogId", "sortOrder");
CREATE INDEX "WorkoutSet_exerciseId_sortOrder_idx" ON "WorkoutSet"("exerciseId", "sortOrder");

ALTER TABLE "AuthSession" ADD CONSTRAINT "AuthSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Inbody" ADD CONSTRAINT "Inbody_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkoutLog" ADD CONSTRAINT "WorkoutLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkoutExercise" ADD CONSTRAINT "WorkoutExercise_workoutLogId_fkey" FOREIGN KEY ("workoutLogId") REFERENCES "WorkoutLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkoutSet" ADD CONSTRAINT "WorkoutSet_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "WorkoutExercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
