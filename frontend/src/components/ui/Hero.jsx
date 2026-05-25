import React from "react";
import { Button } from "../button";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_#fff7ed,_#f8fafc_35%,_#e2e8f0)] py-16 text-slate-950 lg:py-24">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,23,42,0.04),rgba(255,255,255,0))]" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 lg:grid-cols-[1.05fr_0.95fr] lg:px-0">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-4 py-2 text-xs font-medium uppercase tracking-[0.28em] text-slate-500 shadow-sm backdrop-blur">
            <Sparkles className="h-4 w-4 text-slate-900" />
            Premium electronics store
          </div>

          <div className="space-y-4">
            <h1 className="max-w-2xl text-4xl font-semibold leading-tight md:text-6xl">
              Refined shopping for modern electronics.
            </h1>
            <p className="max-w-xl text-base leading-8 text-slate-600 md:text-lg">
              Discover premium devices, clean browsing, and a smoother checkout
              experience built for speed, trust, and clarity.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Button
              asChild
              className="bg-slate-950 text-white hover:bg-slate-800"
            >
              <Link to="/products" className="inline-flex items-center gap-2">
                Shop now
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-slate-300 bg-white/80 text-slate-950 hover:bg-white"
            >
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
                className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm backdrop-blur"
              >
                <p className="text-sm font-medium text-slate-950">{title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-500">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-6 -top-6 h-24 w-24 rounded-full bg-orange-200/60 blur-3xl" />
          <div className="absolute -bottom-6 -right-6 h-28 w-28 rounded-full bg-slate-300/70 blur-3xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 p-4 shadow-[0_30px_90px_rgba(15,23,42,0.12)] backdrop-blur">
            <img
              src="/ekart-hero1.png"
              alt="Featured electronics"
              className="h-full w-full rounded-[1.5rem] object-cover"
            />
            <div className="absolute bottom-6 left-6 rounded-2xl border border-white/60 bg-white/85 px-4 py-3 text-sm shadow-lg backdrop-blur">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                Featured drop
              </p>
              <p className="mt-1 font-medium text-slate-950">
                Curated devices for a polished storefront.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
