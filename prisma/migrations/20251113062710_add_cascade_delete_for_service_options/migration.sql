-- DropForeignKey
ALTER TABLE "public"."private_ad_service_options" DROP CONSTRAINT "private_ad_service_options_serviceId_fkey";

-- AddForeignKey
ALTER TABLE "private_ad_service_options" ADD CONSTRAINT "private_ad_service_options_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "private_ad_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
