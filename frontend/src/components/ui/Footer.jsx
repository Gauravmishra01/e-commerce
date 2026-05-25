import React from "react";
import { Link } from "react-router-dom";
import {
  FaFacebook,
  FaInstagram,
  FaPinterest,
  FaTwitter,
} from "react-icons/fa6";

const Footer = () => {
  return (
    <footer className="mt-10 bg-slate-950 text-slate-200">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-4">
        {/* Info Section */}
        <div>
          <Link to="/">
            <img src="/Ekart.png" alt="Logo" className="w-32" />
          </Link>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Ekart delivers a premium, fast, and polished shopping experience for
            modern electronics customers.
          </p>
          <p className="mt-2 text-sm text-slate-400">
            123 Electronics St, Style City, NY 10001
          </p>
          <p className="text-sm text-slate-400">Email: support@ekart.com</p>
          <p className="text-sm text-slate-400">Phone: (123) 456-7890</p>
        </div>

        {/* Customer Service Links */}
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

        {/* Social Media */}
        <div>
          <h3 className="mb-3 text-xl font-semibold">Follow Us</h3>
          <div className="flex gap-4 text-2xl text-slate-400">
            <FaFacebook className="hover:text-blue-500 cursor-pointer" />
            <FaInstagram className="hover:text-pink-500 cursor-pointer" />
            <FaPinterest className="hover:text-red-500 cursor-pointer" />
            <FaTwitter className="hover:text-blue-400 cursor-pointer" />
          </div>
        </div>

        {/* Newsletter Section */}
        <div>
          <h3 className="text-xl font-semibold">Stay in the loop</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Subscribe for product drops, offers, and storefront updates.
          </p>

          <form className="mt-4 flex">
            <input
              type="email"
              placeholder="Your email address"
              className="w-full rounded-l-md border border-slate-800 bg-slate-900 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-r-md bg-white px-4 text-slate-950 transition hover:bg-slate-200"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-white/10 py-6 text-center text-sm text-slate-500">
        <p>
          &copy; {new Date().getFullYear()}{" "}
          <span className="text-pink-600">Ekart</span>. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
