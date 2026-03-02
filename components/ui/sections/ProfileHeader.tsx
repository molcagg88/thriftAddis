"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Edit,
  Instagram,
  MessageCircle,
  Heart,
  Phone,
  PhoneCall,
  Paperclip,
} from "lucide-react";
import { FaPlane, FaTelegram, FaTelegramPlane } from "react-icons/fa";
import { Profile } from "@/types";

interface ProfileHeaderProps {
  seller: Profile;
  showEdit?: boolean;
  editHref?: string;
}

export default function ProfileHeader({
  seller,
  showEdit,
  editHref,
}: ProfileHeaderProps) {
  const [followed, setFollowed] = useState(false);

  return (
    <section className="pt-20 md:pt-8 px-4 md:px-6 py-8 md:py-12 bg-white border-b-2 border-green-600">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 items-start md:items-center">
        {/* Avatar */}
        <div className="w-28 h-28 md:w-36 md:h-36 shrink-0 rounded-full overflow-hidden border-2 border-green-600 bg-gray-100 shadow-md">
          {seller.avatar_url ? (
            <Image
              src={seller.avatar_url}
              alt={`${seller.display_name || seller.username} avatar`}
              width={140}
              height={140}
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-3xl text-green-600 font-bold">
              {seller.display_name?.slice(0, 1) || seller.username?.slice(0, 1)}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {seller.display_name || seller.username}
            </h1>
            <p className="text-sm text-green-600 font-semibold mt-1">
              @{seller.username}
            </p>
            <p className="mt-4 text-sm text-gray-600">{seller.bio}</p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              {seller.contact_info?.phone && (
                <a
                  href={`tel:${seller.contact_info.phone}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 bg-white border-2 border-green-600 text-green-600 rounded-md hover:bg-green-50"
                >
                  <PhoneCall size={16} />
                  View Phone
                </a>
              )}

              {seller.contact_info?.instagram && (
                <a
                  href={`https://instagram.com/${seller.contact_info.instagram.replace(/^@/, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 bg-white border-2 border-green-600 text-green-600 rounded-md hover:bg-green-50"
                >
                  <Instagram size={16} />
                  Instagram
                </a>
              )}
              {seller.contact_info?.telegram && (
                <Link
                  href={`https://t.me/${seller.contact_info.telegram}`}
                  type="button"
                  onClick={() => setFollowed((f) => !f)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-md ${followed ? "bg-green-600 text-white" : "bg-white text-green-600 border-2 border-green-600"}`}
                >
                  <FaTelegramPlane size={16} />
                  Telegram
                </Link>
              )}
            </div>
          </div>

          <div className="shrink-0">
            {showEdit && editHref ? (
              <Link
                href={editHref}
                className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md font-bold hover:bg-green-700"
              >
                <Edit size={16} />
                Edit Profile
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
