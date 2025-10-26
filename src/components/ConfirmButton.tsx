"use client";

import React from "react";

type Props = {
  message: string;
  className?: string;
  children: React.ReactNode;
};

export default function ConfirmButton({ message, className, children }: Props) {
  return (
    <button
      className={className}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
      type="submit"
    >
      {children}
    </button>
  );
}
