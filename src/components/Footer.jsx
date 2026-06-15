import { Link } from "react-router-dom";
import BrandLogo from "./BrandLogo";

const Footer = ({ id, className = "" }) => {
  const footerClassName = [
    "bg-slate-900 text-white py-12 px-4 md:px-6",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <footer id={id} className={footerClassName}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BrandLogo size="md" />
            </div>

            <p className="text-slate-400 text-sm">
              India's first no-brokerage platform connecting property owners
              directly with tenants.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>

            <ul className="space-y-2 text-slate-400 text-sm">
              {/* <li>
                <div className="hover:text-[#ff7438] transition-colors">
                  Browse Properties
                </div>
              </li>
              <li>
                <div className="hover:text-[#ff7438] transition-colors">
                  List Your Property
                </div>
              </li> */}
              <li>
                <Link to="/about-us" className="hover:text-[#ff7438] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-[#ff7438] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="hover:text-[#ff7438] transition-colors">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-and-conditions" className="hover:text-[#ff7438] transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Locations</h4>

            <ul className="space-y-2 text-slate-400 text-sm">
              <li>Pune</li>
              <li>PCMC</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Contact</h4>

            <ul className="space-y-2 text-slate-400 text-sm">
              <li>support@rentalchaavi.com</li>
              <li>+91 94218 73407</li>
               <li> <span className="text-slate-400">GSTIN :</span> 27FNCPA0353N1Z2</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 text-center text-slate-400 text-sm">
                    <p>&copy; 2026 Caryanam. All rights reserved. TOSIF KASIM AATTAR</p>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
