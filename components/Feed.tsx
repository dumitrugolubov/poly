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

    // Extended list of CSS properties that can contain colors
    const colorProps = [
      'color',
      'background-color',
      'background',
      'background-image',
      'border-color',
      'border-top-color',
      'border-bottom-color',
      'border-left-color',
      'border-right-color',
      'fill',
      'stroke'
    ];

    const convertElement = (el: Element) => {
      const computed = window.getComputedStyle(el);
      const htmlEl = el as HTMLElement;

      colorProps.forEach(prop => {
        const value = computed.getPropertyValue(prop);

        // Check if value contains oklab or oklch
        if (value && (value.includes('oklab') || value.includes('oklch'))) {
          // Map to RGB equivalents based on Tailwind color classes
          let replacement = null;

          // Check for gradient classes first
          if (htmlEl.classList.contains('text-gradient-aurora')) {
            htmlEl.style.setProperty('background', 'linear-gradient(to right, rgb(74, 222, 128), rgb(168, 85, 247))', 'important');
            htmlEl.style.setProperty('background-clip', 'text', 'important');
            htmlEl.style.setProperty('-webkit-background-clip', 'text', 'important');
            htmlEl.style.setProperty('-webkit-text-fill-color', 'transparent', 'important');
            return;
          } else if (htmlEl.classList.contains('text-gradient-gold')) {
            htmlEl.style.setProperty('background', 'linear-gradient(to right, rgb(250, 204, 21), rgb(253, 224, 71), rgb(251, 191, 36))', 'important');
            htmlEl.style.setProperty('background-clip', 'text', 'important');
            htmlEl.style.setProperty('-webkit-background-clip', 'text', 'important');
            htmlEl.style.setProperty('-webkit-text-fill-color', 'transparent', 'important');
            return;
          } else if (htmlEl.classList.contains('text-gradient-red')) {
            htmlEl.style.setProperty('background', 'linear-gradient(to right, rgb(248, 113, 113), rgb(236, 72, 153))', 'important');
            htmlEl.style.setProperty('background-clip', 'text', 'important');
            htmlEl.style.setProperty('-webkit-background-clip', 'text', 'important');
            htmlEl.style.setProperty('-webkit-text-fill-color', 'transparent', 'important');
            return;
          }

          // Map individual colors based on class names
          if (htmlEl.classList.contains('text-green-400') || htmlEl.classList.contains('bg-green-400')) {
            replacement = 'rgb(74, 222, 128)';
          } else if (htmlEl.classList.contains('text-green-500') || htmlEl.classList.contains('bg-green-500')) {
            replacement = 'rgb(34, 197, 94)';
          } else if (htmlEl.classList.contains('text-red-400') || htmlEl.classList.contains('bg-red-400')) {
            replacement = 'rgb(248, 113, 113)';
          } else if (htmlEl.classList.contains('text-red-500') || htmlEl.classList.contains('bg-red-500')) {
            replacement = 'rgb(239, 68, 68)';
          } else if (htmlEl.classList.contains('text-purple-500') || htmlEl.classList.contains('bg-purple-500')) {
            replacement = 'rgb(168, 85, 247)';
          } else if (htmlEl.classList.contains('text-purple-600') || htmlEl.classList.contains('bg-purple-600')) {
            replacement = 'rgb(147, 51, 234)';
          } else if (htmlEl.classList.contains('text-yellow-400') || htmlEl.classList.contains('bg-yellow-400')) {
            replacement = 'rgb(250, 204, 21)';
          } else if (htmlEl.classList.contains('text-yellow-500') || htmlEl.classList.contains('bg-yellow-500')) {
            replacement = 'rgb(234, 179, 8)';
          } else if (htmlEl.classList.contains('text-blue-400') || htmlEl.classList.contains('bg-blue-400')) {
            replacement = 'rgb(96, 165, 250)';
          } else if (htmlEl.classList.contains('text-blue-500') || htmlEl.classList.contains('bg-blue-500')) {
            replacement = 'rgb(59, 130, 246)';
          } else if (htmlEl.classList.contains('text-blue-600') || htmlEl.classList.contains('bg-blue-600')) {
            replacement = 'rgb(37, 99, 235)';
          } else if (htmlEl.classList.contains('text-cyan-600') || htmlEl.classList.contains('bg-cyan-600')) {
            replacement = 'rgb(8, 145, 178)';
          } else if (htmlEl.classList.contains('text-pink-500') || htmlEl.classList.contains('bg-pink-500')) {
            replacement = 'rgb(236, 72, 153)';
          } else if (htmlEl.classList.contains('text-amber-400') || htmlEl.classList.contains('bg-amber-400')) {
            replacement = 'rgb(251, 191, 36)';
          } else if (prop === 'color' || prop === 'fill') {
            // Default text/fill color
            replacement = 'rgb(255, 255, 255)';
          } else {
            // Default background color
            replacement = 'rgb(0, 0, 0)';
          }

          if (replacement) {
            htmlEl.style.setProperty(prop, replacement, 'important');
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

      // Wait for all images to load
      const images = wrapper.querySelectorAll('img');
      const imageLoadPromises = Array.from(images).map((img) => {
        return new Promise((resolve) => {
          if (img.complete) {
            resolve(null);
          } else {
            img.onload = () => resolve(null);
            img.onerror = () => {
              console.warn('Failed to load image:', img.src);
              resolve(null); // Resolve anyway to not block
            };
            // Timeout after 5 seconds
            setTimeout(() => resolve(null), 5000);
          }
        });
      });

      await Promise.all(imageLoadPromises);

      // Wait for fonts to fully load
      await new Promise(resolve => setTimeout(resolve, 300));

      // Generate canvas using html2canvas
      const canvas = await html2canvas(wrapper, {
        width: 1200,
        height: 675,
        scale: 2, // High DPI
        backgroundColor: '#000000', // Solid black background
        logging: true, // Enable logging to see errors
        allowTaint: true, // Allow cross-origin images to taint the canvas
        useCORS: false, // Don't use CORS (since we're allowing taint)
        imageTimeout: 0, // No timeout since images are already loaded
        ignoreElements: (element) => {
          // Skip elements that might cause issues
          return false;
        },
        onclone: (clonedDoc) => {
          const clonedWrapper = clonedDoc.body.querySelector('div');
          if (clonedWrapper) {
            // Ensure proper font rendering
            clonedWrapper.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

            // Convert oklab colors in the cloned document
            convertOklabColors(clonedWrapper);

            // Force all images to be visible
            const clonedImages = clonedWrapper.querySelectorAll('img');
            clonedImages.forEach((img) => {
              const htmlImg = img as HTMLImageElement;
              htmlImg.style.display = 'block';
              htmlImg.style.opacity = '1';
            });
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
