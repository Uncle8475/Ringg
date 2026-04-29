import React, { useState } from 'react';
import { View, Image, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Button, Card, Text } from '../uikit';
import { useTheme } from '../theme';
import Header from '../components/Header';

export default function UploadTestScreen() {
    const theme = useTheme();
    const [image, setImage] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadedUrl, setUploadedUrl] = useState(null);

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            setUploadedUrl(null);
        }
    };

    const uploadImage = async () => {
        if (!image) return;
        setUploading(true);

        try {
            Alert.alert('Unavailable', 'Supabase has been removed from this build.');
        } catch (e) {
            console.error(e);
            Alert.alert('Upload Failed', e.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Header title="Upload Test" />
            <ScrollView contentContainerStyle={styles.content}>
                <Card padding={20}>
                    <Text variant="h3" style={{ marginBottom: 16 }}>Storage Upload</Text>
                    <Text variant="body" style={{ marginBottom: 16, color: theme.textSecondary }}>
                        Select an image from your gallery and upload it to the 'admin-uploads' bucket.
                    </Text>

                    <Button
                        label="Pick an image from gallery"
                        onPress={pickImage}
                        variant="secondary"
                        style={{ marginBottom: 16 }}
                    />

                    {image && (
                        <View style={styles.previewContainer}>
                            <Image source={{ uri: image }} style={styles.image} />
                            <Text variant="caption" style={{ marginTop: 8 }}>Selected Preview</Text>
                        </View>
                    )}

                    {image && !uploadedUrl && (
                        <Button
                            label={uploading ? "Uploading..." : "Upload"}
                            onPress={uploadImage}
                            disabled={uploading}
                            style={{ marginTop: 16 }}
                        />
                    )}

                    {uploading && <ActivityIndicator size="large" color={theme.accent} style={{ marginTop: 20 }} />}

                    {uploadedUrl && (
                        <View style={styles.resultContainer}>
                            <Text variant="bodyStrong" style={{ color: theme.success, marginBottom: 8 }}>✓ Upload Complete</Text>
                            <Image source={{ uri: uploadedUrl }} style={styles.image} />
                            <Text variant="caption" style={{ marginTop: 8, textAlign: 'center' }}>{uploadedUrl}</Text>
                        </View>
                    )}
                </Card>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 20 },
    previewContainer: { alignItems: 'center', marginVertical: 20 },
    image: { width: 250, height: 250, borderRadius: 10, backgroundColor: '#333', resizeMode: 'cover' },
    resultContainer: { marginTop: 30, alignItems: 'center', padding: 15, backgroundColor: 'rgba(61, 220, 151, 0.1)', borderRadius: 10, width: '100%' }
});
