import { SiteHeader } from "@/components/site-header";
import { requireDashboardSession } from "@/lib/dashboard";
import { db } from "@/lib/db";
import { ProfileForm } from "./profile-form";
import { PasswordForm } from "./password-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface UserRow {
  id: string;
  name: string;
  email: string;
  image: string | null;
  phone: string | null;
  role: string;
}

export default async function AccountPage() {
  const { session } = await requireDashboardSession();

  const user = db
    .prepare("SELECT id, name, email, image, phone, role FROM user WHERE id = ?")
    .get(session.user.id) as UserRow;

  return (
    <>
      <SiteHeader title="Account" subtitle="Manage your profile and security" />
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Update your name, phone number and profile picture.
              {!user.phone && (
                <span className="ml-2 inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
                  Phone required to book tours
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm user={user} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Keep your account secure with a strong password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PasswordForm />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
