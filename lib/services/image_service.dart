import 'dart:io';
import 'dart:typed_data';
import 'package:flutter/foundation.dart';
import 'package:image_picker/image_picker.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../constants/app_constants.dart';

class ImageService {
  static final ImageService _instance = ImageService._internal();
  factory ImageService() => _instance;
  ImageService._internal();

  final ImagePicker _imagePicker = ImagePicker();
  final SupabaseClient _supabase = Supabase.instance.client;

  // Pick image from gallery
  Future<Map<String, dynamic>> pickImageFromGallery() async {
    try {
      // Request photo permission
      final permissionStatus = await _requestPhotoPermission();
      if (!permissionStatus) {
        return {
          'success': false,
          'message': 'Photo permission denied',
        };
      }

      final XFile? image = await _imagePicker.pickImage(
        source: ImageSource.gallery,
        maxWidth: 1920,
        maxHeight: 1080,
        imageQuality: 85,
      );

      if (image == null) {
        return {
          'success': false,
          'message': 'No image selected',
        };
      }

      // Validate image
      final validation = await _validateImage(image);
      if (!validation['success']) {
        return validation;
      }

      return {
        'success': true,
        'image': image,
        'path': image.path,
        'name': image.name,
      };
    } catch (e) {
      debugPrint('Pick image from gallery error: $e');
      return {
        'success': false,
        'message': 'Failed to pick image from gallery',
      };
    }
  }

  // Pick image from camera
  Future<Map<String, dynamic>> pickImageFromCamera() async {
    try {
      // Request camera permission
      final permissionStatus = await _requestCameraPermission();
      if (!permissionStatus) {
        return {
          'success': false,
          'message': 'Camera permission denied',
        };
      }

      final XFile? image = await _imagePicker.pickImage(
        source: ImageSource.camera,
        maxWidth: 1920,
        maxHeight: 1080,
        imageQuality: 85,
      );

      if (image == null) {
        return {
          'success': false,
          'message': 'No image captured',
        };
      }

      // Validate image
      final validation = await _validateImage(image);
      if (!validation['success']) {
        return validation;
      }

      return {
        'success': true,
        'image': image,
        'path': image.path,
        'name': image.name,
      };
    } catch (e) {
      debugPrint('Pick image from camera error: $e');
      return {
        'success': false,
        'message': 'Failed to capture image',
      };
    }
  }

  // Pick multiple images
  Future<Map<String, dynamic>> pickMultipleImages() async {
    try {
      // Request photo permission
      final permissionStatus = await _requestPhotoPermission();
      if (!permissionStatus) {
        return {
          'success': false,
          'message': 'Photo permission denied',
        };
      }

      final List<XFile> images = await _imagePicker.pickMultiImage(
        maxWidth: 1920,
        maxHeight: 1080,
        imageQuality: 85,
      );

      if (images.isEmpty) {
        return {
          'success': false,
          'message': 'No images selected',
        };
      }

      // Validate all images
      final List<XFile> validImages = [];
      for (final image in images) {
        final validation = await _validateImage(image);
        if (validation['success']) {
          validImages.add(image);
        }
      }

      if (validImages.isEmpty) {
        return {
          'success': false,
          'message': 'No valid images selected',
        };
      }

      return {
        'success': true,
        'images': validImages,
        'count': validImages.length,
      };
    } catch (e) {
      debugPrint('Pick multiple images error: $e');
      return {
        'success': false,
        'message': 'Failed to pick images',
      };
    }
  }

  // Upload image to Supabase storage
  Future<Map<String, dynamic>> uploadImage(
    XFile image, {
    required String bucket,
    required String path,
  }) async {
    try {
      final File file = File(image.path);
      final bytes = await file.readAsBytes();

      // Create unique filename
      final timestamp = DateTime.now().millisecondsSinceEpoch;
      final extension = image.path.split('.').last;
      final filename = '${path}_$timestamp.$extension';

      // Upload to Supabase Storage
      final response = await _supabase.storage
          .from(bucket)
          .uploadBinary(filename, bytes, fileOptions: FileOptions(
            contentType: 'image/$extension',
          ));

      // Get public URL
      final publicUrl = _supabase.storage
          .from(bucket)
          .getPublicUrl(filename);

      return {
        'success': true,
        'url': publicUrl,
        'path': filename,
        'bucket': bucket,
      };
    } catch (e) {
      debugPrint('Upload image error: $e');
      return {
        'success': false,
        'message': 'Failed to upload image',
      };
    }
  }

