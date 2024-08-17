import PropTypes from "prop-types";
import React, { useState } from "react";

const Image = ({ src, alt, fallbackSrc, ...props }) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [error, setError] = useState(false);

  const onError = () => {
    if (!error) {
      setImageSrc(fallbackSrc);
      setError(true);
    }
  };

  return <img src={imageSrc} alt={alt} onError={onError} {...props} />;
};

Image.propTypes = {
  src: PropTypes.string,
  fallbackSrc: PropTypes.string,
  alt: PropTypes.string.isRequired,
};

export { Image };
