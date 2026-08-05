import PropertyCard from "./PropertyCard";
import { motion } from "framer-motion";

import {
  LayoutGrid,
} from "lucide-react";

const container = {
  hidden: {
    opacity: 0,
  },

  show: {
    opacity: 1,

    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const item = {
  hidden: {
    opacity: 0,
    y: 30,
  },

  show: {
    opacity: 1,
    y: 0,

    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
};

// IMPORTANT
const PropertyList = ({
  properties = [],
  onChatClick,
  premiumStatus,
  likedPropertyIds = [],
  onLikeToggle,
  title = "Available Listings",
  emptyTitle = "No properties match your current filters.",
  emptySubtitle = "Try changing filters or search again",
  selectedCategory = "",
  onCategoryToggle,
}) => {
const likedIdSet = new Set(likedPropertyIds.map((id) => String(id)));

return (
    <div className="w-full">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 px-1">

        <div className="flex items-center gap-3">

          <div className="p-3 bg-gradient-to-r from-[#F97316] to-[#EA580C] rounded-2xl shadow-[0_10px_25px_rgba(249,115,22,0.30)]">

            <LayoutGrid
              size={20}
              className="text-white"
            />

          </div>

          <div>

            <h3 className="text-2xl font-black text-[#111827] tracking-tight">
              {title}
            </h3>

            <p className="text-sm text-[#6B7280] font-semibold">

              {properties.length}{" "}

              {properties.length === 1
                ? "Property"
                : "Properties"}{" "}

              Found

            </p>

          </div>

        </div>

        {/* RESIDENTIAL / COMMERCIAL FILTER BUTTONS BESIDE LISTINGS HEADER */}
        {typeof onCategoryToggle === "function" && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => onCategoryToggle("")}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                !selectedCategory || selectedCategory === ""
                  ? "bg-[#F97316] text-white shadow-[0_4px_14px_rgba(249,115,22,0.35)]"
                  : "bg-white text-[#374151] border border-[#E5E7EB] hover:bg-[#F9FAFB]"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => onCategoryToggle("RESIDENTIAL")}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                selectedCategory === "RESIDENTIAL"
                  ? "bg-[#F97316] text-white shadow-[0_4px_14px_rgba(249,115,22,0.35)]"
                  : "bg-white text-[#374151] border border-[#E5E7EB] hover:bg-[#F9FAFB]"
              }`}
            >
              Residential
            </button>
            <button
              type="button"
              onClick={() => onCategoryToggle("COMMERCIAL")}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                selectedCategory === "COMMERCIAL"
                  ? "bg-[#F97316] text-white shadow-[0_4px_14px_rgba(249,115,22,0.35)]"
                  : "bg-white text-[#374151] border border-[#E5E7EB] hover:bg-[#F9FAFB]"
              }`}
            >
              Commercial
            </button>
          </div>
        )}

      </div>

      {/* PROPERTY GRID */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
      >

        {properties.length > 0 ? (

          properties.map(
            (p, index) => {

              const propertyId =
                p?.id ||
                p?.propertyId ||
                p?._id ||
                `${p?.title || "property"}-${index}`;

              return (

                <motion.div
                  key={`${propertyId}-${index}`}
                  variants={item}
                  className="h-full"
                >

                  {/* UPDATED */}
                  <PropertyCard
                    property={{
                      ...p,

                      // ALWAYS SHOW TYPE
                      type:
                        p?.type ||
                        p?.propertyType ||
                        "PROPERTY",

                      // ALWAYS SHOW LOCATION
                      location:
                        p?.location ||
                        `${p?.city || ""} ${p?.address || ""}`.trim() ||
                        "Location Not Available",
                    }}

                    onChatClick={
                      onChatClick
                    }

                    premiumStatus={
                      premiumStatus
                    }
                    isLiked={
                      likedIdSet.has(String(propertyId))
                    }
                    onLikeToggle={
                      onLikeToggle
                    }
                  />

                </motion.div>

              );
            }
          )

        ) : (

          <div className="col-span-full flex flex-col items-center justify-center py-20 bg-gradient-to-br from-[#020617] via-[#041833] to-[#020617] rounded-3xl border border-[#1E293B] shadow-2xl">

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-[#F97316] to-[#EA580C] flex items-center justify-center mb-4 shadow-[0_10px_30px_rgba(249,115,22,0.35)]">

              <LayoutGrid
                size={28}
                className="text-white"
              />

            </div>

            <p className="text-[#E2E8F0] font-semibold text-lg">
              {emptyTitle}
            </p>

            <p className="text-[#94A3B8] text-sm mt-2">
              {emptySubtitle}
            </p>

          </div>

        )}

      </motion.div>

    </div>
  );
};

export default PropertyList;
