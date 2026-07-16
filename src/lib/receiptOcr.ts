import TextRecognition from '@react-native-ml-kit/text-recognition';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { isReceiptReadable, parseReceiptText, reconstructText } from './receiptParser';

export interface ReceiptScanResult {
  imageUri: string;
  amountPaisas: number | null;
  merchant: string | null;
  date: Date | null;
  dateConfident: boolean;
  category: string;
}

// Downscale before OCR: ML Kit is more reliable on a bounded image size and it's faster too.
async function preprocess(uri: string): Promise<string> {
  const context = ImageManipulator.manipulate(uri).resize({ width: 1600 });
  const imageRef = await context.renderAsync();
  const result = await imageRef.saveAsync({ compress: 0.85, format: SaveFormat.JPEG });
  return result.uri;
}

export async function scanReceipt(rawUri: string): Promise<ReceiptScanResult | null> {
  const processedUri = await preprocess(rawUri);
  const recognized = await TextRecognition.recognize(processedUri);
  const blocks = recognized.blocks ?? [];

  const rowText = reconstructText(
    blocks.map((b) => ({
      lines: b.lines.map((l) => ({
        text: l.text,
        top: l.frame?.top ?? 0,
        left: l.frame?.left ?? 0,
        height: l.frame?.height ?? 1,
      })),
    })),
  );
  const text = rowText || recognized.text;

  if (!isReceiptReadable(text, blocks)) {
    return null;
  }

  const parsed = parseReceiptText(text);
  return {
    imageUri: rawUri,
    amountPaisas: parsed.amountPaisas,
    merchant: parsed.merchant,
    date: parsed.date,
    dateConfident: parsed.date !== null,
    category: parsed.category,
  };
}
