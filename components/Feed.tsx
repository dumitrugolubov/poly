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

  // Convert oklab/oklch colors to RGB (html2canvas doesn't support them)
  const convertOklabColors = (element: HTMLElement) => {
    const allElements = element.querySelectorAll('*');
    const colorProps = ['color', 'backgroundColor', 'borderColor', 'borderTopColor', 'borderBottomColor', 'borderLeftColor', 'borderRightColor'];

    const convertElement = (el: Element) => {
      const computed = window.getComputedStyle(el);
      const htmlEl = el as HTMLElement;

      colorProps.forEach(prop => {
        const value = computed.getPropertyValue(prop.replace(/([A-Z])/g, '-$1').toLowerCase());
        if (value && (value.includes('oklab') || value.includes('oklch'))) {
          // Replace with fallback colors based on common Tailwind classes
          if (value.includes('green') || htmlEl.classList.contains('text-green-400')) {
            htmlEl.style.setProperty(prop.replace(/([A-Z])/g, '-$1').toLowerCase(), '#4ade80', 'important');
          } else if (value.includes('red') || htmlEl.classList.contains('text-red-400')) {
            htmlEl.style.setProperty(prop.replace(/([A-Z])/g, '-$1').toLowerCase(), '#f87171', 'important');
          } else if (value.includes('purple') || htmlEl.classList.contains('text-purple-500')) {
            htmlEl.style.setProperty(prop.replace(/([A-Z])/g, '-$1').toLowerCase(), '#a855f7', 'important');
          } else if (value.includes('yellow') || htmlEl.classList.contains('text-yellow-400')) {
            htmlEl.style.setProperty(prop.replace(/([A-Z])/g, '-$1').toLowerCase(), '#facc15', 'important');
          } else if (value.includes('blue') || htmlEl.classList.contains('text-blue-400')) {
            htmlEl.style.setProperty(prop.replace(/([A-Z])/g, '-$1').toLowerCase(), '#60a5fa', 'important');
          } else {
            // Default to white for text
            htmlEl.style.setProperty(prop.replace(/([A-Z])/g, '-$1').toLowerCase(), '#ffffff', 'important');
          }
        }
      });
    };

    convertElement(element);
    allElements.forEach(convertElement);
  };

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

      // Convert oklab colors before rendering
      convertOklabColors(wrapper);

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
            // Also convert colors in the cloned document
            convertOklabColors(clonedWrapper);
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
