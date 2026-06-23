import { jwtDecode } from "jwt-decode";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Crown, ExternalLink, ShieldCheck } from "lucide-react";
import { paymentApi } from "../services/api";

const BuyPremium = () => {
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(false);

  const findPaymentRedirectUrl = (value, seen = new Set()) => {
    if (!value) return "";
    if (typeof value === "string") {
      const trimmed = value.trim();
      return /^https?:\/\//i.test(trimmed) ? trimmed : "";
    }
    if (typeof value !== "object" || seen.has(value)) return "";
    seen.add(value);

    const preferredKeys = [
      "paymentUrl",
      "paymentURL",
      "checkoutUrl",
      "checkoutURL",
      "redirectUrl",
      "redirectURL",
      "redirect_url",
      "payUrl",
      "payURL",
      "url",
    ];

    for (const key of preferredKeys) {
      const found = findPaymentRedirectUrl(value[key], seen);
      if (found) return found;
    }

    for (const item of Object.values(value)) {
      const found = findPaymentRedirectUrl(item, seen);
      if (found) return found;
    }

    return "";
  };

  const getPaymentErrorMessage = (error) => {
    const message = error.response?.data?.message || error.message || "";

    if (message && message !== "Something went wrong") {
      return message;
    }

    if (error.response?.status >= 500) {
      return "Payment gateway is not ready on the backend. Please try with the local backend or deploy the latest payment API.";
    }

    return "Failed to initiate payment";
  };

  const getLoggedInUser = () => {
    const token = localStorage.getItem("userToken");

    if (!token) {
      toast.error("Please login first");
      return null;
    }

    const decoded = jwtDecode(token);
    const userId =
      decoded.userId ||
      decoded.userID ||
      decoded.user_id ||
      decoded.id ||
      decoded.sub;

    if (!userId) {
      toast.error("User ID missing from session");
      return null;
    }

    return { token, userId };
  };

  const handlePremiumRequest = async () => {
    const session = getLoggedInUser();
    if (!session) return;

    try {
      setLoading(true);

      const response = await paymentApi.buyUserPremium(session.userId);
      const paymentData = response?.data?.data || response?.data || {};

      const normalizedPayment = {
        status: "PENDING",
        ...paymentData,
      };

      setPayment(normalizedPayment);

      const paymentUrl = findPaymentRedirectUrl(response?.data);

      if (paymentUrl) {
        toast.success("Payment initiated");
        localStorage.setItem(
          "lastPaymentContext",
          JSON.stringify({
            type: "user",
            userId: session.userId,
            orderId: normalizedPayment.orderId,
            timestamp: Date.now()
          })
        );
        localStorage.setItem(
          "lastUserPaymentContext",
          JSON.stringify({
            type: "user",
            userId: session.userId,
            orderId: normalizedPayment.orderId,
            timestamp: Date.now()
          })
        );
        window.location.href = paymentUrl;
        return;
      } else {
        throw new Error("Invalid response payload from gateway");
      }
    } catch (error) {
      const errorMessage = String(error.response?.data?.message || "");

      if (
        errorMessage === "Payment already in process" ||
        errorMessage.toLowerCase().includes("already pending")
      ) {
        toast.info("Your premium payment is already pending");
        navigate("/user");
        return;
      }

      if (
        errorMessage.toLowerCase().includes("already approved") ||
        errorMessage.toLowerCase().includes("already active")
      ) {
        toast.info("Premium already activated");
        navigate("/user");
        return;
      }

      toast.error(getPaymentErrorMessage(error));
      navigate("/user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 flex items-center justify-center px-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-5 sm:p-8 text-center border border-amber-100"
      >
        <div className="flex justify-center mb-4">
          <div className="bg-amber-500 text-white p-4 rounded-full shadow-lg">
            <Crown size={30} />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-amber-900">
          Get Direct Owner Access
        </h1>

        <p className="text-amber-700 mt-2 mb-6 text-sm">
          Unlock premium properties and contact details instantly.
        </p>

        <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 text-left">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-amber-950">
                Premium Access
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Pay Rs. 99 + GST through PhonePe gateway.
              </p>
            </div>

            <div className="text-right">
              <p className="text-2xl font-black text-amber-950">Rs. 116.82</p>
              <p className="text-xs text-amber-700">inclusive of GST</p>
            </div>
          </div>

          {payment?.orderId && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-white p-3 text-xs text-amber-900">
              <p className="font-bold">Order ID</p>
              <p className="break-all mt-1">{payment.orderId}</p>
              <p className="mt-2">Status: {payment.status || "PENDING"}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 mt-4 text-sm text-amber-700">
          <ShieldCheck size={16} />
          Secure payment via PhonePe
        </div>

        <button
          onClick={handlePremiumRequest}
          disabled={loading}
          className="w-full mt-6 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition duration-200 shadow-md disabled:bg-amber-300"
        >
          <span className="inline-flex items-center justify-center gap-2">
            <ExternalLink size={18} />
            {loading ? "Starting Payment..." : "Pay with PhonePe"}
          </span>
        </button>

        <button
          onClick={() => navigate("/user")}
          className="w-full mt-3 py-3 border border-amber-200 rounded-xl text-amber-800 hover:bg-amber-50 transition duration-200"
        >
          Back to Browse
        </button>
      </motion.div>
    </div>
  );
};

export default BuyPremium;
