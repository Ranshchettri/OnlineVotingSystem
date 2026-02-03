export default function Card({ children, className = "", ...props }) {
  return (
    <div className={`card-wrapper ${className}`} {...props}>
      {children}
    </div>
  );
}
