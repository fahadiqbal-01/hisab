import React from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export default async function NewClientPage() {
  const session = await getServerSession(authOptions);

  async function createClientAction(formData) {
    "use server";

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );

    if (!session?.user?.id) return;

    const { error } = await supabaseAdmin.from("clients").insert([
      {
        user_id: session.user.id,
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        company: formData.get("company"),
        address: formData.get("address"),
        city_state: formData.get("city_state"),
        zip_code: formData.get("zip_code"),
        country: formData.get("country"),
      },
    ]);

    if (!error) {
      revalidatePath("/dashboard/clients");
      revalidatePath("/dashboard");
      redirect("/dashboard/clients");
    }
  }

  return (
    <div className="max-w-2xl px-4 sm:px-0 pb-10">
      <header className="mb-8 md:mb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-[#071f18] dark:text-white ">
          New Client
        </h2>
        <p className="text-black/50 mt-1 text-sm md:text-base">
          Fill in the details to register a new client.
        </p>
      </header>

      <form action={createClientAction} className="space-y-6">
        <div className="bg-white dark:bg-[#0d0d0d] p-5 md:p-8 rounded-2xl shadow-sm border border-black/5 grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-black/60 dark:text-white mb-2">
              Full Name
            </label>
            <input
              name="name"
              required
              className="w-full p-3 bg-[#fdfaf1] text-black dark:text-white dark:bg-white/20 rounded-xl outline-none focus:ring-2 ring-[#071f18]/10"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-black/60 dark:text-white mb-2">
              Company{" "}
              <span className="text-xs font-normal opacity-50">(Optional)</span>
            </label>
            <input
              name="company"
              placeholder="e.g. Acme Corp"
              className="w-full p-3 bg-[#fdfaf1] text-black dark:text-white dark:bg-white/20 rounded-xl outline-none focus:ring-2 ring-[#071f18]/10"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-black/60 dark:text-white mb-2">
              Email Address
            </label>
            <input
              name="email"
              type="email"
              className="w-full p-3 bg-[#fdfaf1] text-black dark:text-white dark:bg-white/20 rounded-xl outline-none focus:ring-2 ring-[#071f18]/10"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-black/60 dark:text-white mb-2">
              Phone Number
            </label>
            <input
              name="phone"
              className="w-full p-3 bg-[#fdfaf1] text-black dark:text-white dark:bg-white/20 rounded-xl outline-none focus:ring-2 ring-[#071f18]/10"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-black/60 dark:text-white mb-2">
              Address{" "}
              <span className="text-xs font-normal opacity-50">(Optional)</span>
            </label>
            <input
              name="address"
              placeholder="Street address, Apartment, etc."
              className="w-full p-3 bg-[#fdfaf1] text-black dark:text-white dark:bg-white/20 rounded-xl outline-none focus:ring-2 ring-[#071f18]/10"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-black/60 dark:text-white mb-2">
              City / State{" "}
              <span className="text-xs font-normal opacity-50">(Optional)</span>
            </label>
            <input
              name="city_state"
              placeholder="e.g. Dhaka, BD"
              className="w-full p-3 bg-[#fdfaf1] text-black dark:text-white dark:bg-white/20 rounded-xl outline-none focus:ring-2 ring-[#071f18]/10"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-black/60 dark:text-white mb-2">
              Zip Code{" "}
              <span className="text-xs font-normal opacity-50">(Optional)</span>
            </label>
            <input
              name="zip_code"
              placeholder="e.g. 1200"
              className="w-full p-3 bg-[#fdfaf1] text-black dark:text-white dark:bg-white/20 rounded-xl outline-none focus:ring-2 ring-[#071f18]/10"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-black/60 dark:text-white mb-2">
              Country
            </label>
            <input
              name="country"
              required
              defaultValue="Bangladesh"
              className="w-full p-3 bg-[#fdfaf1] text-black dark:text-white dark:bg-white/20 rounded-xl outline-none focus:ring-2 ring-[#071f18]/10"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:gap-4">
          <button
            type="submit"
            className="select-none cursor-pointer bg-[#071f18] dark:bg-white text-white dark:text-black px-10 py-4 rounded-full font-semibold hover:bg-[#0a2d23] dark:hover:bg-orange-700 dark:hover:text-white transition-all w-full md:w-auto order-1 md:order-none"
          >
            Save Client
          </button>
          <Link
            href="/dashboard/clients"
            className="select-none cursor-pointer text-[#0a2d23] dark:text-white px-10 py-4 rounded-full font-semibold border hover:text-red-700 border-black/10 hover:bg-black/5 transition-all text-center w-full md:w-auto"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
