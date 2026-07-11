"use server";

import { db } from "@/lib/db";
import { z } from "zod";

const customTourSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(5, "Phone is required"),
  places: z.array(z.string()).min(1, "Please select at least one place"),
  notes: z.string().optional(),
});

export async function submitCustomTourRequest(formData: FormData) {
  try {
    const rawPlaces = formData.get("places") as string;
    const places = rawPlaces ? JSON.parse(rawPlaces) : [];

    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      places,
      notes: formData.get("notes") as string,
    };

    const parsed = customTourSchema.parse(data);

    // Format the message body
    const messageBody = `
Custom Tour Request:
--------------------
Places Selected: ${parsed.places.join(", ")}

Additional Notes:
${parsed.notes || "None provided."}
    `.trim();

    await db.contactMessage.create({
      data: {
        name: parsed.name,
        email: parsed.email,
        phone: parsed.phone,
        subject: "Custom Tour Inquiry",
        message: messageBody,
        status: "unread",
      },
    });

    return { success: true };
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { error: err.errors[0].message };
    }
    return { error: "Failed to submit request. Please try again." };
  }
}
