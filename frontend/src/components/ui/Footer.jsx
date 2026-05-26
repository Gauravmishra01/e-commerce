import React from "react";
import { Link } from "react-router-dom";
import {
  FaApple,
  FaFacebook,
  FaInstagram,
  FaPinterest,
  FaTwitter,
} from "react-icons/fa6";

const Footer = () => {
  return (
    <footer className="mt-10 border-t border-white/70 bg-slate-950 text-slate-200">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <Link to="/">
              <img
                src="/ekart-logo.svg"
                alt="Ekart premium e-commerce logo"
                className="w-40 max-w-full"
              />
            </Link>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Ekart delivers a premium, fast, and polished shopping experience
              for modern customers who expect a cleaner storefront.
            </p>
            <p className="mt-2 text-sm text-slate-400">
              123 Electronics St, Style City, NY 10001
            </p>
            <p className="text-sm text-slate-400">Email: support@ekart.com</p>
            <p className="text-sm text-slate-400">Phone: (123) 456-7890</p>
          </div>

          <div>
            <h3 className="mb-3 text-xl font-semibold">Customer Service</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>Contact Us</li>
              <li>Shipping & Returns</li>
              <li>FAQs</li>
              <li>Order Tracking</li>
              <li>Size Guide</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-xl font-semibold">Follow Us</h3>
            <div className="flex gap-4 text-2xl text-slate-400">
              <FaFacebook className="cursor-pointer transition hover:text-blue-500" />
              <FaInstagram className="cursor-pointer transition hover:text-pink-500" />
              <FaPinterest className="cursor-pointer transition hover:text-red-500" />
              <FaTwitter className="cursor-pointer transition hover:text-sky-400" />
              <FaApple className="cursor-pointer transition hover:text-white" />
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold">Stay in the loop</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Subscribe for product drops, offers, and storefront updates.
            </p>

            <form className="mt-4 flex">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full rounded-l-full border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 placeholder:text-slate-500 outline-none"
              />
              <button
                type="submit"
                className="rounded-r-full bg-white px-4 font-semibold text-slate-950 transition hover:bg-slate-200"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        <div className="mt-12 border-t border-white/10 pt-6 text-center text-sm text-slate-500">
          <p>
            &copy; {new Date().getFullYear()}{" "}
            <span className="text-pink-600">Ekart</span>. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
