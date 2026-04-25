import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert } from "react-native";
import { User as UserIcon, Pencil, Camera } from "lucide-react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from 'expo-image-picker';
import { FontFamily, FontSize } from "../constants/typography";
import Colors from "../constants/colors";
import { useUploadProfileImageMutation } from "../redux/rtk/authApi";

interface ProfileInfoCardProps {
  profile: {
    name: string;
    email: string;
    age: number | null;
    profile_image: string | null;
  };
}

const ProfileInfoCard = ({ profile }: ProfileInfoCardProps) => {
  const router = useRouter();
  const [uploadImage, { isLoading: isUploading }] = useUploadProfileImageMutation();

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const selectedImage = result.assets[0];
      
      const formData = new FormData();
      // @ts-ignore
      formData.append('file', {
        uri: selectedImage.uri,
        name: selectedImage.fileName || 'profile.jpg',
        type: selectedImage.mimeType || 'image/jpeg',
      });

      try {
        await uploadImage(formData).unwrap();
        Alert.alert("Success", "Profile picture updated successfully!");
      } catch (err: any) {
        Alert.alert("Error", err.data?.message || "Failed to upload image");
      }
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.avatarContainer}>
        <TouchableOpacity style={styles.avatarCircle} onPress={pickImage} disabled={isUploading}>
          {isUploading ? (
            <ActivityIndicator color={Colors.white} />
          ) : profile.profile_image ? (
            <Image 
              source={{ uri: profile.profile_image }} 
              style={styles.avatarImage} 
            />
          ) : (
            <>
              <UserIcon size={40} color="#FFFFFF" />
              <Text style={styles.avatarLabel}>USER PROFILE</Text>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.editBadge}
          onPress={pickImage}
          disabled={isUploading}
        >
          <Camera size={14} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <Text style={styles.name}>{profile.name || 'Anonymous'}</Text>
      <Text style={styles.email}>{profile.email || 'No email provided'}</Text>

      {profile.age && (
        <View style={styles.ageBadge}>
          <Text style={styles.ageText}>Age: {profile.age}</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.editButton}
        onPress={() => router.push("/edit-profile")}
      >
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
    marginBottom: 24,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E5C4A7", // Peach/Tan color from image
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#F1F5F9",
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  avatarLabel: {
    fontSize: 6,
    color: "#FFFFFF",
    fontFamily: FontFamily.bold,
    marginTop: 2,
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#0D2B6E",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  name: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: "#1E293B",
    marginBottom: 4,
  },
  email: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: "#64748B",
    marginBottom: 12,
  },
  ageBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 20,
  },
  ageText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: "#0D2B6E",
  },
  editButton: {
    backgroundColor: "#0D2B6E",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  editButtonText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: "#FFFFFF",
  },
});

export default ProfileInfoCard;
