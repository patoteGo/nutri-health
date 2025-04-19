// Admin dashboard for managing weekly meals
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/authOptions";
import WeeklyMealPlanAdmin from "../../../components/admin/WeeklyMealPlanAdmin";

export default async function AdminMealsPage() {
  // Protect route: only admins can access
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    redirect("/api/auth/signin");
  }
  // TODO: Replace with DB check for isAdmin
  // For now, allow all authenticated users
  // You will implement isAdmin check in middleware/api soon
  return <WeeklyMealPlanAdmin userEmail={session.user.email} />;
}
