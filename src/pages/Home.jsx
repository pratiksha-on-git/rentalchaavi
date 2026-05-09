import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Home as HomeIcon,
  Search,
  ShieldCheck,
  Users,
  Star,
  ArrowRight,
  MapPin,
  Building2,
  Key,
} from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Search size={28} />,
      title: "Smart Search",
      description:
        "Find your perfect property with advanced filters for location, price, and amenities",
    },
    {
      icon: <ShieldCheck size={28} />,
      title: "Verified Listings",
      description:
        "All properties are verified by our team to ensure authenticity and safety",
    },
    {
      icon: <Users size={28} />,
      title: "Direct Connect",
      description:
        "Chat directly with property owners without any middlemen or brokers",
    },
    {
      icon: <Key size={28} />,
      title: "No Brokerage",
      description:
        "Save thousands by connecting directly with owners - zero brokerage fees",
    },
  ];

  const stats = [
    { value: "10K+", label: "Properties Listed" },
    { value: "5K+", label: "Happy Users" },
    { value: "50+", label: "Cities Covered" },
    { value: "100%", label: "Verified Listings" },
  ];

  return (
    <div className="min-h-screen bg-white font-inter">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center">
              <HomeIcon size={24} className="text-white" />
            </div>
            <span className="text-2xl font-black text-slate-900">
              Caryanam Broker
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-2.5 text-slate-700 font-semibold hover:text-slate-900 transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 md:px-6 bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <Star size={16} fill="currentColor" />
                No Brokerage Platform
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-tight mb-6">
                Find Your Dream
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700">
                  {" "}
                  Home
                </span>
                <br />
                Without Brokers
              </h1>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Connect directly with property owners. Save thousands on brokerage
                fees. Browse verified listings across Pune and PCMC.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate("/login")}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold text-lg rounded-2xl hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Browse Properties
                  <ArrowRight size={20} />
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="px-8 py-4 bg-white text-slate-900 font-bold text-lg rounded-2xl border-2 border-slate-200 hover:border-slate-300 transition-all duration-300"
                >
                  List Your Property
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-black text-slate-900">
                      {stat.value}
                    </div>
                    <div className="text-sm text-slate-600 font-medium">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[40px] p-8 shadow-2xl shadow-blue-500/30">
                <div className="bg-white rounded-[32px] p-6 space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Building2 size={24} className="text-blue-600" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Premium Apartment</div>
                      <div className="text-sm text-slate-600 flex items-center gap-1">
                        <MapPin size={14} />
                        Kothrud, Pune
                      </div>
                    </div>
                  </div>
                  <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center">
                    <HomeIcon size={48} className="text-slate-400" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-black text-slate-900">
                        ₹25,000
                      </div>
                      <div className="text-sm text-slate-600">per month</div>
                    </div>
                    <div className="flex gap-2">
                      <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                        2 BHK
                      </div>
                      <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                        Semi-Furnished
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-white p-4 rounded-2xl shadow-xl">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <ShieldCheck size={20} className="text-green-600" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">Verified</div>
                    <div className="text-xs text-slate-600">Owner Listed</div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-2xl shadow-xl">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">
                      500+ Views
                    </div>
                    <div className="text-xs text-slate-600">This Week</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 md:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
              Why Choose Caryanam?
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              We make property hunting simple, transparent, and brokerage-free
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-slate-50 border border-slate-200 rounded-[24px] p-8 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-6 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            Ready to Find Your Perfect Home?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of happy users who found their dream property without
            paying brokerage
          </p>
          <button
            onClick={() => navigate("/login")}
            className="px-10 py-5 bg-white text-blue-700 font-bold text-lg rounded-2xl hover:shadow-2xl transition-all duration-300 inline-flex items-center gap-2"
          >
            Get Started Free
            <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <HomeIcon size={24} />
                </div>
                <span className="text-2xl font-black">Caryanam</span>
              </div>
              <p className="text-slate-400 text-sm">
                India's first no-brokerage platform connecting property owners
                directly with tenants.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>
                  <button
                    onClick={() => navigate("/login")}
                    className="hover:text-white transition-colors"
                  >
                    Browse Properties
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/login")}
                    className="hover:text-white transition-colors"
                  >
                    List Your Property
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/login")}
                    className="hover:text-white transition-colors"
                  >
                    About Us
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Locations</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>Pune</li>
                <li>PCMC</li>
                <li>Mumbai</li>
                <li>Coming Soon</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>support@caryanam.com</li>
                <li>+91 98765 43210</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400 text-sm">
            <p>© 2024 Caryanam. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
