'use client';

import { useEffect, useState } from 'react';
import { WhaleTrade } from '@/lib/types';
import { fetchWhaleTrades } from '@/lib/polymarket';
import WhaleCard from './WhaleCard';
import html2canvas from 'html2canvas';
import { Loader2 } from 'lucide-react';

export default function Feed() {
  const [trades, setTrades] = useState<WhaleTrade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTrades = async () => {
      setLoading(true);
      const data = await fetchWhaleTrades();
      setTrades(data);
      setLoading(false);
    };

    loadTrades();

    // Refresh every 30 seconds
    const interval = setInterval(loadTrades, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleDownload = async (trade: WhaleTrade) => {
    const cardElement = document.getElementById(`whale-card-${trade.id}`);
    if (!cardElement) {
      console.error('Card element not found');
      alert('Failed to find the card element. Please try again.');
      return;
    }

    try {
      // Show loading state (optional - could add a spinner)
      console.log('Generating image...');

      // Create a wrapper with Aurora gradient background
      const wrapper = document.createElement('div');
      wrapper.style.cssText = `
        position: fixed;
        top: -9999px;
        left: -9999px;
        width: 1200px;
        height: 675px;
        background: linear-gradient(135deg, #000000 0%, #0a1a0f 30%, #1a0f2e 70%, #0f0520 100%);
        padding: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
      `;

      // Clone the card
      const clone = cardElement.cloneNode(true) as HTMLElement;
      clone.style.cssText = `
        margin: 0;
        width: 100%;
        max-width: 1120px;
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: none;
        border: 1px solid rgba(255, 255, 255, 0.2);
      `;

      // Hide action buttons in the clone
      const actionButtons = clone.querySelectorAll('.opacity-0');
      actionButtons.forEach((el) => {
        (el as HTMLElement).style.display = 'none';
      });

      // Make watermark more visible in download
      const watermarks = clone.querySelectorAll('.absolute');
      watermarks.forEach((el) => {
        const element = el as HTMLElement;
        if (element.textContent?.includes('POLYWAVE')) {
          element.style.opacity = '0.6';
        }
      });

      wrapper.appendChild(clone);
      document.body.appendChild(wrapper);

      // Wait for images and fonts to fully load
      await new Promise(resolve => setTimeout(resolve, 500));

      // Generate canvas using html2canvas (more reliable than html-to-image)
      const canvas = await html2canvas(wrapper, {
        width: 1200,
        height: 675,
        scale: 2, // High DPI
        backgroundColor: null,
        logging: false,
        allowTaint: true,
        useCORS: true, // CRITICAL: Enable CORS for external images
        imageTimeout: 15000, // 15 second timeout for images
        onclone: (clonedDoc) => {
          // Ensure fonts are loaded in the cloned document
          const clonedWrapper = clonedDoc.body.querySelector('div');
          if (clonedWrapper) {
            clonedWrapper.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          }
        },
      });

      // Remove wrapper from DOM
      document.body.removeChild(wrapper);

      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error('Failed to generate image blob');
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `polywave-whale-${trade.id}-${Date.now()}.png`;
        link.href = url;
        link.click();

        // Clean up
        setTimeout(() => URL.revokeObjectURL(url), 100);
      }, 'image/png', 1.0);

      console.log('Image generated successfully!');
    } catch (error) {
      console.error('Error generating image:', error);
      document.body.querySelectorAll('div[style*="-9999px"]').forEach(el => el.remove());

      // More specific error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to generate image: ${errorMessage}\n\nThis might be due to CORS restrictions on external images. Please try again or contact support.`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Single column layout for wide horizontal tickets */}
        <div className="space-y-6">
          {trades.map((trade) => (
            <WhaleCard key={trade.id} trade={trade} onDownload={handleDownload} />
          ))}
        </div>
      </div>
    </div>
  );
}
