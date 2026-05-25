import React from "react";
import { Headphones, ShieldCheck, Truck } from "lucide-react";

const Features = () => {
  return (
    <section className="border-y border-white/70 bg-white/70 py-12 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            [
              Truck,
              "Fast Delivery",
              "Reliable shipping with clear order updates.",
            ],
            [
              ShieldCheck,
              "Secure Payments",
              "Transactions protected with a modern checkout flow.",
            ],
            [
              Headphones,
              "24/7 Support",
              "Help available when customers need it most.",
            ],
          ].map(([Icon, title, text]) => (
            <div
              key={title}
              className="flex items-start gap-4 rounded-3xl border border-slate-200 bg-white px-5 py-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-950">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
