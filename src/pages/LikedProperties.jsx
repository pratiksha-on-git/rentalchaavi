import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Navbar from "../components/Navbar";
import PropertyList from "../components/PropertyList";
import { propertyApi } from "../services/api";
import {
  FALLBACK_PROPERTY_IMAGE_DATA_URL,
  getPropertyImageCandidates,
} from "../utlis/propertyImages";
import { isPropertyRented } from "../utlis/propertyAvailability";

const getPropertyId = (property) =>
  property?.id ||
  property?.propertyId ||
  property?._id;

const mapBackendToUi = (dto) => {
  const imageCandidates =
    getPropertyImageCandidates(dto);

  return {
    id:
      dto?.id ||
      dto?.propertyId,
    title:
      dto?.title ||
      dto?.propertyName ||
      "Untitled Property",
    propertyType:
      dto?.propertyType ||
      dto?.type ||
      "PROPERTY",
    type:
      dto?.propertyType ||
      dto?.type ||
      "PROPERTY",
    location:
      dto?.location ||
      `${dto?.city || ""} ${dto?.address || ""}`.trim() ||
      "Location Not Available",
    city:
      dto?.city || "",
    address:
      dto?.address || "",
    bhkType:
      dto?.bhkType ||
      dto?.bhk ||
      "",
    price: Number(dto?.price || 0),
    phone:
      dto?.mobileNumber ||
      dto?.mobile ||
      dto?.contactNumber ||
      "Not Available",
    details:
      dto?.description ||
      "No details available",
    image:
      imageCandidates[0] ||
      FALLBACK_PROPERTY_IMAGE_DATA_URL,
    imageCandidates,
    _raw: dto,
  };
};

const LikedProperties = () => {
  const navigate = useNavigate();
  const [properties, setProperties] =
    useState([]);
  const [likedPropertyIds, setLikedPropertyIds] =
    useState([]);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");

  const loadLikedProperties = async () => {
    setLoading(true);
    setError("");

    try {
      const response =
        await propertyApi.getLikedProperties();

      const list =
        Array.isArray(response?.data)
          ? response.data
          : response?.data?.data || [];

      const mapped =
        list
          .filter((property) => !isPropertyRented(property))
          .map(mapBackendToUi);

      setProperties(mapped);
      setLikedPropertyIds(
        mapped
          .map(getPropertyId)
          .filter(Boolean)
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to load liked properties"
      );
      setProperties([]);
      setLikedPropertyIds([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeToggle = async (property) => {
    const propertyId =
      getPropertyId(property);

    if (!propertyId) {
      toast.error("Property id missing");
      return;
    }

    const previousProperties =
      properties;
    const previousIds =
      likedPropertyIds;

    setProperties((current) =>
      current.filter(
        (item) =>
          String(getPropertyId(item)) !==
          String(propertyId)
      )
    );
    setLikedPropertyIds((current) =>
      current.filter(
        (id) =>
          String(id) !== String(propertyId)
      )
    );

    try {
      const response =
        await propertyApi.toggleLikeProperty(
          propertyId
        );

      toast.success(
        response?.data?.message ||
          "Property unliked successfully"
      );
    } catch (err) {
      setProperties(previousProperties);
      setLikedPropertyIds(previousIds);
      toast.error(
        err?.response?.data?.message ||
          "Failed to update liked property"
      );
    }
  };

  useEffect(() => {
    loadLikedProperties();
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F4EF]">
      <ToastContainer position="top-right" autoClose={3000} />
      <Navbar
        likedCount={likedPropertyIds.length}
        onOpenLikedProperties={() =>
          navigate("/liked-properties")
        }
      />

      <main className="max-w-7xl mx-auto px-3 sm:px-5 md:px-6 py-5 sm:py-8">
        <button
          type="button"
          onClick={() => navigate("/user")}
          className="mb-6 text-sm font-bold text-[#374151] hover:text-[#F97316]"
        >
          Back to Properties
        </button>

        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white shadow-[0_10px_25px_rgba(249,115,22,0.30)]">
            <Heart size={22} fill="currentColor" />
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#111827]">
              Liked Properties
            </h1>
            <p className="text-sm font-semibold text-[#6B7280]">
              {likedPropertyIds.length} saved listing
              {likedPropertyIds.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        {loading && (
          <p className="text-[#374151] font-semibold">
            Loading liked properties...
          </p>
        )}

        {error && (
          <p className="text-red-600 font-semibold">
            {error}
          </p>
        )}

        {!loading && !error && (
          <PropertyList
            properties={properties}
            likedPropertyIds={likedPropertyIds}
            onLikeToggle={handleLikeToggle}
            title="Liked Listings"
            emptyTitle="No liked properties yet."
            emptySubtitle="Tap the heart on any property to save it here"
          />
        )}
      </main>
    </div>
  );
};

export default LikedProperties;
