import React from "react";
import { Headphones, ShieldCheck, Sparkles, Truck } from "lucide-react";

const Features = () => {
  return (
    <section className="py-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            [
              Sparkles,
              "Luxury curation",
              "Assortments presented with editorial clarity.",
            ],
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
              className="flex items-start gap-4 rounded-[1.75rem] border border-white/70 bg-white/80 px-5 py-5 shadow-[0_16px_50px_rgba(15,23,42,0.06)] backdrop-blur transition duration-200 hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(15,23,42,0.1)]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                {React.createElement(Icon, { className: "h-6 w-6" })}
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
