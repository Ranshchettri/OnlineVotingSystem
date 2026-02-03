export default function Badge({
  children,
  variant = "default",
  className = "",
}) {
  const variants = {
    default: "badge-default",
    success: "badge-success",
    warning: "badge-warning",
    danger: "badge-danger",
  };

  return (
    <span className={`badge ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
