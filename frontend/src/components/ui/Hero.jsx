import React from "react";
import { Button } from "../button";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";

const Hero = () => {
  return (
    <section className="relative overflow-hidden py-16 text-slate-950 lg:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.96),_rgba(248,250,252,0.96)_40%,_rgba(226,232,240,0.9))]" />
      <div className="absolute inset-0 premium-grid opacity-30" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 lg:grid-cols-[1.03fr_0.97fr] lg:px-0">
        <div className="space-y-8">
          <div className="premium-chip w-fit">
            <Sparkles className="h-4 w-4 text-slate-900" />
            Premium shopping, engineered for trust
          </div>

          <div className="space-y-4">
            <h1 className="max-w-2xl text-4xl font-semibold leading-tight md:text-6xl">
              A luxury commerce experience that feels fast, calm, and premium.
            </h1>
            <p className="max-w-xl text-base leading-8 text-slate-600 md:text-lg">
              Discover curated products, polished browsing, and a checkout flow
              designed to make every interaction feel intentional, trustworthy,
              and high-end.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Button asChild className="px-6">
              <Link to="/products" className="inline-flex items-center gap-2">
                Explore the collection
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="px-6">
              <Link to="/cart" className="inline-flex items-center gap-2">
                View cart
                <ShieldCheck className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["Fast delivery", "Ships quickly with dependable tracking."],
              [
                "Secure checkout",
                "Designed around safe, frictionless payments.",
              ],
              ["Premium support", "Clear help when customers need it."],
            ].map(([title, text]) => (
              <div
                key={title}
                className="rounded-[1.5rem] border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur"
              >
                <p className="text-sm font-medium text-slate-950">{title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-500">{text}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-3 rounded-[1.75rem] border border-white/70 bg-white/75 p-4 shadow-sm backdrop-blur sm:grid-cols-3">
            {[
              [BadgeCheck, "4.9/5 rating", "Trusted by shoppers"],
              [Truck, "Express delivery", "Fast dispatch on priority items"],
              [ShieldCheck, "Secure checkout", "Protected order flow"],
            ].map(([Icon, title, text]) => (
              <div
                key={title}
                className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white">
                  {React.createElement(Icon, { className: "h-4 w-4" })}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-950">
                    {title}
                  </p>
                  <p className="text-xs text-slate-500">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-6 -top-6 h-24 w-24 rounded-full bg-amber-200/60 blur-3xl" />
          <div className="absolute -bottom-6 -right-6 h-28 w-28 rounded-full bg-slate-300/70 blur-3xl" />
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/70 bg-white/85 p-4 shadow-[0_30px_90px_rgba(15,23,42,0.12)] backdrop-blur">
            <img
              src="/ekart-hero1.png"
              alt="Featured electronics"
              className="h-full w-full rounded-[2rem] object-cover"
            />
            <div className="absolute bottom-6 left-6 rounded-3xl border border-white/60 bg-white/90 px-4 py-3 text-sm shadow-lg backdrop-blur">
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-500">
                Featured drop
              </p>
              <p className="mt-1 max-w-xs font-medium text-slate-950">
                Curated devices, sharper merchandising, and a storefront built
                to convert.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
