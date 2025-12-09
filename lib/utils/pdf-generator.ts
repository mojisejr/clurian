import { pdf } from '@react-pdf/renderer';
import { OrchardQRDocument } from '@/components/pdf/orchard-qr-document';
import QRCode from 'qrcode';
import type { Tree } from '@/lib/types';

interface QRItem extends Tree {
  url: string;
  qrDataUrl?: string;
}

/**
 * Generate PDF blob with QR codes for trees
 * @param trees - Array of trees to generate QR codes for
 * @param orchardName - Name of the orchard
 * @param logoBase64 - Base64 encoded logo
 * @param onProgress - Progress callback (current, total)
 * @returns PDF Blob
 */
export async function generatePDFBlob(
  trees: Tree[],
  orchardName: string,
  logoBase64: string,
  onProgress?: (current: number, total: number) => void
): Promise<Blob> {
  if (trees.length === 0) {
    throw new Error('No trees to generate PDF for');
  }

  // Generate QR codes for all trees
  const qrData: QRItem[] = [];
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://clurian.vercel.app';

  for (let i = 0; i < trees.length; i++) {
    const tree = trees[i];
    const treeDetailPath = `/dashboard?treeId=${tree.id}`;
    const loginUrl = `${baseUrl}/login?redirect=${encodeURIComponent(treeDetailPath)}`;

    try {
      const qrDataUrl = await QRCode.toDataURL(loginUrl, {
        width: 256,
        margin: 1,
        errorCorrectionLevel: 'M'
      });

      qrData.push({
        ...tree,
        url: loginUrl,
        qrDataUrl
      });

      // Report progress
      if (onProgress) {
        onProgress(i + 1, trees.length);
      }
    } catch (error) {
      console.error(`Failed to generate QR for tree ${tree.code}:`, error);
      // Continue with URL but no QR image
      qrData.push({
        ...tree,
        url: loginUrl
      });
    }
  }

  // Generate PDF from the document
  const doc = OrchardQRDocument({
    trees: qrData,
    orchardName,
    logoUrl: logoBase64
  });

  const blob = await pdf(doc).toBlob();
  return blob;
}
