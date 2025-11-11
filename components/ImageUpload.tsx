
import React, { useRef, useState } from 'react';
import { UploadIcon } from './Icons';

interface ImageUploadProps {
  onImageUpload: (base64: string) => void;
  uploadedImage: string | null;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUpload, uploadedImage }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onImageUpload(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onImageUpload(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  if (uploadedImage) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <img src={uploadedImage} alt="Uploaded math problem" className="max-w-full max-h-full object-contain rounded-lg shadow-lg" />
        <button
            onClick={handleClick}
            className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm rounded-md transition-colors"
        >
            Upload a different problem
        </button>
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
        />
      </div>
    );
  }

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`w-full h-full flex flex-col items-center justify-center text-center p-4 cursor-pointer transition-colors ${dragActive ? 'bg-slate-700' : 'bg-transparent'}`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <UploadIcon className="w-12 h-12 text-slate-500 mb-4" />
      <p className="text-slate-400 font-semibold">Click or drag a photo</p>
      <p className="text-sm text-slate-500">of your math problem to start</p>
    </div>
  );
};

export default ImageUpload;
