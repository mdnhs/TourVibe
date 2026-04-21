import { SiteHeader } from "@/components/site-header";
import { AppearanceForm } from "./appearance-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AppearancePage() {
  return (
    <>
      <SiteHeader title="Appearance" subtitle="Customize the dashboard appearance" />
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize the appearance of the dashboard. Automatically switch between day and night themes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AppearanceForm />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
