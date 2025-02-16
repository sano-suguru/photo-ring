/*
  Warnings:

  - You are about to drop the column `filename` on the `Photo` table. All the data in the column will be lost.
  - You are about to drop the column `height` on the `Photo` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `Photo` table. All the data in the column will be lost.
  - You are about to drop the column `originalName` on the `Photo` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `Photo` table. All the data in the column will be lost.
  - You are about to drop the column `uploaderId` on the `Photo` table. All the data in the column will be lost.
  - You are about to drop the column `width` on the `Photo` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Album` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Group` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GroupMember` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_AlbumToPhoto` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[cognitoSub]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `createdById` to the `Photo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileSizeBytes` to the `Photo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sourceFilename` to the `Photo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storagePath` to the `Photo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cognitoSub` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `displayName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('OWNER', 'CONTRIBUTOR', 'VIEWER');

-- DropForeignKey
ALTER TABLE "Album" DROP CONSTRAINT "Album_groupId_fkey";

-- DropForeignKey
ALTER TABLE "GroupMember" DROP CONSTRAINT "GroupMember_groupId_fkey";

-- DropForeignKey
ALTER TABLE "GroupMember" DROP CONSTRAINT "GroupMember_userId_fkey";

-- DropForeignKey
ALTER TABLE "Photo" DROP CONSTRAINT "Photo_uploaderId_fkey";

-- DropForeignKey
ALTER TABLE "_AlbumToPhoto" DROP CONSTRAINT "_AlbumToPhoto_A_fkey";

-- DropForeignKey
ALTER TABLE "_AlbumToPhoto" DROP CONSTRAINT "_AlbumToPhoto_B_fkey";

-- DropIndex
DROP INDEX "Photo_uploaderId_idx";

-- AlterTable
ALTER TABLE "Photo" DROP COLUMN "filename",
DROP COLUMN "height",
DROP COLUMN "metadata",
DROP COLUMN "originalName",
DROP COLUMN "size",
DROP COLUMN "uploaderId",
DROP COLUMN "width",
ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "fileSizeBytes" INTEGER NOT NULL,
ADD COLUMN     "imageHeight" INTEGER,
ADD COLUMN     "imageMetadata" JSONB,
ADD COLUMN     "imageWidth" INTEGER,
ADD COLUMN     "sourceFilename" TEXT NOT NULL,
ADD COLUMN     "storagePath" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "name",
DROP COLUMN "password",
ADD COLUMN     "cognitoSub" TEXT NOT NULL,
ADD COLUMN     "displayName" TEXT NOT NULL;

-- DropTable
DROP TABLE "Album";

-- DropTable
DROP TABLE "Group";

-- DropTable
DROP TABLE "GroupMember";

-- DropTable
DROP TABLE "_AlbumToPhoto";

-- DropEnum
DROP TYPE "GroupRole";

-- CreateTable
CREATE TABLE "PhotoSpace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PhotoSpace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhotoSpaceMember" (
    "id" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "MemberRole" NOT NULL DEFAULT 'CONTRIBUTOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PhotoSpaceMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhotoAlbum" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "spaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PhotoAlbum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PhotoToPhotoAlbum" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PhotoToPhotoAlbum_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "PhotoSpaceMember_spaceId_idx" ON "PhotoSpaceMember"("spaceId");

-- CreateIndex
CREATE INDEX "PhotoSpaceMember_userId_idx" ON "PhotoSpaceMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PhotoSpaceMember_spaceId_userId_key" ON "PhotoSpaceMember"("spaceId", "userId");

-- CreateIndex
CREATE INDEX "PhotoAlbum_spaceId_idx" ON "PhotoAlbum"("spaceId");

-- CreateIndex
CREATE INDEX "_PhotoToPhotoAlbum_B_index" ON "_PhotoToPhotoAlbum"("B");

-- CreateIndex
CREATE INDEX "Photo_createdById_idx" ON "Photo"("createdById");

-- CreateIndex
CREATE UNIQUE INDEX "User_cognitoSub_key" ON "User"("cognitoSub");

-- AddForeignKey
ALTER TABLE "PhotoSpaceMember" ADD CONSTRAINT "PhotoSpaceMember_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "PhotoSpace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhotoSpaceMember" ADD CONSTRAINT "PhotoSpaceMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhotoAlbum" ADD CONSTRAINT "PhotoAlbum_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "PhotoSpace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "PhotoSpaceMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PhotoToPhotoAlbum" ADD CONSTRAINT "_PhotoToPhotoAlbum_A_fkey" FOREIGN KEY ("A") REFERENCES "Photo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PhotoToPhotoAlbum" ADD CONSTRAINT "_PhotoToPhotoAlbum_B_fkey" FOREIGN KEY ("B") REFERENCES "PhotoAlbum"("id") ON DELETE CASCADE ON UPDATE CASCADE;
