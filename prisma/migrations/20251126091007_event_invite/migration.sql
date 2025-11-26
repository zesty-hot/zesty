-- AlterTable
ALTER TABLE "chat_message" ADD COLUMN     "eventAttendeeId" TEXT;

-- AddForeignKey
ALTER TABLE "chat_message" ADD CONSTRAINT "chat_message_eventAttendeeId_fkey" FOREIGN KEY ("eventAttendeeId") REFERENCES "event_attendees"("id") ON DELETE SET NULL ON UPDATE CASCADE;