  // Upload multiple images
  Future<Map<String, dynamic>> uploadMultipleImages(
    List<XFile> images, {
    required String bucket,
    required String basePath,
  }) async {
    try {
      final List<Map<String, dynamic>> uploadResults = [];
      final List<String> errors = [];

      for (int i = 0; i < images.length; i++) {
        final image = images[i];
        final path = '${basePath}_$i';
        
        final result = await uploadImage(image, bucket: bucket, path: path);
        
        if (result['success']) {
          uploadResults.add(result);
        } else {
          errors.add('Image ${i + 1}: ${result['message']}');
        }
      }

      if (uploadResults.isEmpty) {
        return {
          'success': false,
          'message': 'Failed to upload any images',
          'errors': errors,
        };
      }

      return {
        'success': true,
        'uploads': uploadResults,
        'uploaded_count': uploadResults.length,
        'failed_count': errors.length,
        'errors': errors,
      };
    } catch (e) {
      debugPrint('Upload multiple images error: $e');
      return {
        'success': false,
        'message': 'Failed to upload images',
      };
    }
  }

  // Delete image from Supabase storage
  Future<Map<String, dynamic>> deleteImage(String bucket, String path) async {
    try {
      await _supabase.storage
          .from(bucket)
          .remove([path]);

      return {
        'success': true,
        'message': 'Image deleted successfully',
      };
    } catch (e) {
      debugPrint('Delete image error: $e');
      return {
        'success': false,
        'message': 'Failed to delete image',
      };
    }
  }

  // Validate image file
  Future<Map<String, dynamic>> _validateImage(XFile image) async {
    try {
      // Check file size
      final file = File(image.path);
      final fileSize = await file.length();
      
      if (fileSize > AppConstants.maxImageSize) {
        return {
          'success': false,
          'message': 'Image size exceeds 5MB limit',
        };
      }

      // Check file type
      final extension = image.path.split('.').last.toLowerCase();
      if (!AppConstants.allowedImageTypes.contains(extension)) {
        return {
          'success': false,
          'message': 'Invalid image format. Only JPG, JPEG, and PNG are allowed',
        };
      }

      return {
        'success': true,
        'message': 'Image validation passed',
      };
    } catch (e) {
      debugPrint('Validate image error: $e');
      return {
        'success': false,
        'message': 'Failed to validate image',
      };
    }
  }

  // Request camera permission
  Future<bool> _requestCameraPermission() async {
    try {
      final status = await Permission.camera.request();
      return status.isGranted;
    } catch (e) {
      debugPrint('Request camera permission error: $e');
      return false;
    }
  }

  // Request photo permission
  Future<bool> _requestPhotoPermission() async {
    try {
      final status = await Permission.photos.request();
      return status.isGranted;
    } catch (e) {
      debugPrint('Request photo permission error: $e');
      return false;
    }
  }

  // Show image selection dialog
  Future<Map<String, dynamic>> showImagePickerDialog() async {
    // This would typically show a dialog in the UI
    // For now, we'll return options that the UI can use
    return {
      'options': [
        {'title': 'Camera', 'icon': 'camera', 'action': 'camera'},
        {'title': 'Gallery', 'icon': 'photo_library', 'action': 'gallery'},
      ],
    };
  }

  // Get image file info
  Future<Map<String, dynamic>> getImageInfo(XFile image) async {
    try {
      final file = File(image.path);
      final fileSize = await file.length();
      final lastModified = await file.lastModified();

      return {
        'name': image.name,
        'path': image.path,
        'size': fileSize,
        'size_mb': (fileSize / (1024 * 1024)).toStringAsFixed(2),
        'last_modified': lastModified,
        'extension': image.path.split('.').last,
      };
    } catch (e) {
      debugPrint('Get image info error: $e');
      return {
        'error': 'Failed to get image info',
      };
    }
  }

  // Compress image
  Future<Map<String, dynamic>> compressImage(XFile image, {int quality = 85}) async {
    try {
      final compressedImage = await _imagePicker.pickImage(
        source: ImageSource.gallery,
        maxWidth: 1920,
        maxHeight: 1080,
        imageQuality: quality,
      );

      if (compressedImage == null) {
        return {
          'success': false,
          'message': 'Failed to compress image',
        };
      }

      return {
        'success': true,
        'image': compressedImage,
        'original_size': await File(image.path).length(),
        'compressed_size': await File(compressedImage.path).length(),
      };
    } catch (e) {
      debugPrint('Compress image error: $e');
      return {
        'success': false,
        'message': 'Failed to compress image',
      };
    }
  }
}