import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../src/components/icons';
import { isoDateFor } from '../src/lib/dateGroup';
import { safePush } from '../src/lib/navGuard';
import { scanReceipt } from '../src/lib/receiptOcr';
import { darkColors, radius, spacing } from '../src/theme';

export default function ScanReceipt() {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [processing, setProcessing] = useState(false);
  const [badPhoto, setBadPhoto] = useState(false);
  const busyRef = useRef(false);

  async function processImage(uri: string) {
    if (busyRef.current) return;
    busyRef.current = true;
    setProcessing(true);
    try {
      const result = await scanReceipt(uri);
      if (!result) {
        setBadPhoto(true);
        return;
      }
      safePush({
        pathname: '/receipt-review',
        params: {
          amount: String(result.amountPaisas ?? 0),
          merchant: result.merchant ?? '',
          date: result.date ? isoDateFor(result.date) : '',
          dateConfident: result.dateConfident ? '1' : '0',
          category: result.category,
          imageUri: result.imageUri,
        },
      });
    } catch {
      setBadPhoto(true);
    } finally {
      setProcessing(false);
      busyRef.current = false;
    }
  }

  async function handleCapture() {
    if (busyRef.current || !cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.9 });
    if (photo?.uri) await processImage(photo.uri);
  }

  async function handlePickFromGallery() {
    if (busyRef.current) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.9,
    });
    if (!result.canceled && result.assets[0]) {
      await processImage(result.assets[0].uri);
    }
  }

  if (!permission) {
    return <View style={styles.screen} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.screen, styles.permissionWrap]}>
        <StatusBar style="light" />
        <View style={styles.permissionIconWrap}>
          <Icon name="camera" size={26} color={darkColors.textSecondary} />
        </View>
        <Text style={styles.permissionTitle}>Camera access needed</Text>
        <Text style={styles.permissionBody}>
          TabKeep needs your camera to scan receipts and auto-fill expense details.
        </Text>
        <Pressable style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant camera access</Text>
        </Pressable>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text style={styles.permissionCancel}>Cancel</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />

      <Pressable
        style={[styles.closeButton, { top: insets.top + spacing.sm }]}
        onPress={() => router.back()}
        hitSlop={10}
      >
        <Icon name="x" size={20} color="#FFFFFF" />
      </Pressable>

      <View style={styles.frameWrap} pointerEvents="none">
        <View style={styles.frame} />
        <Text style={styles.helperText}>Fit the receipt in the frame · good lighting helps</Text>
      </View>

      <View style={[styles.bottomBar, { bottom: insets.bottom + spacing.lg }]}>
        <Pressable onPress={handlePickFromGallery} hitSlop={12}>
          <Icon name="image" size={24} color="#FFFFFF" />
        </Pressable>
        <Pressable style={styles.shutter} onPress={handleCapture} disabled={processing}>
          {processing ? (
            <ActivityIndicator color="#0A0A0A" />
          ) : (
            <View style={styles.shutterInner} />
          )}
        </Pressable>
        <View style={{ width: 24 }} />
      </View>

      {badPhoto && (
        <View style={styles.dialogOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setBadPhoto(false)} />
          <View style={styles.dialogCard}>
            <View style={styles.dialogIconWrap}>
              <Icon name="warntri" size={24} color={darkColors.warning} />
            </View>
            <Text style={styles.dialogTitle}>Photo isn&apos;t clear enough</Text>
            <Text style={styles.dialogBody}>
              We couldn&apos;t read the receipt clearly. Try retaking it in better light.
            </Text>
            <Pressable style={styles.dialogPrimary} onPress={() => setBadPhoto(false)}>
              <Text style={styles.dialogPrimaryText}>Retake</Text>
            </Pressable>
            <Pressable style={styles.dialogSecondary} onPress={() => router.replace('/add-expense')}>
              <Text style={styles.dialogSecondaryText}>Enter manually</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000000',
  },
  closeButton: {
    position: 'absolute',
    right: spacing.md,
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  frameWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    width: '78%',
    height: '46%',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 16,
  },
  helperText: {
    color: '#FFFFFF',
    opacity: 0.85,
    fontSize: 13,
    textAlign: 'center',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl + spacing.sm,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 60,
  },
  shutter: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
  },
  permissionWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm + 2,
  },
  permissionIconWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: darkColors.bgSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontFamily: 'Inter_600SemiBold',
  },
  permissionBody: {
    color: darkColors.textSecondary,
    fontSize: 13.5,
    textAlign: 'center',
    lineHeight: 20,
  },
  permissionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.button,
    paddingVertical: spacing.sm + 6,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.sm,
  },
  permissionButtonText: {
    color: darkColors.bgPrimary,
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
  },
  permissionCancel: {
    color: darkColors.textSecondary,
    fontSize: 14,
    marginTop: spacing.xs,
  },
  dialogOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogCard: {
    width: '84%',
    backgroundColor: darkColors.bgElevated,
    borderRadius: 18,
    padding: spacing.lg,
  },
  dialogIconWrap: {
    width: 50,
    height: 50,
    borderRadius: radius.full,
    backgroundColor: darkColors.bgSurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm + 2,
  },
  dialogTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: spacing.xs,
  },
  dialogBody: {
    color: darkColors.textSecondary,
    fontSize: 13.5,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  dialogPrimary: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.button,
    paddingVertical: spacing.sm + 5,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  dialogPrimaryText: {
    color: darkColors.bgPrimary,
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
  },
  dialogSecondary: {
    borderWidth: 1,
    borderColor: darkColors.border,
    borderRadius: radius.button,
    paddingVertical: spacing.sm + 5,
    alignItems: 'center',
  },
  dialogSecondaryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
  },
});
