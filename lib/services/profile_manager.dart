import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class ProfileManager extends ChangeNotifier {
  static final ProfileManager _instance = ProfileManager._internal();
  factory ProfileManager() => _instance;

  /// Mendekode string base64 menjadi ImageProvider secara aman (try-catch)
  static ImageProvider? getProfileImage(String? base64String) {
    if (base64String == null || base64String.trim().isEmpty) return null;
    try {
      final str = base64String.trim();
      // If it's a URL, return NetworkImage
      if (str.startsWith('http://') || str.startsWith('https://')) {
        return NetworkImage(str);
      }
      // If it's a data URL, strip the prefix
      String cleanBase64 = str;
      if (cleanBase64.contains(',')) {
        cleanBase64 = cleanBase64.split(',').last;
      }
      final bytes = base64Decode(cleanBase64);
      if (bytes.isEmpty) return null;
      return MemoryImage(bytes);
    } catch (e) {
      debugPrint("Error decoding base64 image: $e");
      return null;
    }
  }

  ProfileManager._internal() {
    _loadFromPrefs();
  }

  String _name = 'Budi Sudarsono';
  String _email = 'pengguna@email.com';
  String _phone = '+62 812-3456-7890';
  String? _profileImage; // Menyimpan data foto dalam format base64 string

  String get name => _name;
  String get email => _email;
  String get phone => _phone;
  String? get profileImage => _profileImage;

  /// Memuat data profil dari penyimpanan lokal (SharedPreferences)
  Future<void> _loadFromPrefs() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      _name = prefs.getString('profile_name') ?? 'Budi Sudarsono';
      _email = prefs.getString('profile_email') ?? 'pengguna@email.com';
      _phone = prefs.getString('profile_phone') ?? '+62 812-3456-7890';
      _profileImage = prefs.getString('profile_image');
      notifyListeners();
      // After loading local prefs, try to sync with Supabase backend if user is logged in
      await syncWithSupabase();
    } catch (e) {
      debugPrint("Error loading profile from SharedPreferences: $e");
    }
  }

  /// Sync profile fields from Supabase auth user metadata (if available)
  Future<void> syncWithSupabase() async {
    try {
      final client = Supabase.instance.client;
      final user = client.auth.currentUser;
      if (user == null) return;
      final metadata = (user as dynamic).userMetadata ?? (user as dynamic).user_metadata ?? <String, dynamic>{};
      debugPrint('Supabase user id=${user.id} email=${user.email} metadata=$metadata');
      final fullName = (metadata['full_name'] as String?)?.trim();
      final profileImg = (metadata['profile_image'] as String?)?.trim();

      // Update local fields from backend when present
      if (fullName != null && fullName.isNotEmpty) _name = fullName;
      if (user.email != null && user.email!.isNotEmpty) _email = user.email!;
      if (profileImg != null && profileImg.isNotEmpty) _profileImage = profileImg;

      // Persist merged values to local prefs
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('profile_name', _name);
      await prefs.setString('profile_email', _email);
      if (_profileImage != null && _profileImage!.isNotEmpty) {
        await prefs.setString('profile_image', _profileImage!);
      }

      notifyListeners();
    } catch (e) {
      debugPrint("Error syncing profile from Supabase: $e");
    }
  }

  /// Memperbarui data profil secara lokal dan menyimpannya ke SharedPreferences
  Future<void> updateProfile({
    required String name,
    required String email,
    required String phone,
    String? profileImage,
  }) async {
    _name = name;
    _email = email;
    _phone = phone;
    _profileImage = profileImage;
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('profile_name', name);
      await prefs.setString('profile_email', email);
      await prefs.setString('profile_phone', phone);
      if (profileImage != null && profileImage.isNotEmpty) {
        await prefs.setString('profile_image', profileImage);
      } else {
        await prefs.remove('profile_image');
      }
    } catch (e) {
      debugPrint("Error saving profile to SharedPreferences: $e");
    }
    // Try to persist profile to Supabase: upload image to Storage (if base64),
    // update user metadata and upsert into `profiles` table.
    try {
      final client = Supabase.instance.client;
      final user = client.auth.currentUser;
      String? imageToStore = profileImage;

      if (user != null && profileImage != null && profileImage.isNotEmpty) {
        // If profileImage looks like a base64 string, upload to storage
        final isBase64 = profileImage.length > 100 && RegExp(r'^[A-Za-z0-9+/=\s,]+$').hasMatch(profileImage.replaceAll('\n', ''));
        if (isBase64) {
          try {
            // Normalize and decode
            String clean = profileImage;
            if (clean.contains(',')) clean = clean.split(',').last;
            final bytes = base64Decode(clean);
            final path = 'avatars/${user.id}.png';

            // Upload bytes (upsert)
            try {
              await client.storage.from('avatars').uploadBinary(path, bytes, fileOptions: const FileOptions(upsert: true));
            } catch (e) {
              debugPrint('Upload via uploadBinary failed: $e');
              // try upload with simple upload (may work in some versions)
              try {
                await client.storage.from('avatars').upload(path, bytes, fileOptions: const FileOptions(upsert: true));
              } catch (e2) {
                debugPrint('Fallback upload failed: $e2');
                throw e2;
              }
            }

            // Get public URL
            try {
              final urlRes = client.storage.from('avatars').getPublicUrl(path);
              imageToStore = urlRes.toString();
            } catch (e) {
              debugPrint('Failed to obtain public URL: $e');
            }
          } catch (e) {
            debugPrint('Error preparing/uploading avatar: $e');
          }
        }

        // Update user metadata with name and profile image (url or base64)
        try {
          await client.auth.updateUser(UserAttributes(data: {
            'full_name': name,
            'profile_image': imageToStore ?? ''
          }));
        } catch (e) {
          debugPrint('Failed to update user metadata: $e');
        }

        // Upsert into 'profiles' table for richer profile data
        try {
          final upsertData = {
            'id': user.id,
            'full_name': name,
            'email': email,
            'avatar_url': imageToStore ?? ''
          };
          await client.from('profiles').upsert(upsertData);
        } catch (e) {
          debugPrint('Failed to upsert into profiles table: $e');
        }
      } else if (user != null) {
        // No image to upload, still update metadata and profiles table
        try {
          await client.auth.updateUser(UserAttributes(data: {
            'full_name': name,
            'profile_image': imageToStore ?? ''
          }));
        } catch (e) {
          debugPrint('Failed to update user metadata (no image): $e');
        }
        try {
          await client.from('profiles').upsert({
            'id': user.id,
            'full_name': name,
            'email': email,
            'avatar_url': imageToStore ?? ''
          });
        } catch (e) {
          debugPrint('Failed to upsert into profiles table (no image): $e');
        }
      }
    } catch (e) {
      debugPrint("Error updating profile to Supabase: $e");
    }
  }
}
