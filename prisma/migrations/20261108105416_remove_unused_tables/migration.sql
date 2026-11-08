/*
  Warnings:

  - You are about to drop the `email_tokens` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `employees` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `roles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `teams` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "email_tokens" DROP CONSTRAINT "email_tokens_user_id_fkey";

-- DropForeignKey
ALTER TABLE "employees" DROP CONSTRAINT "employees_team_id_fkey";

-- DropForeignKey
ALTER TABLE "employees" DROP CONSTRAINT "employees_user_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_role_id_fkey";

-- DropTable
DROP TABLE "email_tokens";

-- DropTable
DROP TABLE "employees";

-- DropTable
DROP TABLE "roles";

-- DropTable
DROP TABLE "teams";

-- DropTable
DROP TABLE "users";

-- DropEnum
DROP TYPE "Department";

-- DropEnum
DROP TYPE "EmailTokenType";

-- DropEnum
DROP TYPE "EmploymentType";
