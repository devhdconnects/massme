"use client";

export default function AdminConfirmButton({
  label,
  confirmMessage,
  className,
  disabled,
}: {
  label: string;
  confirmMessage: string;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      className={className}
      disabled={disabled}
      onClick={(e) => {
        if (!confirm(confirmMessage)) e.preventDefault();
      }}
    >
      {label}
    </button>
  );
}

