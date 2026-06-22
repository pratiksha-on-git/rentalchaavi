import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Clock, ArrowRight, RefreshCw, ShieldAlert, Sparkles, Building } from "lucide-react";
import { userApi, paymentApi } from "../services/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PaymentResult = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("checking"); // checking, success, pending_approval, failed
  const [pollCount, setPollCount] = useState(0);
  const [paymentDetails, setPaymentDetails] = useState({
    type: "", // user, property
    id: "",
    orderId: "",
    statusText: "",
    title: ""
  });

  // Maximum number of polling retries
  const MAX_POLLS = 2;
  const POLL_INTERVAL_MS = 6000;

  useEffect(() => {
    // 1. Resolve checkout context
    // Check URL parameters first
    const urlOrderId = searchParams.get("orderId") || searchParams.get("transactionId");
    const urlPropertyId = searchParams.get("propertyId");
    const urlUserId = searchParams.get("userId");
    const urlType = searchParams.get("type"); // user or property
    
    let type = urlType;
    let id = urlPropertyId || urlUserId;
    let orderId = urlOrderId;

    // Fallback to localStorage if URL params are missing
    if (!orderId || !id) {
      try {
        const storedContext = JSON.parse(localStorage.getItem("lastPaymentContext") || "{}");
        // Verify context isn't stale (less than 1 hour old)
        if (storedContext.timestamp && Date.now() - storedContext.timestamp < 3600000) {
          type = type || storedContext.type;
          id = id || storedContext.propertyId || storedContext.userId;
          orderId = orderId || storedContext.orderId;
        }
      } catch (e) {
        console.error("Failed to parse payment context", e);
      }
    }

    // Double fallback: Determine type from active session tokens if not resolved
    if (!type) {
      if (localStorage.getItem("ownerToken")) {
        type = "property";
        id = id || localStorage.getItem("ownerId");
      } else if (localStorage.getItem("userToken")) {
        type = "user";
      }
    }

    setPaymentDetails((prev) => ({
      ...prev,
      type: type || "user",
      id: id || "",
      orderId: orderId || "N/A"
    }));

    if (type === "user" || type === "property") {
      checkStatus(type, id, orderId);
    } else {
      // General fallback if no session context exists
      setLoading(false);
      setStatus("failed");
    }
  }, [searchParams]);

  const checkStatus = async (type, id, orderId) => {
    try {
      if (type === "user") {
        // Resolve userId
        let userId = id;
        if (!userId) {
          const token = localStorage.getItem("userToken");
          if (token) {
            try {
              const payload = JSON.parse(atob(token.split(".")[1]));
              userId = payload.id || payload.userId || payload.sub;
            } catch {
              // ignore
            }
          }
        }

        if (!userId) {
          setLoading(false);
          setStatus("failed");
          return;
        }

        setPaymentDetails(prev => ({ ...prev, id: userId }));
        
        // Call backend API for user premium status
        const response = await userApi.getProfile(userId);
        const userData = response?.data?.data || response?.data || {};
        const pStatus = String(userData.premiumStatus || "").toUpperCase();
        const pActive = !!userData.premiumActive;

        if (pStatus === "APPROVED" || pActive) {
          setStatus("success");
          setLoading(false);
        } else if (pStatus === "PENDING") {
          // If still pending, poll a few times
          handlePolling(type, userId, orderId);
        } else if (pStatus === "REJECTED") {
          setStatus("failed");
          setPaymentDetails(prev => ({ ...prev, statusText: "Premium request rejected by Admin." }));
          setLoading(false);
        } else {
          // Fallback check
          handlePolling(type, userId, orderId);
        }

      } else if (type === "property") {
        if (!id) {
          setLoading(false);
          setStatus("failed");
          return;
        }

        // Call backend API for property status
        const response = await paymentApi.getPropertyPremiumStatus(id);
        const propData = response?.data?.data || response?.data || {};
        const pStatus = String(propData.premiumStatus || "").toUpperCase();
        const payStatus = String(propData.paymentStatus || "").toUpperCase();
        const propName = propData.propertyName || "";

        setPaymentDetails(prev => ({ ...prev, title: propName }));

        if (pStatus.includes("ACTIVE") || payStatus === "APPROVED" || payStatus === "SUCCESS") {
          setStatus("success");
          setLoading(false);
        } else if (payStatus === "PENDING" || payStatus === "PAYMENT_PENDING" || pStatus === "PAYMENT_PENDING") {
          handlePolling(type, id, orderId);
        } else if (payStatus === "REJECTED") {
          setStatus("failed");
          setPaymentDetails(prev => ({ ...prev, statusText: "Property premium payment rejected." }));
          setLoading(false);
        } else {
          handlePolling(type, id, orderId);
        }
      }
    } catch (error) {
      console.error("Error checking payment status", error);
      // On error, let it poll or fallback to pending_approval if we reached limit
      if (pollCount >= MAX_POLLS) {
        setStatus("pending_approval");
        setLoading(false);
      } else {
        handlePolling(type, id, orderId);
      }
    }
  };

  const handlePolling = (type, id, orderId) => {
    if (pollCount < MAX_POLLS) {
      setTimeout(() => {
        setPollCount((prev) => prev + 1);
        checkStatus(type, id, orderId);
      }, POLL_INTERVAL_MS);
    } else {
      // If maximum polls reached and still not approved, mark as pending verification
      setStatus("pending_approval");
      setLoading(false);
    }
  };

  const handleManualRefresh = () => {
    setLoading(true);
    setStatus("checking");
    setPollCount(0);
    checkStatus(paymentDetails.type, paymentDetails.id, paymentDetails.orderId);
  };

  const handleNavigateHome = () => {
    if (paymentDetails.type === "property" || localStorage.getItem("ownerToken")) {
      navigate("/owner");
    } else {
      navigate("/user");
    }
  };

  // UX animation definitions
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const statusIcons = {
    checking: <RefreshCw className="w-16 h-16 text-amber-500 animate-spin" />,
    success: <CheckCircle2 className="w-16 h-16 text-emerald-500" />,
    pending_approval: <Clock className="w-16 h-16 text-amber-500 animate-pulse" />,
    failed: <XCircle className="w-16 h-16 text-red-500" />
  };

  return (
    <div className="min-h-screen bg-[#0F0F12] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] flex flex-col justify-center items-center px-4 py-12 text-white">
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-center relative overflow-hidden"
      >
        {/* Glow ambient backgrounds */}
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-amber-500/10 blur-3xl" />

        {/* Top brand accent */}
        <div className="flex justify-center mb-6">
          <div className="relative p-4 bg-white/5 border border-white/10 rounded-full shadow-inner">
            {statusIcons[status]}
            {status === "success" && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-400 to-orange-500 p-1.5 rounded-full text-black shadow-lg"
              >
                <Sparkles className="w-4 h-4" />
              </motion.div>
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {status === "checking" && (
            <motion.div
              key="checking"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <h2 className="text-2xl font-black tracking-wide bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                Verifying Transaction
              </h2>
              <p className="text-gray-400 mt-2.5 text-sm leading-relaxed px-4">
                We are checking your payment status with PhonePe. Please wait, do not refresh or go back.
              </p>
              {pollCount > 0 && (
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-amber-500/80">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Attempt {pollCount} of {MAX_POLLS}...
                </div>
              )}
            </motion.div>
          )}

          {status === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <h2 className="text-3xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                {paymentDetails.type === "property" ? "Awaiting Activation" : "Payment Successful!"}
              </h2>
              <p className="text-gray-300 mt-2.5 text-sm leading-relaxed">
                {paymentDetails.type === "property"
                  ? "Payment successful! Awaiting admin activation."
                  : "Thank you! Your premium subscription is now fully active. Enjoy unrestricted direct owner contact access."}
              </p>
            </motion.div>
          )}

          {status === "pending_approval" && (
            <motion.div
              key="pending"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <h2 className="text-2xl font-black bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
                Verification Pending
              </h2>
              <p className="text-gray-300 mt-2.5 text-sm leading-relaxed">
                Your payment was received, but the final activation is pending approval or callback response.
              </p>
              <div className="flex items-center justify-center gap-2 mt-4 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>Our team is automatically validating this within minutes.</span>
              </div>
            </motion.div>
          )}

          {status === "failed" && (
            <motion.div
              key="failed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <h2 className="text-2xl font-black bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
                Validation Failed
              </h2>
              <p className="text-gray-300 mt-2.5 text-sm leading-relaxed">
                {paymentDetails.statusText || "We could not verify your premium payment transaction status."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Transaction details card */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 mt-8 text-left text-sm relative">
          <div className="flex justify-between py-2 border-b border-white/5">
            <span className="text-gray-400">Order/Txn ID</span>
            <span className="font-mono text-gray-200 text-xs break-all max-w-[180px] text-right">{paymentDetails.orderId}</span>
          </div>

          <div className="flex justify-between py-2 border-b border-white/5">
            <span className="text-gray-400">Payment Type</span>
            <span className="capitalize text-gray-200 font-medium">
              {paymentDetails.type === "property" ? (
                <span className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5" /> Property Premium
                </span>
              ) : "User Premium"}
            </span>
          </div>

          {paymentDetails.title && (
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-gray-400">Property</span>
              <span className="text-gray-200 font-medium truncate max-w-[180px]">{paymentDetails.title}</span>
            </div>
          )}

          <div className="flex justify-between py-2">
            <span className="text-gray-400">Current Status</span>
            <span className={`font-semibold ${
              status === "success" ? "text-emerald-400" :
              status === "failed" ? "text-red-400" : "text-amber-400 animate-pulse"
            }`}>
              {status === "checking" ? "Verifying..." :
               status === "success" ? "ACTIVE / APPROVED" :
               status === "pending_approval" ? "PENDING APPROVAL" : "FAILED / UNPAID"}
            </span>
          </div>
        </div>

        {/* Action button rows */}
        <div className="mt-8 flex flex-col gap-3">
          {status === "pending_approval" && (
            <button
              onClick={handleManualRefresh}
              disabled={loading}
              className="w-full py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition duration-300 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh Status
            </button>
          )}

          <button
            onClick={handleNavigateHome}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-black font-black rounded-2xl flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(249,115,22,0.35)] transition duration-300"
          >
            {paymentDetails.type === "property" ? "Go to Dashboard" : "Browse Properties"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentResult;
