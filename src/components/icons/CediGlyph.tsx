import React from "react";

interface Props {
  className?: string;
}

const CediGlyph: React.FC<Props> = ({ className = "" }) => {
  return (
    <span
      aria-hidden
      className={"inline-flex items-center justify-center text-primary " + className}
      style={{ lineHeight: 1 }}
    >
      ₵
    </span>
  );
};

export default CediGlyph;
