
import React from 'react';

const PartnerIcon = ({ name }: { name: string }) => {
  switch (name) {
    case 'SAP':
      return (
        <svg viewBox="0 0 100 50" className="w-full h-full">
          <path fill="currentColor" d="M10 10h15l5 15-5 15H10V10z M40 10l5 30h10l5-30H40z M70 10h20v10H80v20H70V10z" />
          <text x="50%" y="32" fontSize="18" fontWeight="900" textAnchor="middle" fill="currentColor">SAP</text>
        </svg>
      );
    case 'Microsoft':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full scale-75">
          <rect x="10" y="10" width="38" height="38" fill="currentColor" opacity="0.6" />
          <rect x="52" y="10" width="38" height="38" fill="currentColor" opacity="0.8" />
          <rect x="10" y="52" width="38" height="38" fill="currentColor" opacity="0.9" />
          <rect x="52" y="52" width="38" height="38" fill="currentColor" />
        </svg>
      );
    case 'Bimser':
      return (
        <svg viewBox="0 0 120 40" className="w-full h-full">
          <text x="60" y="28" fontSize="24" fontWeight="bold" textAnchor="middle" fill="currentColor" letterSpacing="-1">BIMSER</text>
        </svg>
      );
    case 'OpenText':
      return (
        <svg viewBox="0 0 140 40" className="w-full h-full">
          <text x="0" y="28" fontSize="22" fontWeight="bold" fill="currentColor">open</text>
          <text x="55" y="28" fontSize="22" fontWeight="light" fill="currentColor" opacity="0.7">text</text>
          <rect x="110" y="12" width="12" height="12" fill="currentColor" />
        </svg>
      );
    case 'SUSE':
      return (
        <svg viewBox="0 0 100 50" className="w-full h-full">
          <text x="50" y="32" fontSize="18" fontWeight="900" textAnchor="middle" fill="currentColor" letterSpacing="2">SUSE</text>
        </svg>
      );
    case 'RedHat':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full scale-90">
          <path fill="currentColor" d="M50 10C27.9 10 10 27.9 10 50s17.9 40 40 40 40-17.9 40-40-17.9-40-40-40zm20 50H30V40h40v20z" opacity="0.8" />
        </svg>
      );
    case 'ARIS':
      return (
        <svg viewBox="0 0 100 40" className="w-full h-full">
          <text x="50" y="28" fontSize="26" fontWeight="900" textAnchor="middle" fill="currentColor" letterSpacing="4">ARIS</text>
        </svg>
      );
    case 'CodeTwo':
      return (
        <svg viewBox="0 0 140 40" className="w-full h-full">
          <text x="70" y="27" fontSize="16" fontWeight="bold" textAnchor="middle" fill="currentColor">CODE<tspan opacity="0.6">TWO</tspan></text>
        </svg>
      );
    case 'Bentley':
      return (
        <svg viewBox="0 0 100 40" className="w-full h-full">
          <text x="50" y="28" fontSize="20" fontWeight="900" textAnchor="middle" fill="currentColor">Bentley</text>
        </svg>
      );
    case 'Adobe':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full scale-75">
          <path d="M50 5L10 95h20l10-25h20l10 25h20L50 5zM45 55l5-15 5 15H45z" fill="currentColor" />
        </svg>
      );
    default:
      return null;
  }
};

export default PartnerIcon;
