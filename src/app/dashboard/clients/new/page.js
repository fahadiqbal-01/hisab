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
        preferred_payment_method: formData.get("method"),
        payment_number: formData.get("payment_number"),
      },
    ]);

    if (!error) {
      revalidatePath("/dashboard/clients");
      redirect("/dashboard/clients");
    }
  }

  return (
    <div className="max-w-2xl px-4 sm:px-0 pb-10">
      <header className="mb-8 md:mb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-[#071f18]">New Client</h2>
        <p className="text-black/50 mt-1 text-sm md:text-base">
          Fill in the details to register a new client.
        </p>
      </header>

      <form action={createClientAction} className="space-y-6">
        {/* Changed to grid-cols-1 by default, md:grid-cols-2 for tablet/desktop */}
        <div className="bg-white p-5 md:p-8 rounded-2xl shadow-sm border border-black/5 grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-black/60 mb-2">
              Full Name
            </label>
            <input
              name="name"
              required
              className="w-full p-3 bg-[#fdfaf1] rounded-xl outline-none focus:ring-2 ring-[#071f18]/10"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-black/60 mb-2">
              Email Address
            </label>
            <input
              name="email"
              type="email"
              className="w-full p-3 bg-[#fdfaf1] rounded-xl outline-none focus:ring-2 ring-[#071f18]/10"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-black/60 mb-2">
              Phone Number
            </label>
            <input
              name="phone"
              className="w-full p-3 bg-[#fdfaf1] rounded-xl outline-none focus:ring-2 ring-[#071f18]/10"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-black/60 mb-2">
              Payment Method
            </label>
            <select
              name="method"
              className="w-full p-3 bg-[#fdfaf1] rounded-xl outline-none focus:ring-2 ring-[#071f18]/10 appearance-none"
            >
              <option value="bkash">bKash</option>
              <option value="nagad">Nagad</option>
              <option value="bank">Bank Transfer</option>
              <option value="cash">Cash</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-black/60 mb-2">
              Payment Number
            </label>
            <input
              name="payment_number"
              placeholder="e.g. 017XXXXXXXX"
              className="w-full p-3 bg-[#fdfaf1] rounded-xl outline-none focus:ring-2 ring-[#071f18]/10"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:gap-4">
          <button
            type="submit"
            className="select-none cursor-pointer bg-[#071f18] text-white px-10 py-4 rounded-full font-semibold hover:bg-[#0a2d23] transition-all w-full md:w-auto order-1 md:order-none"
          >
            Save Client
          </button>
          <Link
            href="/dashboard/clients"
            className="select-none cursor-pointer px-10 py-4 rounded-full font-semibold border border-black/10 hover:bg-black/5 transition-all text-center w-full md:w-auto"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}