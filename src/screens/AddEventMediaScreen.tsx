import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import {
  launchImageLibrary,
  ImagePickerResponse,
} from 'react-native-image-picker';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import {
  ScreenLayout,
  ScreenHeader,
  FloatingActionButton,
} from '../components';
import { Colors } from '../constants/colors';
import { Spacing, FontSizes, BorderRadius } from '../constants/spacing';
import { RootStackParamList } from '../types';
import { eventService } from '../services';

type AddEventMediaRouteProp = RouteProp<RootStackParamList, 'AddEventMedia'>;

interface ImageAsset {
  uri: string;
  type?: string;
  fileName?: string;
  fileSize?: number;
}

export const AddEventMediaScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<AddEventMediaRouteProp>();
  const { eventData } = route.params;

  const [coverImage, setCoverImage] = useState<ImageAsset | null>(null);
  const [portraitImage, setPortraitImage] = useState<ImageAsset | null>(null);
  const [galleryImages, setGalleryImages] = useState<ImageAsset[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');

  const MAX_GALLERY_IMAGES = 10;
  const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

  const requestPhotoPermission = async (): Promise<boolean> => {
    try {
      let permission;

      if (Platform.OS === 'ios') {
        permission = PERMISSIONS.IOS.PHOTO_LIBRARY;
      } else {
        // For Android 13+ (API 33+) use READ_MEDIA_IMAGES, for older versions use READ_EXTERNAL_STORAGE
        const androidVersion = Platform.Version as number;
        permission =
          androidVersion >= 33
            ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
            : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
      }

      const result = await request(permission);

      if (result === RESULTS.GRANTED || result === RESULTS.LIMITED) {
        return true;
      } else if (result === RESULTS.DENIED) {
        Alert.alert(
          'Permission Denied',
          'Please grant photo library access in your device settings to select images.',
        );
        return false;
      } else {
        Alert.alert(
          'Permission Required',
          'Please grant photo library access to select images.',
        );
        return false;
      }
    } catch (error) {
      console.error('Error requesting photo permission:', error);
      Alert.alert('Error', 'Failed to request photo library permission.');
      return false;
    }
  };

  const handleSelectCoverImage = async () => {
    const hasPermission = await requestPhotoPermission();
    if (!hasPermission) {
      return;
    }

    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.6, // Reduced quality for faster uploads
        maxWidth: 1920, // Limit width to reduce file size
        maxHeight: 1920, // Limit height to reduce file size
        selectionLimit: 1,
      },
      (response: ImagePickerResponse) => {
        if (response.didCancel) {
          return;
        }

        if (response.errorMessage) {
          Alert.alert('Error', response.errorMessage);
          return;
        }

        if (response.assets && response.assets.length > 0) {
          const asset = response.assets[0];

          if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE) {
            Alert.alert(
              'File Too Large',
              'Maximum file size is 15MB per image. Please select a smaller image.',
            );
            return;
          }

          setCoverImage({
            uri: asset.uri || '',
            type: asset.type,
            fileName: asset.fileName,
            fileSize: asset.fileSize,
          });
        }
      },
    );
  };

  const handleSelectPortraitImage = async () => {
    const hasPermission = await requestPhotoPermission();
    if (!hasPermission) {
      return;
    }

    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.6, // Reduced quality for faster uploads
        maxWidth: 1920, // Limit width to reduce file size
        maxHeight: 1920, // Limit height to reduce file size
        selectionLimit: 1,
      },
      (response: ImagePickerResponse) => {
        if (response.didCancel) {
          return;
        }

        if (response.errorMessage) {
          Alert.alert('Error', response.errorMessage);
          return;
        }

        if (response.assets && response.assets.length > 0) {
          const asset = response.assets[0];

          if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE) {
            Alert.alert(
              'File Too Large',
              'Maximum file size is 15MB per image. Please select a smaller image.',
            );
            return;
          }

          setPortraitImage({
            uri: asset.uri || '',
            type: asset.type,
            fileName: asset.fileName,
            fileSize: asset.fileSize,
          });
        }
      },
    );
  };

  const handleAddGalleryImages = async () => {
    const remainingSlots = MAX_GALLERY_IMAGES - galleryImages.length;
    if (remainingSlots <= 0) {
      Alert.alert('Limit Reached', 'You can add up to 10 additional photos.');
      return;
    }

    const hasPermission = await requestPhotoPermission();
    if (!hasPermission) {
      return;
    }

    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.6, // Reduced quality for faster uploads
        maxWidth: 1920, // Limit width to reduce file size
        maxHeight: 1920, // Limit height to reduce file size
        selectionLimit: remainingSlots,
      },
      (response: ImagePickerResponse) => {
        if (response.didCancel) {
          return;
        }

        if (response.errorMessage) {
          Alert.alert('Error', response.errorMessage);
          return;
        }

        if (response.assets && response.assets.length > 0) {
          // Validate file sizes
          for (const asset of response.assets) {
            if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE) {
              Alert.alert(
                'File Too Large',
                'Maximum file size is 15MB per image. Please select a smaller image.',
              );
              return;
            }
          }

          const newImages = response.assets.map(asset => ({
            uri: asset.uri || '',
            type: asset.type,
            fileName: asset.fileName,
            fileSize: asset.fileSize,
          }));

          setGalleryImages(
            [...galleryImages, ...newImages].slice(0, MAX_GALLERY_IMAGES),
          );
        }
      },
    );
  };

  const handleRemoveGalleryImage = (index: number) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== index));
  };

  const handlePublishEvent = async () => {
    if (!coverImage) {
      Alert.alert('Validation Error', 'Please upload a cover image');
      return;
    }

    setIsPublishing(true);

    try {
      // Create FormData
      const formData = new FormData();

      // Add event data fields
      // Add simple fields first
      if (eventData.name) formData.append('name', String(eventData.name));
      if (eventData.description)
        formData.append('description', String(eventData.description));
      if (eventData.startDate)
        formData.append('startDate', String(eventData.startDate));
      if (eventData.endDate)
        formData.append('endDate', String(eventData.endDate));
      if (eventData.startTime)
        formData.append('startTime', String(eventData.startTime));
      if (eventData.endTime)
        formData.append('endTime', String(eventData.endTime));
      if (eventData.timeZone)
        formData.append('timeZone', String(eventData.timeZone));
      if (eventData.location)
        formData.append('location', String(eventData.location));
      if (eventData.visibility)
        formData.append('visibility', String(eventData.visibility));
      if (eventData.type) formData.append('type', String(eventData.type));

      // Handle nested objects - send as JSON strings (backend should parse these)
      if (eventData.venue) {
        formData.append('venue', JSON.stringify(eventData.venue));
      }

      // Handle arrays - send as JSON strings
      if (eventData.scheduleItems && Array.isArray(eventData.scheduleItems)) {
        formData.append(
          'scheduleItems',
          JSON.stringify(eventData.scheduleItems),
        );
      }

      // Add cover image
      const coverImageUri =
        Platform.OS === 'android'
          ? coverImage.uri
          : coverImage.uri.replace('file://', '');
      formData.append('coverImage', {
        uri: coverImageUri,
        type: coverImage.type || 'image/jpeg',
        name: coverImage.fileName || 'cover.jpg',
      } as any);

      // Add portrait image if provided
      if (portraitImage) {
        const portraitImageUri =
          Platform.OS === 'android'
            ? portraitImage.uri
            : portraitImage.uri.replace('file://', '');
        formData.append('portraitImage', {
          uri: portraitImageUri,
          type: portraitImage.type || 'image/jpeg',
          name: portraitImage.fileName || 'portrait.jpg',
        } as any);
      }

      // Add gallery images
      galleryImages.forEach((image, index) => {
        const imageUri =
          Platform.OS === 'android'
            ? image.uri
            : image.uri.replace('file://', '');
        formData.append('galleryImages', {
          uri: imageUri,
          type: image.type || 'image/jpeg',
          name: image.fileName || `gallery-${index}.jpg`,
        } as any);
      });

      setUploadProgress('Uploading images...');
      const response = await eventService.createEventWithMedia(formData);
      setUploadProgress('');

      if (response.success) {
        Alert.alert('Success', 'Event created successfully!', [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back to home/main screen
              navigation.navigate('Main');
            },
          },
        ]);
      } else {
        const errorMessage =
          response.message || response.error || 'Failed to create event';
        Alert.alert('Error', errorMessage);
      }
    } catch (error: any) {
      console.error('Error creating event:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to create event. Please try again.',
      );
    } finally {
      setIsPublishing(false);
    }
  };

  const handleBack = () => {
    // Navigate back to CreateEventScreen with form data preserved
    navigation.navigate('CreateEvent', { initialData: eventData });
  };

  return (
    <ScreenLayout backgroundColor={Colors.backgroundLight}>
      <ScreenHeader
        title="Event Media"
        backIcon="arrow-left"
        onBack={handleBack}
      />

      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Add Visuals Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add Visuals</Text>
            <Text style={styles.sectionDescription}>
              Make your event stand out with high-quality media.
            </Text>
          </View>

          {/* Cover Image Card */}
          <View style={coverImage ? styles.coverCardNoPadding : styles.card}>
            {coverImage ? (
              <>
                <View style={styles.coverImageContainer}>
                  <Image
                    source={{ uri: coverImage.uri }}
                    style={styles.coverImage}
                  />
                  {/* Edit Button */}
                  <TouchableOpacity
                    style={styles.coverEditButton}
                    onPress={handleSelectCoverImage}
                  >
                    <FontAwesome6
                      name="pen"
                      size={14}
                      color={Colors.white}
                      iconStyle="solid"
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.coverImageFooter}>
                  <Text style={styles.recommendedText}>Cover Image</Text>
                  <TouchableOpacity
                    style={styles.replaceButton}
                    onPress={handleSelectCoverImage}
                  >
                    <Text style={styles.replaceButtonText}>Replace</Text>
                    <FontAwesome6
                      name="arrow-rotate-right"
                      size={14}
                      color={Colors.primary}
                      iconStyle="solid"
                    />
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <View style={styles.cardHeader}>
                  <View
                    style={[styles.iconContainer, styles.coverIconContainer]}
                  >
                    <FontAwesome6
                      name="image"
                      size={20}
                      color={Colors.primary}
                      iconStyle="solid"
                    />
                  </View>
                  <View style={styles.requiredTag}>
                    <Text style={styles.requiredText}>REQUIRED</Text>
                  </View>
                </View>
                <Text style={styles.cardTitle}>Cover Image</Text>
                <Text style={styles.cardDescription}>
                  This is the first image guests will see.
                </Text>
                <Text style={styles.cardSubDescription}>
                  Recommended size 16:9.
                </Text>
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={handleSelectCoverImage}
                >
                  <FontAwesome6
                    name="cloud-arrow-up"
                    size={18}
                    color={Colors.white}
                    iconStyle="solid"
                  />
                  <Text style={styles.uploadButtonText}>Upload Cover</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Portrait Image Card */}
          <View
            style={portraitImage ? styles.portraitCardNoPadding : styles.card}
          >
            {portraitImage ? (
              <View style={styles.portraitImageRow}>
                <View style={styles.portraitImageContainer}>
                  <Image
                    source={{ uri: portraitImage.uri }}
                    style={styles.portraitImage}
                  />
                </View>
                <View style={styles.portraitImageContent}>
                  <Text style={styles.cardTitle}>Portrait Image</Text>
                  <Text style={styles.portraitActiveText}>
                    Story-style view active.
                  </Text>
                  <TouchableOpacity
                    style={styles.portraitEditButton}
                    onPress={handleSelectPortraitImage}
                  >
                    <Text style={styles.portraitEditButtonText}>Edit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                <View style={styles.cardHeader}>
                  <View
                    style={[styles.iconContainer, styles.portraitIconContainer]}
                  >
                    <FontAwesome6
                      name="user"
                      size={20}
                      color="#3B82F6"
                      iconStyle="solid"
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.addIconButton}
                    onPress={handleSelectPortraitImage}
                  >
                    <FontAwesome6
                      name="camera"
                      size={16}
                      color="#3B82F6"
                      iconStyle="solid"
                    />
                    <FontAwesome6
                      name="plus"
                      size={12}
                      color="#3B82F6"
                      iconStyle="solid"
                      style={styles.plusOverlay}
                    />
                  </TouchableOpacity>
                </View>
                <Text style={styles.cardTitle}>Portrait Image</Text>
                <Text style={styles.cardDescription}>
                  Perfect for story-style views.
                </Text>
              </>
            )}
          </View>

          {/* Additional Photos Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, styles.galleryIconContainer]}>
                <FontAwesome6
                  name="images"
                  size={20}
                  color="#10B981"
                  iconStyle="solid"
                />
              </View>
              {galleryImages.length < MAX_GALLERY_IMAGES && (
                <TouchableOpacity
                  style={styles.addGalleryButton}
                  onPress={handleAddGalleryImages}
                >
                  <FontAwesome6
                    name="plus"
                    size={18}
                    color="#3B82F6"
                    iconStyle="solid"
                  />
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.cardTitle}>Additional Photos</Text>
            <Text style={styles.gallerySlotsText}>
              {galleryImages.length} of {MAX_GALLERY_IMAGES} slots filled
            </Text>
            {galleryImages.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.galleryScrollView}
                contentContainerStyle={styles.galleryScrollContent}
              >
                {galleryImages.map((image, index) => (
                  <View key={index} style={styles.galleryItem}>
                    <Image
                      source={{ uri: image.uri }}
                      style={styles.galleryImage}
                    />
                    <TouchableOpacity
                      style={styles.removeGalleryButton}
                      onPress={() => handleRemoveGalleryImage(index)}
                    >
                      <FontAwesome6
                        name="xmark"
                        size={12}
                        color={Colors.white}
                        iconStyle="solid"
                      />
                    </TouchableOpacity>
                  </View>
                ))}
                {galleryImages.length < MAX_GALLERY_IMAGES && (
                  <TouchableOpacity
                    style={styles.addGalleryItemButton}
                    onPress={handleAddGalleryImages}
                  >
                    <FontAwesome6
                      name="plus"
                      size={24}
                      color="#3B82F6"
                      iconStyle="solid"
                    />
                  </TouchableOpacity>
                )}
              </ScrollView>
            ) : (
              <TouchableOpacity
                style={{
                  ...styles.addGalleryItemButton,
                  ...styles.emptyGallery,
                }}
                onPress={handleAddGalleryImages}
              >
                <FontAwesome6
                  name="plus"
                  size={24}
                  color="#3B82F6"
                  iconStyle="solid"
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Information Footer */}
          <View style={styles.infoContainer}>
            <View style={styles.infoIcon}>
              <FontAwesome6
                name="circle-info"
                size={18}
                color={Colors.background}
                iconStyle="solid"
              />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoText}>
                Hap supports JPG, PNG and HEIC formats.
              </Text>
              <Text style={styles.infoText}>
                Maximum file size is 5MB per image.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Publish Event Button */}
        <FloatingActionButton
          title={
            isPublishing ? uploadProgress || 'Publishing...' : 'Publish Event'
          }
          onPress={handlePublishEvent}
          disabled={!coverImage || isPublishing}
          loading={isPublishing}
          icon={
            !isPublishing ? (
              <FontAwesome6
                name="check"
                size={18}
                color={Colors.white}
                iconStyle="solid"
              />
            ) : undefined
          }
        />
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: 120,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  sectionDescription: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverIconContainer: {
    backgroundColor: 'rgba(107, 70, 193, 0.1)',
  },
  portraitIconContainer: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  galleryIconContainer: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  requiredTag: {
    backgroundColor: 'rgba(107, 70, 193, 0.1)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  requiredText: {
    fontSize: FontSizes.xs,
    color: Colors.primary,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  cardDescription: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  cardSubDescription: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  uploadButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.white,
  },
  addIconButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  plusOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 2,
  },
  // Cover Image Styles
  coverImageContainer: {
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  coverImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  coverEditButton: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(107, 70, 193, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverImageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  recommendedText: {
    fontSize: FontSizes.md,
    color: Colors.text,
    fontWeight: 700,
  },
  replaceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  replaceButtonText: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: '600',
  },
  // Cover Image Card (no padding when image selected)
  coverCardNoPadding: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: 0,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  // Portrait Image Card (no padding when image selected)
  portraitCardNoPadding: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: 0,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  // Portrait Image Styles
  portraitImageRow: {
    flexDirection: 'row',
    gap: 0,
  },
  portraitImageContainer: {
    width: 100,
    height: 150,
    overflow: 'hidden',
    borderTopLeftRadius: BorderRadius.lg,
    borderBottomLeftRadius: BorderRadius.lg,
  },
  portraitImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  portraitImageContent: {
    flex: 1,
    justifyContent: 'space-between',
    padding: Spacing.lg,
  },
  portraitActiveText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  portraitEditButton: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  portraitEditButtonText: {
    fontSize: FontSizes.sm,
    color: '#3B82F6',
    fontWeight: '600',
  },
  // Gallery Styles
  gallerySlotsText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  galleryScrollView: {
    marginTop: Spacing.sm,
  },
  galleryScrollContent: {
    paddingRight: Spacing.md,
  },
  galleryItem: {
    width: 120,
    height: 120,
    marginRight: Spacing.sm,
    position: 'relative',
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeGalleryButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addGalleryItemButton: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    marginRight: Spacing.sm,
  },
  addGalleryButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(107, 70, 193, 0.1)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  infoIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoTextContainer: {
    flex: 1,
  },
  infoText: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    lineHeight: 20,
  },
  emptyGallery: {
    marginTop: Spacing.md,
  },
});
