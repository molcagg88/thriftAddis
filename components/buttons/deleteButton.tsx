"use client"; // This must be a client component

import { useTransition } from "react";
import { deleteListing } from "@/app/actions";

export function DeleteButton({ id }: { id: string }) {
  // isPending becomes 'true' the moment the action starts
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this?")) {
      startTransition(async () => {
        await deleteListing(id);
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="bg-red-500 disabled:bg-gray-400 text-white p-2 rounded"
    >
      {isPending ? "Deleting..." : "Delete Item"}
    </button>
  );
}
