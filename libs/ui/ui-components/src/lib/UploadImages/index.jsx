import React, { useEffect, useState } from "react";

import styles from "./uploadImages.module.css";

const UploadImages = ({ label, onChange = () => {}, editImageURLs = [] }) => {
  const [images, setImages] = useState([]);
  const [imageURLs, setImageURLs] = useState(editImageURLs || "");

  useEffect(() => {
    if (images.length < 1) return;
    const newImageUrls = images.map(URL.createObjectURL);
    setImageURLs(newImageUrls);
  }, [images]);

  const handleImageUpload = (e) => {
    const images = [...e.target.files];
    setImages(images);
    onChange(images);
  };

  return (
    <div className="flex-col">
      <label className={styles.label} htmlFor="upload-img">
        {label}
      </label>
      <input
        type="file"
        id="upload-img"
        accept="image/*"
        onChange={handleImageUpload}
        className={styles.uploadInput}
      />
      {imageURLs.length > 0 && (
        <div className={styles.previewContainer}>
          {imageURLs?.map((imageSrc, idx) => {
            return (
              <img
                key={idx}
                alt={`Uploaded screenshot ${idx + 1}`}
                className={styles.imagePreview}
                src={
                  imageSrc?.includes("blob")
                    ? imageSrc
                    : `data:image/jpeg;base64, ${imageSrc}`
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export { UploadImages };
